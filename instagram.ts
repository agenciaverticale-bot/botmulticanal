import { Router, Request, Response } from 'express';
import axios from 'axios';

export const instagramRouter = Router();

// GET: Rota de verificação do Webhook (A Meta chama essa rota para validar a URL)
instagramRouter.get('/webhook/instagram', (req: Request, res: Response) => {
  // O token que VOCÊ inventar e colocar no .env precisa ser igual ao que vai colocar lá no painel da Meta
  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook do Instagram verificado com sucesso!');
      res.status(200).send(challenge);
    } else {
      res.status(403).json({ error: 'Token de verificação inválido' });
    }
  } else {
    res.status(400).json({ error: 'Faltam parâmetros de verificação' });
  }
});

// POST: Rota para receber as mensagens que os usuários enviam no direct
instagramRouter.post('/webhook/instagram', async (req: Request, res: Response) => {
  const body = req.body;
  const PAGE_ACCESS_TOKEN = process.env.META_GRAPH_API_TOKEN;

  if (body.object === 'instagram' || body.object === 'page') {
    for (const entry of body.entry || []) {
      const webhookEvent = entry.messaging?.[0];
      console.log('💬 Evento recebido do Instagram:', JSON.stringify(webhookEvent, null, 2));
      
      // Se tiver uma mensagem de texto, vamos enviar uma resposta automática
      if (webhookEvent && webhookEvent.message && webhookEvent.message.text) {
        const senderId = webhookEvent.sender.id;
        const receivedText = webhookEvent.message.text;
        
        try {
          await axios.post(
            `https://graph.facebook.com/v19.0/me/messages`,
            {
              recipient: { id: senderId },
              message: { text: `🤖 Olá! Eu recebi sua mensagem: "${receivedText}". Em breve nosso bot usará IA para responder de forma inteligente!` }
            },
            {
              params: { access_token: PAGE_ACCESS_TOKEN }
            }
          );
          console.log(`✅ Resposta enviada com sucesso para ${senderId}`);
        } catch (error: any) {
          console.error('❌ Erro ao enviar resposta para o Instagram:', error.response?.data || error.message);
        }
      }
    }
    
    // A Meta exige que você retorne um status 200 (OK) rapidamente
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});