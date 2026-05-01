# Arquitetura Técnica: Plataforma de Gerenciamento Multicanal

## 1. Visão Geral da Arquitetura

A plataforma centraliza conversas do WhatsApp (via Evolution API) e Instagram (via Meta Graph API) em um único dashboard inteligente com automação via chatbot e sugestões geradas por LLM.

### Stack Tecnológico

| Componente | Tecnologia | Propósito |
|-----------|-----------|----------|
| **Frontend** | React 19 + Tailwind CSS 4 | Dashboard e interface de usuário |
| **Backend** | Express.js + tRPC | API, webhooks e processamento |
| **Banco de Dados** | MySQL (Supabase) | Persistência de dados |
| **Autenticação** | Manus OAuth | Acesso seguro |
| **LLM** | Claude/GPT/Gemini (via Manus Forge API) | Sugestões e automação inteligente |
| **Notificações** | Manus Notification API + Email | Alertas ao dono do projeto |

---

## 2. Schema de Banco de Dados

### Tabelas Principais

#### `users`
Tabela padrão do template Manus (já existe).

```sql
-- Já fornecida pelo template
```

#### `api_credentials`
Armazena credenciais de APIs de forma segura (criptografadas).

```sql
CREATE TABLE api_credentials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  platform ENUM('whatsapp', 'instagram') NOT NULL,
  token VARCHAR(1024) NOT NULL,
  secretKey VARCHAR(1024),
  phoneNumberId VARCHAR(255),
  businessAccountId VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_platform_per_user (userId, platform)
);
```

#### `contacts`
Gerencia contatos de diferentes plataformas.

```sql
CREATE TABLE contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  externalId VARCHAR(255) NOT NULL,
  platform ENUM('whatsapp', 'instagram') NOT NULL,
  name VARCHAR(255),
  phoneNumber VARCHAR(20),
  instagramHandle VARCHAR(255),
  profilePicture VARCHAR(512),
  lastInteractionAt TIMESTAMP,
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_external_contact (userId, externalId, platform),
  INDEX idx_user_platform (userId, platform)
);
```

#### `conversations`
Agrupa mensagens de um contato em conversas.

```sql
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  contactId INT NOT NULL,
  platform ENUM('whatsapp', 'instagram') NOT NULL,
  externalConversationId VARCHAR(255),
  subject VARCHAR(255),
  status ENUM('open', 'closed', 'pending') DEFAULT 'open',
  unreadCount INT DEFAULT 0,
  lastMessageAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE CASCADE,
  INDEX idx_user_status (userId, status),
  INDEX idx_user_platform (userId, platform)
);
```

#### `messages`
Armazena todas as mensagens de ambas as plataformas.

```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversationId INT NOT NULL,
  contactId INT NOT NULL,
  userId INT NOT NULL,
  externalMessageId VARCHAR(255),
  platform ENUM('whatsapp', 'instagram') NOT NULL,
  direction ENUM('inbound', 'outbound') NOT NULL,
  messageType ENUM('text', 'image', 'video', 'audio', 'document', 'location') DEFAULT 'text',
  content TEXT,
  mediaUrl VARCHAR(512),
  mediaType VARCHAR(50),
  status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
  senderName VARCHAR(255),
  senderPhone VARCHAR(20),
  senderInstagramHandle VARCHAR(255),
  llmSuggestion TEXT,
  automatedResponse BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation (conversationId),
  INDEX idx_user_created (userId, createdAt)
);
```

#### `chatbot_rules`
Define regras de automação com base em palavras-chave.

```sql
CREATE TABLE chatbot_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  triggerKeywords TEXT NOT NULL,
  responseTemplate TEXT NOT NULL,
  platform ENUM('whatsapp', 'instagram', 'both') DEFAULT 'both',
  priority INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (userId, isActive)
);
```

#### `notification_settings`
Configurações de notificação e limites.

```sql
CREATE TABLE notification_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  emailNotificationsEnabled BOOLEAN DEFAULT true,
  unreadMessageThreshold INT DEFAULT 10,
  notifyOnEveryMessage BOOLEAN DEFAULT false,
  notifyOnImportantKeywords TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user (userId)
);
```

#### `notification_logs`
Registra notificações enviadas ao dono do projeto.

```sql
CREATE TABLE notification_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('email', 'in_app') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  messageId INT,
  conversationId INT,
  sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (messageId) REFERENCES messages(id) ON DELETE SET NULL,
  FOREIGN KEY (conversationId) REFERENCES conversations(id) ON DELETE SET NULL,
  INDEX idx_user_type (userId, type)
);
```

---

## 3. Fluxo de Webhooks

### WhatsApp (Evolution API)

**Evento recebido**: Mensagem de entrada

```
Evolution API → POST /api/webhooks/whatsapp
{
  "instance": "instance_name",
  "data": {
    "messageId": "msg_123",
    "phoneNumber": "5511999999999",
    "message": {
      "text": "Olá, tudo bem?",
      "type": "text"
    },
    "timestamp": 1234567890
  }
}
```

**Processamento**:
1. Validar webhook (verificar assinatura)
2. Extrair dados do contato (número, nome)
3. Criar ou atualizar contato
4. Criar conversa se não existir
5. Salvar mensagem no banco
6. Verificar regras de chatbot
7. Gerar sugestão via LLM
8. Enviar notificação ao dono se necessário

### Instagram (Meta Graph API)

**Evento recebido**: Mensagem direta

```
Meta Graph API → POST /api/webhooks/instagram
{
  "object": "instagram",
  "entry": [{
    "id": "page_id",
    "messaging": [{
      "sender": { "id": "sender_id" },
      "recipient": { "id": "recipient_id" },
      "message": {
        "mid": "msg_123",
        "text": "Olá!"
      },
      "timestamp": 1234567890
    }]
  }]
}
```

**Processamento**: Similar ao WhatsApp

---

## 4. Fluxo de Envio de Mensagens

### Envio Manual (Dashboard)

```
Frontend → tRPC mutation (sendMessage)
  ↓
Backend valida credenciais
  ↓
Backend chama API externa (Evolution ou Meta)
  ↓
Salva mensagem com status "sent"
  ↓
Webhook de confirmação atualiza status para "delivered"
```

### Envio Automático (Chatbot)

```
Mensagem recebida
  ↓
Verifica regras de chatbot
  ↓
Se trigger encontrado:
  - Gera sugestão via LLM (opcional)
  - Monta resposta automática
  - Envia via API externa
  - Salva com flag automatedResponse=true
```

---

## 5. Integração com LLM

### Geração de Sugestões

**Quando**: Ao receber uma mensagem

**Prompt do LLM**:
```
Contexto: Você é um assistente de atendimento ao cliente.
Histórico da conversa: [últimas 5 mensagens]
Mensagem atual: "[mensagem do cliente]"

Gere uma sugestão de resposta profissional, empática e concisa (máximo 2 parágrafos).
```

**Armazenamento**: Campo `llmSuggestion` na tabela `messages`

**Exibição**: Dashboard mostra sugestão para o operador revisar e enviar

---

## 6. Sistema de Notificações

### Notificação ao Dono do Projeto

**Triggers**:
1. Nova mensagem recebida (se `notifyOnEveryMessage = true`)
2. Número de mensagens não respondidas ultrapassa `unreadMessageThreshold`
3. Mensagem contém palavras-chave importantes (se configuradas)

**Canais**:
- **E-mail**: Via Manus Notification API
- **In-app**: Via tRPC (notificação em tempo real)

**Exemplo de e-mail**:
```
Assunto: Nova mensagem de [Nome do Contato] via [Plataforma]

Você recebeu uma nova mensagem em sua plataforma de gerenciamento.

Contato: [Nome]
Plataforma: WhatsApp / Instagram
Mensagem: [Primeiras 100 caracteres]

Acesse seu dashboard para responder: [Link]
```

---

## 7. Estrutura de Diretórios do Backend

```
server/
├── routers/
│   ├── messages.ts          # Envio e listagem de mensagens
│   ├── conversations.ts      # Gerenciamento de conversas
│   ├── contacts.ts          # Gerenciamento de contatos
│   ├── chatbot.ts           # Configuração de regras
│   ├── settings.ts          # Configurações de API e notificações
│   └── dashboard.ts         # Métricas e visão geral
├── webhooks/
│   ├── whatsapp.ts          # Handler de webhooks WhatsApp
│   ├── instagram.ts         # Handler de webhooks Instagram
│   └── validation.ts        # Validação de webhooks
├── services/
│   ├── llm.ts              # Integração com LLM
│   ├── notifications.ts     # Sistema de notificações
│   ├── whatsapp-api.ts     # Cliente Evolution API
│   ├── instagram-api.ts    # Cliente Meta Graph API
│   └── chatbot.ts          # Lógica de automação
└── db.ts                    # Query helpers
```

---

## 8. Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATAFORMAS EXTERNAS                      │
│              WhatsApp (Evolution API)                         │
│              Instagram (Meta Graph API)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ Webhook
                       ▼
        ┌──────────────────────────────┐
        │   Backend (Express + tRPC)   │
        │  ┌──────────────────────┐   │
        │  │ Webhook Handlers     │   │
        │  └──────────────────────┘   │
        │  ┌──────────────────────┐   │
        │  │ Message Processing   │   │
        │  └──────────────────────┘   │
        │  ┌──────────────────────┐   │
        │  │ Chatbot Rules Check  │   │
        │  └──────────────────────┘   │
        │  ┌──────────────────────┐   │
        │  │ LLM Suggestions      │   │
        │  └──────────────────────┘   │
        │  ┌──────────────────────┐   │
        │  │ Notifications        │   │
        │  └──────────────────────┘   │
        └──────────────┬───────────────┘
                       │
        ┌──────────────┴───────────────┐
        │                              │
        ▼                              ▼
   ┌─────────────┐            ┌──────────────────┐
   │   MySQL DB  │            │   Manus Forge    │
   │  (Supabase) │            │   (LLM + Email)  │
   └─────────────┘            └──────────────────┘
        │
        ▼
   ┌─────────────────────────────────────────┐
   │        Frontend (React + Tailwind)       │
   │  ┌─────────────────────────────────┐   │
   │  │ Dashboard Principal             │   │
   │  │ - Conversas ativas              │   │
   │  │ - Métricas                      │   │
   │  │ - Status das integrações        │   │
   │  └─────────────────────────────────┘   │
   │  ┌─────────────────────────────────┐   │
   │  │ Histórico de Conversas          │   │
   │  │ - Chat com bolhas               │   │
   │  │ - Sugestões LLM                 │   │
   │  └─────────────────────────────────┘   │
   │  ┌─────────────────────────────────┐   │
   │  │ Gerenciamento de Contatos       │   │
   │  │ - Lista com filtros             │   │
   │  │ - Última interação              │   │
   │  └─────────────────────────────────┘   │
   │  ┌─────────────────────────────────┐   │
   │  │ Painel de Configurações         │   │
   │  │ - Credenciais de API            │   │
   │  │ - Regras de chatbot             │   │
   │  │ - Limites de notificação        │   │
   │  └─────────────────────────────────┘   │
   └─────────────────────────────────────────┘
```

---

## 9. Considerações de Segurança

- **Credenciais de API**: Criptografadas no banco de dados, nunca expostas ao frontend
- **Webhooks**: Validados com assinatura HMAC
- **Autenticação**: Manus OAuth para acesso ao dashboard
- **Autorização**: Usuários só veem seus próprios dados
- **Rate Limiting**: Implementado para proteger APIs externas

---

## 10. Próximas Etapas

1. Criar schema de banco de dados (migrations)
2. Implementar handlers de webhooks
3. Criar serviços de integração com APIs externas
4. Implementar sistema de notificações
5. Construir frontend do dashboard
6. Adicionar painel de configurações
7. Testar fluxos completos

