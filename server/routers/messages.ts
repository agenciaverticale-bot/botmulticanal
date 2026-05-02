import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
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
      return getContactsByUserId(ctx.user.id, input.platform);
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
