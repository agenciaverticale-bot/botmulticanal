import { Router } from 'express';
import axios from 'axios';
import { getOrCreateContact, getOrCreateConversation, saveMessage, updateConversationUnreadCount } from './server/db';

export const whatsappRouter = Router();

// Use os mesmos nomes de variáveis que você configurou no seu .env
const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'https://minha-api-whatsapp-gof4.onrender.com';
const API_KEY = process.env.EVOLUTION_API_KEY || '269b25b90301acfd3f41cad77b9f48df'; 
// Você pode tornar isso dinâmico depois (ex: req.user.id) se tiver múltiplos clientes
const INSTANCE_NAME = 'bot-verticale'; 

// Variável em memória para controlar se o bot está silenciado
let isBotMuted = false;

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
              url: "https://crm.agenciaverticale.com.br/api/whatsapp/webhook",
              byEvents: false,
              base64: false,
              events: ["MESSAGES_UPSERT"]
            }
          },
          { headers: { apikey: API_KEY } }
        );
      } catch (e) { }
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

  // console.log('💬 Webhook recebido da Evolution API:', JSON.stringify(body, null, 2));

  // A Evolution envia o tipo de evento. Queremos capturar novas mensagens (messages.upsert)
  if (body.event === 'messages.upsert') {
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
        console.log(`💬 Nova mensagem no WhatsApp de ${senderId}: "${receivedText}"`);

        // TODO: Aqui futuramente vai a consulta no seu Supabase para as 'chatbot_rules'
        
        // Envia uma resposta automática de volta usando a Evolution API
        try {
          await axios.post(
            `${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`,
            {
              number: senderId, // Envia de volta para quem mandou
              text: `🤖 Olá! Recebi sua mensagem: "${receivedText}". Em breve nosso bot usará IA para responder!`
            },
            { headers: { apikey: API_KEY } }
          );
          console.log(`✅ Resposta enviada com sucesso para ${senderId}`);
        } catch (error: any) {
          console.error('❌ Erro ao enviar resposta para o WhatsApp:', error.response?.data || error.message);
        }
      }
    }
  }

  // Retornar 200 OK rapidamente para a API não tentar reenviar a notificação
  res.status(200).send('EVENT_RECEIVED');
});