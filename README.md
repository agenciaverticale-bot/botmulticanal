# 🤖 Chatbot Multicanal - WhatsApp + Instagram

Plataforma inteligente de gerenciamento de mensagens multicanal com automação via chatbot e sugestões geradas por LLM.

---

## 📋 Índice

- [Requisitos](#requisitos)
- [Instalação Rápida](#instalação-rápida)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração](#configuração)
- [Como Usar](#como-usar)
- [Documentação](#documentação)

---

## 📦 Requisitos

- **Node.js** 18+ e **pnpm**
- **Supabase** (PostgreSQL)
- **Evolution API** (para WhatsApp)
- **Meta Graph API** (para Instagram)

---

## 🚀 Instalação Rápida

### 1. Clonar o Projeto

```bash
cd d:/programacao/botmulticanal
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Banco de Dados

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **"SQL Editor"** → **"New Query"**
4. Abra o arquivo: `docs/SETUP_DATABASE.sql`
5. Cole TODO o conteúdo e execute
6. Clique em **"Run"**

### 4. Iniciar o Servidor

```bash
pnpm dev
```

A aplicação estará disponível em: `http://localhost:3000`

---

## 📁 Estrutura do Projeto

```
d:/programacao/botmulticanal/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas (Dashboard, Settings, etc)
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/              # Utilitários (tRPC client, etc)
│   │   └── types/            # Tipos TypeScript
│   └── public/               # Assets estáticos
│
├── server/                    # Backend Node.js + Express
│   ├── routers/              # tRPC routers (messages, settings)
│   ├── services/             # Serviços (LLM, notificações, chatbot)
│   ├── webhooks/             # Handlers de webhooks (WhatsApp, Instagram)
│   ├── db.ts                 # Query helpers
│   └── _core/                # Framework core (OAuth, tRPC setup)
│
├── drizzle/                  # Migrations do banco de dados
│   ├── schema.ts             # Definição das tabelas
│   └── *.sql                 # Arquivos de migração
│
├── docs/                     # Documentação
│   ├── SETUP_DATABASE.sql    # Script para criar tabelas
│   ├── GUIA_COMPLETO.md      # Guia detalhado
│   └── GUIA_RAPIDO.md        # Guia rápido (5 minutos)
│
└── package.json              # Dependências do projeto
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

O projeto usa as seguintes variáveis (já configuradas automaticamente):

- `DATABASE_URL` - Connection string do Supabase PostgreSQL
- `SUPABASE_URL` - URL base do Supabase
- `SUPABASE_KEY` - Chave de acesso do Supabase
- `JWT_SECRET` - Secret para sessões
- `VITE_APP_ID` - ID da aplicação Manus
- `OAUTH_SERVER_URL` - URL do servidor OAuth Manus

### Credenciais de API

Configure no painel de **Configurações** da aplicação:

1. **WhatsApp (Evolution API)**
   - Token de acesso
   - Phone Number ID
   - Business Account ID

2. **Instagram (Meta Graph API)**
   - Token de acesso
   - Business Account ID

---

## 💬 Como Usar

### 1. Acessar o Dashboard

1. Abra: `http://localhost:3000`
2. Faça login com sua conta Manus
3. Você verá o dashboard com conversas ativas

### 2. Criar Regras de Chatbot

1. Vá para **"Configurações"** → **"Chatbot"**
2. Clique em **"Criar Nova Regra"**
3. Preencha:
   - **Nome**: Ex: "Saudação Automática"
   - **Palavras-chave**: `olá, oi, tudo bem`
   - **Resposta**: `Olá {contactName}! Como posso ajudar?`
   - **Plataforma**: `both` (WhatsApp + Instagram)
4. Clique em **"Criar Regra"**

### 3. Visualizar Conversas

1. No dashboard, clique em uma conversa na lista
2. Você verá o histórico de mensagens
3. Clique em **"Sugestão IA"** para obter sugestões de resposta
4. Envie sua resposta manualmente

### 4. Configurar Notificações

1. Vá para **"Configurações"** → **"Notificações"**
2. Ative **"Notificações por E-mail"**
3. Defina o **"Limite de Mensagens Não Respondidas"** (ex: 10)
4. Adicione **"Palavras-chave Importantes"** (ex: urgente, problema)
5. Clique em **"Salvar Configurações"**

---

## 📚 Documentação

### Guias Disponíveis

| Arquivo | Descrição |
|---------|-----------|
| `docs/GUIA_RAPIDO.md` | Começar em 5 minutos ⚡ |
| `docs/GUIA_COMPLETO.md` | Guia detalhado com exemplos 📖 |
| `docs/SETUP_DATABASE.sql` | Script SQL para criar tabelas 🗄️ |
| `ARCHITECTURE.md` | Arquitetura técnica do projeto 🏗️ |

### Arquivos de Migração

Os arquivos SQL estão em `drizzle/`:

- `0000_short_typhoid_mary.sql` - Tabela inicial de usuários
- `0001_slim_midnight.sql` - Tabelas do chatbot multicanal

---

## 🔧 Desenvolvimento

### Estrutura de Código

#### Backend (tRPC)

```typescript
// server/routers/messages.ts
export const messagesRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    return getConversationsByUserId(ctx.user.id);
  }),
});
```

#### Frontend (React + tRPC)

```typescript
// client/src/pages/Dashboard.tsx
const conversations = trpc.messages.getConversations.useQuery();
```

### Adicionar Nova Funcionalidade

1. **Criar tabela** em `drizzle/schema.ts`
2. **Gerar migration**: `pnpm drizzle-kit generate`
3. **Executar migration** no Supabase
4. **Criar query helper** em `server/db.ts`
5. **Criar tRPC procedure** em `server/routers/`
6. **Usar no frontend** com `trpc.*.useQuery/useMutation`

---

## 🧪 Testes

```bash
# Rodar testes
pnpm test

# Verificar tipos TypeScript
pnpm check

# Formatar código
pnpm format
```

---

## 🚀 Deploy

### Preparar para Deploy

1. Criar checkpoint: `webdev_save_checkpoint`
2. Clicar em **"Publish"** no Management UI
3. Configurar domínio customizado (opcional)

### Variáveis de Produção

Todas as variáveis de ambiente são gerenciadas automaticamente pelo Manus.

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se as tabelas foram criadas no Supabase
2. Verifique se as credenciais de API estão corretas
3. Consulte os logs no browser (F12 → Console)
4. Leia o arquivo `ARCHITECTURE.md` para entender a arquitetura

---

## 📝 Checklist de Setup

- [ ] Banco de dados criado no Supabase
- [ ] Tabelas criadas (execute `SETUP_DATABASE.sql`)
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Servidor iniciado (`pnpm dev`)
- [ ] Dashboard acessível em `http://localhost:3000`
- [ ] Credenciais de WhatsApp configuradas
- [ ] Credenciais de Instagram configuradas
- [ ] Primeira regra de chatbot criada
- [ ] Notificações ativadas

---

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando React, Node.js, tRPC e Supabase**
