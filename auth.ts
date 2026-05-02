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
  const [salt, key] = storedHash.split(':');
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

// ROTA 1: Criar o primeiro usuário (Admin)
authRouter.post('/setup', async (req, res) => {
  const db = await getDb();
  const { email, password, name } = req.body;

  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existingUser.length > 0) {
    return res.status(400).json({ error: 'Usuário já existe!' });
  }

  const hashedPassword = hashPassword(password);
  
  await db.insert(users).values({
    openId: crypto.randomUUID(), // UUID falso só para preencher o requisito do schema
    email,
    name,
    passwordHash: hashedPassword,
    role: 'admin',
    loginMethod: 'local'
  });

  res.json({ message: 'Administrador criado com sucesso!' });
});

// ROTA 2: Fazer Login
authRouter.post('/login', async (req, res) => {
  const db = await getDb();
  const { email, password } = req.body;

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (user.length === 0 || !user[0].passwordHash) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  const isValid = verifyPassword(password, user[0].passwordHash);
  if (!isValid) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos' });
  }

  // Gerar o "Crachá" (Token JWT) com validade de 24 horas
  const token = await new SignJWT({ userId: user[0].id, role: user[0].role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);

  res.json({ token, user: { name: user[0].name, email: user[0].email, role: user[0].role } });
});