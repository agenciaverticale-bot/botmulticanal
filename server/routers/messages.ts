import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { supportTickets, conversations } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import {
  getConversationsByUserId,
  getMessagesByConversation,
  saveMessage,
  getContactsByUserId,
  getOrCreateContact,
  getOrCreateConversation,
  updateConversationUnreadCount,
  getNotificationSettings,
} from "../db";
import { generateResponseSuggestion } from "../services/llm";

export const messagesRouter = router({
  /**
   * Obter todas as conversas do usuário
   */
  getConversations: protectedProcedure
    .input(
      z.object({
        status: z.enum(["open", "closed", "pending"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const conversations = await getConversationsByUserId(ctx.user.id, input.status);
        const allContacts = await getContactsByUserId(ctx.user.id);

        const enriched = conversations.map((conv: any) => {
          const contactData = allContacts.find((c: any) => c.id === conv.contactId);
          return {
            ...conv,
            contact: contactData || { name: "Desconhecido", phoneNumber: "Sem número" },
          };
        });

        return enriched;
      } catch (error) {
        console.error("[Messages Router] Erro ao buscar conversas:", error);
        return [];
      }
    }),

  /**
   * Obter mensagens de uma conversa
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      return getMessagesByConversation(input.conversationId, input.limit);
    }),

  /**
   * Enviar mensagem manual
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        contactId: z.number(),
        content: z.string().min(1).max(500),
        platform: z.enum(["whatsapp", "instagram"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // TODO: Obter credenciais da API
        // TODO: Enviar mensagem via API externa

        // Salvar mensagem no banco
        const messageId = await saveMessage({
          conversationId: input.conversationId,
          contactId: input.contactId,
          userId: ctx.user.id,
          platform: input.platform,
          direction: "outbound",
          messageType: "text",
          content: input.content,
          status: "sent",
        });

        return { success: true, messageId };
      } catch (error) {
        console.error("[Messages] Erro ao enviar mensagem:", error);
        throw new Error("Falha ao enviar mensagem");
      }
    }),

  /**
   * Obter sugestão de resposta para uma mensagem
   */
  getSuggestion: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        messageContent: z.string(),
        contactName: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const suggestion = await generateResponseSuggestion(
        input.conversationId,
        input.messageContent,
        input.contactName
      );

      return { suggestion };
    }),

  /**
   * Marcar conversa como lida
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateConversationUnreadCount(input.conversationId, 0);
      return { success: true };
    }),

  /**
   * Obter contatos
   */
  getContacts: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["whatsapp", "instagram"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      const allContacts = await getContactsByUserId(ctx.user.id, input.platform);
      
      if (!db) return allContacts;

      // Enriquecer com métricas de chamados e conversas
      const enriched = await Promise.all(allContacts.map(async (c: any) => {
        const tks = await db.select({ id: supportTickets.id }).from(supportTickets).where(eq(supportTickets.contactId, c.id));
        const convs = await db.select({ id: conversations.id }).from(conversations).where(eq(conversations.contactId, c.id));
        return {
          ...c,
          customerCode: `CLI-${String(c.id).padStart(4, '0')}`,
          ticketCount: tks.length,
          interactionsCount: convs.length
        };
      }));
      
      return enriched;
    }),

  /**
   * Obter chamados do contato
   */
  getContactTickets: protectedProcedure
    .input(z.object({ contactId: z.number() }))
    .query(async ({ input }) => {
       const db = await getDb();
       if (!db) return [];
       return db.select().from(supportTickets).where(eq(supportTickets.contactId, input.contactId)).orderBy(desc(supportTickets.createdAt));
    }),

  /**
   * Importar contatos em lote (CSV/Excel)
   */
  importContacts: protectedProcedure
    .input(
      z.object({
        contacts: z.array(
          z.object({
            name: z.string(),
            phoneNumber: z.string(),
            platform: z.enum(["whatsapp", "instagram"]),
            externalId: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let imported = 0;
      for (const contact of input.contacts) {
        try {
          await getOrCreateContact(ctx.user.id, contact.externalId, contact.platform, {
            name: contact.name,
            phoneNumber: contact.phoneNumber,
          });
          imported++;
        } catch (error) {
          console.error("[Messages Router] Erro ao importar contato:", error);
        }
      }
      return { success: true, imported };
    }),

  /**
   * Obter estatísticas do dashboard
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const conversations = await getConversationsByUserId(ctx.user.id);
    const openConversations = conversations.filter((c: any) => c.status === "open");
    const totalUnread = openConversations.reduce((sum: number, c: any) => sum + c.unreadCount, 0);

    const settings = await getNotificationSettings(ctx.user.id);

    return {
      totalConversations: conversations.length,
      openConversations: openConversations.length,
      totalUnread,
      unreadThreshold: settings?.unreadMessageThreshold || 10,
    };
  }),
});
