import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getApiCredential,
  upsertApiCredential,
  getChatbotRules,
  saveChatbotRule,
  updateChatbotRule,
  deleteChatbotRule,
  getNotificationSettings,
  upsertNotificationSettings,
} from "../db";

export const settingsRouter = router({
  /**
   * Obter credenciais de API
   */
  getApiCredentials: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["whatsapp", "instagram"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const credential = await getApiCredential(ctx.user.id, input.platform);

      if (!credential) {
        return null;
      }

      // Não retornar o token completo por segurança
      return {
        id: credential.id,
        platform: credential.platform,
        isActive: credential.isActive,
        phoneNumberId: credential.phoneNumberId,
        businessAccountId: credential.businessAccountId,
        hasToken: !!credential.token,
      };
    }),

  /**
   * Salvar credenciais de API
   */
  saveApiCredentials: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["whatsapp", "instagram"]),
        token: z.string().min(1),
        secretKey: z.string().optional(),
        phoneNumberId: z.string().optional(),
        businessAccountId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await upsertApiCredential(ctx.user.id, input.platform, {
          token: input.token,
          secretKey: input.secretKey,
          phoneNumberId: input.phoneNumberId,
          businessAccountId: input.businessAccountId,
        });

        return { success: true };
      } catch (error) {
        console.error("[Settings] Erro ao salvar credenciais:", error);
        throw new Error("Falha ao salvar credenciais");
      }
    }),

  /**
   * Obter regras de chatbot
   */
  getChatbotRules: protectedProcedure.query(async ({ ctx }) => {
    return getChatbotRules(ctx.user.id);
  }),

  /**
   * Criar nova regra de chatbot
   */
  createChatbotRule: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        triggerKeywords: z.string().min(1),
        responseTemplate: z.string().min(1),
        platform: z.enum(["whatsapp", "instagram", "both"]).default("both"),
        priority: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const ruleId = await saveChatbotRule({
          userId: ctx.user.id,
          name: input.name,
          triggerKeywords: input.triggerKeywords,
          responseTemplate: input.responseTemplate,
          platform: input.platform,
          priority: input.priority,
        });

        return { success: true, ruleId };
      } catch (error) {
        console.error("[Settings] Erro ao criar regra:", error);
        throw new Error("Falha ao criar regra");
      }
    }),

  /**
   * Atualizar regra de chatbot
   */
  updateChatbotRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.number(),
        name: z.string().optional(),
        triggerKeywords: z.string().optional(),
        responseTemplate: z.string().optional(),
        platform: z.enum(["whatsapp", "instagram", "both"]).optional(),
        priority: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { ruleId, ...data } = input;
        await updateChatbotRule(ruleId, data);

        return { success: true };
      } catch (error) {
        console.error("[Settings] Erro ao atualizar regra:", error);
        throw new Error("Falha ao atualizar regra");
      }
    }),

  /**
   * Deletar regra de chatbot
   */
  deleteChatbotRule: protectedProcedure
    .input(
      z.object({
        ruleId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await deleteChatbotRule(input.ruleId);

        return { success: true };
      } catch (error) {
        console.error("[Settings] Erro ao deletar regra:", error);
        throw new Error("Falha ao deletar regra");
      }
    }),

  /**
   * Obter configurações de notificação
   */
  getNotificationSettings: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getNotificationSettings(ctx.user.id);

    return (
      settings || {
        emailNotificationsEnabled: true,
        unreadMessageThreshold: 10,
        notifyOnEveryMessage: false,
        notifyOnImportantKeywords: "",
      }
    );
  }),

  /**
   * Salvar configurações de notificação
   */
  saveNotificationSettings: protectedProcedure
    .input(
      z.object({
        emailNotificationsEnabled: z.boolean().optional(),
        unreadMessageThreshold: z.number().optional(),
        notifyOnEveryMessage: z.boolean().optional(),
        notifyOnImportantKeywords: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await upsertNotificationSettings(ctx.user.id, input);

        return { success: true };
      } catch (error) {
        console.error("[Settings] Erro ao salvar configurações:", error);
        throw new Error("Falha ao salvar configurações");
      }
    }),
});
