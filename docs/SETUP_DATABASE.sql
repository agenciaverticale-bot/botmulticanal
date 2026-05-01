-- ============================================================
-- SETUP DO BANCO DE DADOS - SUPABASE (PostgreSQL)
-- ============================================================
-- 
-- Instruções:
-- 1. Vá para https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Clique em "SQL Editor" → "New Query"
-- 4. Cole TODO o conteúdo deste arquivo
-- 5. Clique em "Run"
-- 6. Recarregue a página da aplicação
--
-- ============================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "openId" VARCHAR(64) NOT NULL UNIQUE,
    "name" TEXT,
    "email" VARCHAR(320),
    "loginMethod" VARCHAR(64),
    "role" VARCHAR(20) NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSignedIn" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de contatos
CREATE TABLE IF NOT EXISTS "contacts" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "externalId" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255),
    "phoneNumber" VARCHAR(20),
    "instagramHandle" VARCHAR(255),
    "profilePicture" VARCHAR(512),
    "lastInteractionAt" TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "externalId", "platform")
);

CREATE INDEX IF NOT EXISTS "idx_contacts_user_id" ON "contacts"("userId");
CREATE INDEX IF NOT EXISTS "idx_contacts_user_platform" ON "contacts"("userId", "platform");

-- Tabela de conversas
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "contactId" INTEGER NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "platform" VARCHAR(20) NOT NULL,
    "externalConversationId" VARCHAR(255),
    "subject" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "lastMessageAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_conversations_user_id" ON "conversations"("userId");
CREATE INDEX IF NOT EXISTS "idx_conversations_user_status" ON "conversations"("userId", "status");
CREATE INDEX IF NOT EXISTS "idx_conversations_user_platform" ON "conversations"("userId", "platform");

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS "messages" (
    "id" SERIAL PRIMARY KEY,
    "conversationId" INTEGER NOT NULL REFERENCES "conversations"("id") ON DELETE CASCADE,
    "contactId" INTEGER NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "externalMessageId" VARCHAR(255),
    "platform" VARCHAR(20) NOT NULL,
    "direction" VARCHAR(20) NOT NULL,
    "messageType" VARCHAR(50) NOT NULL DEFAULT 'text',
    "content" TEXT,
    "mediaUrl" VARCHAR(512),
    "mediaType" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "senderName" VARCHAR(255),
    "senderPhone" VARCHAR(20),
    "senderInstagramHandle" VARCHAR(255),
    "llmSuggestion" TEXT,
    "automatedResponse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_messages_conversation_id" ON "messages"("conversationId");
CREATE INDEX IF NOT EXISTS "idx_messages_user_created" ON "messages"("userId", "createdAt");

-- Tabela de regras de chatbot
CREATE TABLE IF NOT EXISTS "chatbot_rules" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "triggerKeywords" TEXT NOT NULL,
    "responseTemplate" TEXT NOT NULL,
    "platform" VARCHAR(20) NOT NULL DEFAULT 'both',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_chatbot_rules_user_active" ON "chatbot_rules"("userId", "isActive");

-- Tabela de credenciais de API
CREATE TABLE IF NOT EXISTS "api_credentials" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "platform" VARCHAR(20) NOT NULL,
    "token" VARCHAR(1024) NOT NULL,
    "secretKey" VARCHAR(1024),
    "phoneNumberId" VARCHAR(255),
    "businessAccountId" VARCHAR(255),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "platform")
);

CREATE INDEX IF NOT EXISTS "idx_api_credentials_user_id" ON "api_credentials"("userId");

-- Tabela de configurações de notificação
CREATE TABLE IF NOT EXISTS "notification_settings" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
    "emailNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "unreadMessageThreshold" INTEGER NOT NULL DEFAULT 10,
    "notifyOnEveryMessage" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnImportantKeywords" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de notificações
CREATE TABLE IF NOT EXISTS "notification_logs" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "messageId" INTEGER REFERENCES "messages"("id") ON DELETE SET NULL,
    "conversationId" INTEGER REFERENCES "conversations"("id") ON DELETE SET NULL,
    "sentAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_notification_logs_user_type" ON "notification_logs"("userId", "type");

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
-- Se você viu "Success" em verde, as tabelas foram criadas!
-- Agora recarregue a página da aplicação.
-- ============================================================
