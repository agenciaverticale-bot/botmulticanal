import { Router, Request, Response } from "express";
import crypto from "crypto";
import {
  getOrCreateContact,
  getOrCreateConversation,
  saveMessage,
  updateConversationUnreadCount,
} from "../db";
import { generateResponseSuggestion, analyzeSentiment } from "../services/llm";
import { checkChatbotRules, processTemplate, validateResponse } from "../services/chatbot";
import {
  notifyNewMessage,
  checkUnreadThreshold,
  checkImportantKeywords,
  notifyIntegrationError,
} from "../services/notifications";
import { sendWhatsAppMessage } from "../services/messaging";

const router = Router();

/**
 * Valida webhook do WhatsApp (Evolution API)
 */
function validateWebhook(req: Request, signature: string, secret: string): boolean {
  try {
    const body = JSON.stringify(req.body);
    const hash = crypto.createHmac("sha256", secret).update(body).digest("hex");
    return hash === signature;
  } catch (error) {
    console.error("[WhatsApp] Erro ao validar webhook:", error);
    return false;
  }
}

/**
 * POST /api/webhooks/whatsapp
 * Recebe mensagens do WhatsApp via Evolution API
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const signature = req.headers["x-signature"] as string;
    const secret = process.env.WHATSAPP_WEBHOOK_SECRET || "";

    // Validar assinatura
    if (!validateWebhook(req, signature, secret)) {
      console.warn("[WhatsApp] Assinatura de webhook inválida");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { instance, data } = req.body;

    if (!instance || !data) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { messageId, phoneNumber, message, timestamp } = data;

    if (!messageId || !phoneNumber || !message) {
      return res.status(400).json({ error: "Missing message data" });
    }

    // TODO: Obter userId do instance (mapeamento de instância para usuário)
    const userId = 1; // Placeholder

    // Criar ou atualizar contato
    const contact = await getOrCreateContact(userId, phoneNumber, "whatsapp", {
      phoneNumber,
    });

    // Criar ou obter conversa
    const conversation = await getOrCreateConversation(userId, contact.id, "whatsapp");

    // Salvar mensagem
    const messageContent = message.text || message.caption || "";
    const messageId_db = await saveMessage({
      conversationId: conversation.id,
      contactId: contact.id,
      userId,
      externalMessageId: messageId,
      platform: "whatsapp",
      direction: "inbound",
      messageType: message.type || "text",
      content: messageContent,
      mediaUrl: message.media?.url,
      mediaType: message.media?.type,
      senderPhone: phoneNumber,
    });

    // Atualizar contato com última interação
    // TODO: Implementar atualização de lastInteractionAt

    // Incrementar contador de não lidos
    const currentUnread = conversation.unreadCount + 1;
    await updateConversationUnreadCount(conversation.id, currentUnread);

    // Gerar sugestão de resposta via LLM
    const llmSuggestion = await generateResponseSuggestion(conversation.id, messageContent, contact.name || undefined);

    // TODO: Salvar sugestão de LLM na mensagem

    // Analisar sentimento
    const sentiment = await analyzeSentiment(messageContent);

    // Verificar regras de chatbot
    const chatbotMatch = await checkChatbotRules(userId, messageContent, "whatsapp");

    if (chatbotMatch) {
      // Processar template da resposta
      const response = processTemplate(chatbotMatch.response, {
        contactName: contact.name || "Cliente",
        platform: "whatsapp",
      });

      // Validar resposta
      if (validateResponse(response)) {
        let messageStatus = "sent";

        try {
          await sendWhatsAppMessage(userId, phoneNumber, response);
        } catch (error: unknown) {
          messageStatus = "failed";
          console.error("[WhatsApp] Erro ao enviar mensagem automática:", error);
          await notifyIntegrationError(userId, "whatsapp", String(error));
        }

        // Salvar mensagem automática
        await saveMessage({
          conversationId: conversation.id,
          contactId: contact.id,
          userId,
          platform: "whatsapp",
          direction: "outbound",
          messageType: "text",
          content: response,
          status: messageStatus,
          automatedResponse: true,
        });

        if (messageStatus === "sent") {
          await updateConversationUnreadCount(conversation.id, 0);
        }
      }
    }

    // Enviar notificações
    await notifyNewMessage(userId, contact.name || phoneNumber, "whatsapp", messageContent, messageId_db, conversation.id);
    await checkUnreadThreshold(userId, conversation.id);
    await checkImportantKeywords(userId, messageContent, contact.name || phoneNumber, "whatsapp", messageId_db, conversation.id);

    // Responder ao webhook
    res.json({ success: true, messageId: messageId_db });
  } catch (error) {
    console.error("[WhatsApp] Erro ao processar webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/webhooks/whatsapp
 * Validação de webhook do WhatsApp (desafio)
 */
router.get("/", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "";

  if (mode === "subscribe" && token === verifyToken) {
    res.send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
});

export default router;
