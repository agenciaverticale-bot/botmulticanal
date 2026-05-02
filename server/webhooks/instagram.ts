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
import { sendInstagramMessage } from "../services/messaging";

const router = Router();

/**
 * Valida webhook do Instagram (Meta Graph API)
 */
function validateWebhook(req: Request, appSecret: string): boolean {
  try {
    const signature = req.headers["x-hub-signature-256"] as string;
    if (!signature) return false;

    const body = JSON.stringify(req.body);
    const hash = crypto.createHmac("sha256", appSecret).update(body).digest("hex");
    const expectedSignature = `sha256=${hash}`;

    return signature === expectedSignature;
  } catch (error) {
    console.error("[Instagram] Erro ao validar webhook:", error);
    return false;
  }
}

/**
 * POST /api/webhooks/instagram
 * Recebe mensagens do Instagram via Meta Graph API
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const appSecret = process.env.INSTAGRAM_APP_SECRET || "";

    // Validar assinatura
    if (!validateWebhook(req, appSecret)) {
      console.warn("[Instagram] Assinatura de webhook inválida");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { object, entry } = req.body;

    if (object !== "instagram") {
      return res.status(400).json({ error: "Invalid object type" });
    }

    // Processar cada entrada
    for (const item of entry || []) {
      const messaging = item.messaging || [];

      for (const message of messaging) {
        const { sender, recipient, message: msg, timestamp } = message;

        if (!sender?.id || !msg?.mid) {
          continue;
        }

        // TODO: Obter userId do recipient.id (mapeamento de página para usuário)
        const userId = 1; // Placeholder

        // Extrair dados do contato
        const senderHandle = sender.id;
        const messageContent = msg.text || msg.attachment?.[0]?.payload?.url || "";

        if (!messageContent) {
          continue;
        }

        // Criar ou atualizar contato
        const contact = await getOrCreateContact(userId, senderHandle, "instagram", {
          instagramHandle: senderHandle,
        });

        // Criar ou obter conversa
        const conversation = await getOrCreateConversation(userId, contact.id, "instagram");

        // Salvar mensagem
        const messageId_db = await saveMessage({
          conversationId: conversation.id,
          contactId: contact.id,
          userId,
          externalMessageId: msg.mid,
          platform: "instagram",
          direction: "inbound",
          messageType: msg.attachment ? "image" : "text",
          content: messageContent,
          mediaUrl: msg.attachment?.[0]?.payload?.url,
          mediaType: msg.attachment?.[0]?.type,
          senderInstagramHandle: senderHandle,
        });

        // Incrementar contador de não lidos
        const currentUnread = conversation.unreadCount + 1;
        await updateConversationUnreadCount(conversation.id, currentUnread);

        // Gerar sugestão de resposta via LLM
        const llmSuggestion = await generateResponseSuggestion(
          conversation.id,
          messageContent,
          contact.name || undefined
        );

        // Analisar sentimento
        const sentiment = await analyzeSentiment(messageContent);

        // Verificar regras de chatbot
        const chatbotMatch = await checkChatbotRules(userId, messageContent, "instagram");

        if (chatbotMatch) {
          // Processar template da resposta
          const response = processTemplate(chatbotMatch.response, {
            contactName: contact.name || "Cliente",
            platform: "instagram",
          });

          // Validar resposta
          if (validateResponse(response)) {
            let messageStatus: "sent" | "delivered" | "read" | "failed" = "sent";

            try {
              await sendInstagramMessage(userId, senderHandle, response);
            } catch (error: unknown) {
              messageStatus = "failed";
              console.error("[Instagram] Erro ao enviar mensagem automática:", error);
              await notifyIntegrationError(userId, "instagram", String(error));
            }

            // Salvar mensagem automática
            await saveMessage({
              conversationId: conversation.id,
              contactId: contact.id,
              userId,
              platform: "instagram",
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
        await notifyNewMessage(
          userId,
          contact.name || senderHandle,
          "instagram",
          messageContent,
          messageId_db,
          conversation.id
        );
        await checkUnreadThreshold(userId, conversation.id);
        await checkImportantKeywords(
          userId,
          messageContent,
          contact.name || senderHandle,
          "instagram",
          messageId_db,
          conversation.id
        );
      }
    }

    // Responder ao webhook
    res.json({ success: true });
  } catch (error) {
    console.error("[Instagram] Erro ao processar webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/webhooks/instagram
 * Validação de webhook do Instagram (desafio)
 */
router.get("/", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN || "";

  if (mode === "subscribe" && token === verifyToken) {
    res.send(challenge);
  } else {
    res.status(403).send("Forbidden");
  }
});

export default router;
