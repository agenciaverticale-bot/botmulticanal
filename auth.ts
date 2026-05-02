import { Router } from 'express';
import crypto from 'crypto';
import { SignJWT } from 'jose';
import { getDb } from './server/db';
import { users } from './drizzle/schema';
import { eq } from 'drizzle-orm';

export const authRouter = Router();
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'sua_chave_secreta_super_segura_aqui_123');

// Função para Criptografar a Senha
function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

// Função para Verificar a Senha no Login
function verifyPassword(password: string, storedHash: string) {
  if (!password || !storedHash) return false;
  const [salt, key] = storedHash.split(':');
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

// ROTA 2: Fazer Login
authRouter.post('/login', async (req, res) => {
  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Erro: O servidor não conseguiu conectar ao banco de dados.' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    // --- CRIAÇÃO AUTOMÁTICA E INVISÍVEL DO SEU ADMIN ---
    // Verifica se a tabela de usuários está completamente vazia
    const allUsers = await db.select().from(users).limit(1);
    if (allUsers.length === 0) {
      console.log('[Auth] Primeiro acesso detectado. Criando conta mestre da Verticale...');
      await db.insert(users).values({
        openId: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex'), 
        email: 'contato@agenciaverticale.com.br',
        name: 'Admin Verticale',
        passwordHash: hashPassword('Contato@2026'),
        role: 'admin',
        loginMethod: 'local'
      });
    }
    // ---------------------------------------------------

    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0 || !user[0].passwordHash) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const isValid = verifyPassword(password, user[0].passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos' });
    }

    const token = await new SignJWT({ userId: user[0].id, role: user[0].role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secretKey);

    res.json({ token, user: { name: user[0].name, email: user[0].email, role: user[0].role } });
  } catch (error) {
    console.error('[Auth] Erro na rota de login:', error);
    res.status(500).json({ error: `Erro interno no servidor: ${error.message || String(error)}` });
  }
});