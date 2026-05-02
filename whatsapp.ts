import { Router } from 'express';
import axios from 'axios';
import { getOrCreateContact, getOrCreateConversation, saveMessage, updateConversationUnreadCount } from './server/db';
import { checkChatbotRules, processTemplate, validateResponse } from './server/services/chatbot';

export const whatsappRouter = Router();

// Use os mesmos nomes de variáveis que você configurou no seu .env
const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'https://minha-api-whatsapp-gof4.onrender.com';
const API_KEY = process.env.EVOLUTION_API_KEY || '269b25b90301acfd3f41cad77b9f48df'; 
// Você pode tornar isso dinâmico depois (ex: req.user.id) se tiver múltiplos clientes
const INSTANCE_NAME = 'bot-verticale'; 

// Variável em memória para controlar se o bot está silenciado
let isBotMuted = false;

// Função para buscar resposta da Inteligência Artificial (Groq)
async function getGroqResponse(message: string, userName: string): Promise<string> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  // Puxa a URL do painel ou usa o padrão da Groq/OpenAI
  const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1';
  
  if (!GROQ_API_KEY) return `🤖 Olá ${userName}! Recebi sua mensagem: "${message}".`;
  
  try {
    const response = await axios.post(
      `${GROQ_API_URL}/chat/completions`,
      {
        model: 'openai/gpt-oss-120b', // Modelo que você enviou no snippet
        messages: [
          {
            role: 'system',
            content: `Você é o assistente virtual da Agência Verticale. Seja extremamente prestativo, educado e forneça respostas curtas, amigáveis e objetivas (estamos no WhatsApp). O nome da pessoa com quem você está conversando é ${userName}.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 1,
        max_completion_tokens: 8192,
        top_p: 1,
        reasoning_effort: "medium"
      },
      { headers: { Authorization: `Bearer ${GROQ_API_KEY}` } }
    );
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('❌ Erro na IA da Groq:', error?.response?.data || error.message);
    return `🤖 Olá ${userName}! Recebi sua mensagem, mas meu cérebro (IA) está descansando agora. Em breve um humano te responderá!`;
  }
}

whatsappRouter.get('/mute', (req, res) => {
  res.json({ isMuted: isBotMuted });
});

whatsappRouter.post('/mute', (req, res) => {
  isBotMuted = req.body.isMuted;
  console.log(`[WhatsApp] Status do Bot alterado. Silenciado: ${isBotMuted}`);
  res.json({ isMuted: isBotMuted });
});

whatsappRouter.get('/status', async (req, res) => {
  try {
    const response = await axios.get(
      `${EVOLUTION_URL}/instance/connectionState/${INSTANCE_NAME}`,
      { headers: { apikey: API_KEY } }
    );
    const state = response.data?.instance?.state || 'disconnected';
    
    if (state === 'open') {
      // Garante que a Evolution API vai mandar o webhook para o seu domínio real
      try {
        await axios.post(
          `${EVOLUTION_URL}/webhook/set/${INSTANCE_NAME}`,
          {
            webhook: {
              enabled: true,
              url: "https://crm.agenciaverticale.com.br/api/whatsapp/webhook",
              byEvents: false,
              base64: false,
              events: ["MESSAGES_UPSERT"]
            }
          },
          { headers: { apikey: API_KEY } }
        );
        console.log("✅ Webhook configurado na Evolution API com sucesso!");
      } catch (e: any) { 
        console.error("❌ Erro ao configurar webhook na Evolution:", e.response?.data || e.message);
      }
    }
    res.json({ state });
  } catch (error) {
    res.json({ state: 'disconnected' });
  }
});

whatsappRouter.get('/qrcode', async (req, res) => {
  try {
    // 1. Tenta criar a instância (se ela já existir, a API ignora e seguimos em frente)
    try {
      await axios.post(
        `${EVOLUTION_URL}/instance/create`,
        { 
          instanceName: INSTANCE_NAME,
          integration: "WHATSAPP-BAILEYS"
        },
        { headers: { apikey: API_KEY } }
      );
    } catch (e: any) {
      // A Evolution retorna erro se já existe, podemos ignorar
      console.log('Aviso ao criar instância (pode já existir):', e.response?.data || e.message);
    }

    // 2. Busca o QR Code de conexão (retorna a imagem em Base64)
    const response = await axios.get(
      `${EVOLUTION_URL}/instance/connect/${INSTANCE_NAME}`,
      { headers: { apikey: API_KEY } }
    );

    // Retornamos o base64 direto para o frontend exibir na tag <img>
    res.json({ qrCode: response.data.base64 });
  } catch (error: any) {
    const errorDetail = error.response?.data?.message?.[0] || error.response?.data?.message || error.response?.data?.response?.message || error.message;
    console.error('Erro ao buscar QR Code da Evolution API:', error.response?.data || error.message);
    res.status(500).json({ error: `Falha na Evolution API: ${errorDetail}` });
  }
});

// POST: Rota do Webhook para receber mensagens do WhatsApp (via Evolution API)
whatsappRouter.post('/webhook', async (req, res) => {
  const body = req.body;

  console.log('💬 Webhook recebido da Evolution API:', JSON.stringify(body, null, 2));

  // A Evolution envia o tipo de evento. Queremos capturar novas mensagens (messages.upsert)
  if (body.event === 'messages.upsert' || body.event === 'MESSAGES_UPSERT') {
    if (isBotMuted) {
      console.log('🔇 Bot está silenciado. Ignorando a mensagem recebida.');
      return res.status(200).send('EVENT_RECEIVED');
    }

    const messageData = body.data;
    
    // Ignoramos mensagens enviadas pelo próprio bot/usuário (fromMe: true)
    if (messageData && messageData.key && !messageData.key.fromMe) {
      const senderId = messageData.key.remoteJid; // Ex: 5511999999999@s.whatsapp.net
      
      // O texto da mensagem pode vir em campos diferentes dependendo do tipo da mensagem
      const receivedText = messageData.message?.conversation || messageData.message?.extendedTextMessage?.text;

      if (receivedText) {
        const phoneNumber = senderId.split('@')[0];
        const pushName = messageData.pushName || phoneNumber;

        console.log(`💬 Nova mensagem de ${pushName} (${phoneNumber}): "${receivedText}"`);

        let contactId: number | undefined;
        let conversationId: number | undefined;
        const userId = 1; // ID do seu usuário administrador
        
        // 1. SALVA A MENSAGEM NO BANCO DE DADOS (CRM)
        try {
          const contact = await getOrCreateContact(userId, phoneNumber, "whatsapp", { name: pushName, phoneNumber });
          const conversation = await getOrCreateConversation(userId, contact.id, "whatsapp");
          
          contactId = contact.id;
          conversationId = conversation.id;

          await saveMessage({
            conversationId,
            contactId,
            userId,
            externalMessageId: messageData.key.id,
            platform: "whatsapp",
            direction: "inbound",
            messageType: "text",
            content: receivedText,
            status: "delivered",
          });

          await updateConversationUnreadCount(conversationId, (conversation.unreadCount || 0) + 1);
        } catch (dbError) {
          console.error('❌ Erro ao salvar mensagem no CRM:', dbError);
        }

        // 2. BUSCA REGRAS DO CHATBOT NO BANCO E RESPONDE
        try {
          let replyText = "";
          
          // Verifica se a mensagem bate com alguma palavra-chave cadastrada no painel
          const chatbotMatch = await checkChatbotRules(userId, receivedText, "whatsapp");

          if (chatbotMatch && validateResponse(chatbotMatch.response)) {
            replyText = processTemplate(chatbotMatch.response, {
              contactName: pushName,
              platform: "whatsapp",
            });
          } else {
            // Resposta padrão (Caso não encontre nenhuma regra correspondente)
            replyText = await getGroqResponse(receivedText, pushName);
          }

          // Envia a resposta pelo WhatsApp
          await axios.post(
            `${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`,
            {
              number: senderId,
              text: replyText
            },
            { headers: { apikey: API_KEY } }
          );
          
          // 3. SALVA A RESPOSTA DO BOT NO CRM PARA VOCÊ LER
          if (contactId && conversationId) {
            await saveMessage({
              conversationId, 
              contactId, 
              userId, 
              platform: "whatsapp",
              direction: "outbound", 
              messageType: "text", 
              content: replyText, 
              status: "sent", 
              automatedResponse: true,
            });
          }
        } catch (error: any) {
          console.error('❌ Erro ao processar resposta automática:', error.response?.data || error.message);
        }
      }
    }
  }

  // Retornar 200 OK rapidamente para a API não tentar reenviar a notificação
  res.status(200).send('EVENT_RECEIVED');
});