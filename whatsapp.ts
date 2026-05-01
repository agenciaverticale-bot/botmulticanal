import { Router } from 'express';
import axios from 'axios';

export const whatsappRouter = Router();

// Use os mesmos nomes de variáveis que você configurou no seu .env
const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;
// Você pode tornar isso dinâmico depois (ex: req.user.id) se tiver múltiplos clientes
const INSTANCE_NAME = 'bot-verticale'; 

whatsappRouter.get('/qrcode', async (req, res) => {
  try {
    // 1. Tenta criar a instância (se ela já existir, a API ignora e seguimos em frente)
    try {
      await axios.post(
        `${EVOLUTION_URL}/instance/create`,
        { instanceName: INSTANCE_NAME },
        { headers: { apikey: API_KEY } }
      );
    } catch (e) {
      // A Evolution retorna erro se já existe, podemos ignorar
    }

    // 2. Busca o QR Code de conexão (retorna a imagem em Base64)
    const response = await axios.get(
      `${EVOLUTION_URL}/instance/connect/${INSTANCE_NAME}`,
      { headers: { apikey: API_KEY } }
    );

    // Retornamos o base64 direto para o frontend exibir na tag <img>
    res.json({ qrCode: response.data.base64 });
  } catch (error) {
    console.error('Erro ao buscar QR Code da Evolution API:', error);
    res.status(500).json({ error: 'Falha ao conectar com a API do WhatsApp' });
  }
});