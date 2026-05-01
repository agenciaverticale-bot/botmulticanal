import { notifyOwner } from "../_core/notification";
import { saveNotificationLog, getNotificationSettings, getUnreadMessageCount } from "../db";

/**
 * Envia notificação ao dono do projeto quando uma nova mensagem chega
 */
export async function notifyNewMessage(
  userId: number,
  contactName: string,
  platform: "whatsapp" | "instagram",
  messagePreview: string,
  messageId?: number,
  conversationId?: number
): Promise<void> {
  try {
    const settings = await getNotificationSettings(userId);

    if (!settings?.emailNotificationsEnabled) {
      return;
    }

    // Se notifyOnEveryMessage está ativado, enviar notificação
    if (settings.notifyOnEveryMessage) {
      const title = `Nova mensagem de ${contactName} via ${platform === "whatsapp" ? "WhatsApp" : "Instagram"}`;
      const content = `${messagePreview.substring(0, 100)}${messagePreview.length > 100 ? "..." : ""}`;

      await notifyOwner({
        title,
        content,
      });

      await saveNotificationLog({ userId, type: "email", title, content, messageId, conversationId });
    }
  } catch (error) {
    console.error("[Notifications] Erro ao notificar nova mensagem:", error);
  }
}

/**
 * Verifica se o limite de mensagens não respondidas foi ultrapassado e envia notificação
 */
export async function checkUnreadThreshold(userId: number, conversationId?: number): Promise<void> {
  try {
    const settings = await getNotificationSettings(userId);

    if (!settings?.emailNotificationsEnabled) {
      return;
    }

    const unreadCount = await getUnreadMessageCount(userId);

    if (unreadCount >= settings.unreadMessageThreshold) {
      const title = `⚠️ Limite de mensagens não respondidas atingido`;
      const content = `Você tem ${unreadCount} mensagens não respondidas. Acesse seu dashboard para responder.`;

      await notifyOwner({
        title,
        content,
      });

      await saveNotificationLog({ userId, type: "email", title, content, conversationId });
    }
  } catch (error) {
    console.error("[Notifications] Erro ao verificar threshold:", error);
  }
}

/**
 * Verifica se a mensagem contém palavras-chave importantes e envia notificação
 */
export async function checkImportantKeywords(
  userId: number,
  message: string,
  contactName: string,
  platform: "whatsapp" | "instagram",
  messageId?: number,
  conversationId?: number
): Promise<void> {
  try {
    const settings = await getNotificationSettings(userId);

    if (!settings?.emailNotificationsEnabled || !settings.notifyOnImportantKeywords) {
      return;
    }

    const keywords = settings.notifyOnImportantKeywords.split(",").map((k) => k.trim().toLowerCase());

    const messageWords = message.toLowerCase();
    const foundKeywords = keywords.filter((k) => messageWords.includes(k));

    if (foundKeywords.length > 0) {
      const title = `🔔 Mensagem importante de ${contactName}`;
      const content = `Mensagem contém palavras-chave: ${foundKeywords.join(", ")}. Mensagem: "${message.substring(0, 100)}..."`;

      await notifyOwner({
        title,
        content,
      });

      await saveNotificationLog({ userId, type: "email", title, content, messageId, conversationId });
    }
  } catch (error) {
    console.error("[Notifications] Erro ao verificar palavras-chave:", error);
  }
}

/**
 * Envia notificação de erro de integração
 */
export async function notifyIntegrationError(
  userId: number,
  platform: "whatsapp" | "instagram",
  errorMessage: string
): Promise<void> {
  try {
    const title = `❌ Erro na integração com ${platform === "whatsapp" ? "WhatsApp" : "Instagram"}`;
    const content = `Houve um erro ao processar mensagens: ${errorMessage}. Verifique suas credenciais no painel de configurações.`;

    await notifyOwner({
      title,
      content,
    });

      await saveNotificationLog({ userId, type: "email", title, content });
  } catch (error) {
    console.error("[Notifications] Erro ao notificar erro de integração:", error);
  }
}
