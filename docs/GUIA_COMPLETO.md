# 📚 Guia Completo: Setup e Configuração do Chatbot Multicanal

Este guia detalha todos os passos necessários para preparar seu Supabase e configurar a plataforma de chatbot multicanal.

---

## 📋 Índice

1. [Setup do Banco de Dados](#setup-do-banco-de-dados)
2. [Instalar Dependências](#instalar-dependências)
3. [Iniciar o Servidor](#iniciar-o-servidor)
4. [Configurar Credenciais de API](#configurar-credenciais-de-api)
5. [Criar Regras de Chatbot](#criar-regras-de-chatbot)
6. [Configurar Notificações](#configurar-notificações)
7. [Testar o Sistema](#testar-o-sistema)

---

## Setup do Banco de Dados

### Passo 1: Acessar o Supabase

1. Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login com sua conta
3. Selecione seu projeto

### Passo 2: Executar Script SQL

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New Query"** (botão verde com "+")
3. Abra o arquivo: `docs/SETUP_DATABASE.sql`
4. Copie TODO o conteúdo
5. Cole na caixa de SQL do Supabase
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Você deve ver: **"Success"** em verde

✅ **Seu banco de dados foi criado com sucesso!**

### Passo 3: Verificar as Tabelas

1. Clique em **"Table Editor"** no menu lateral
2. Você deve ver as seguintes tabelas:
   - ✅ `users` - Usuários do sistema
   - ✅ `contacts` - Contatos do WhatsApp/Instagram
   - ✅ `conversations` - Conversas
   - ✅ `messages` - Mensagens
   - ✅ `chatbot_rules` - Regras de automação
   - ✅ `api_credentials` - Credenciais de API
   - ✅ `notification_settings` - Configurações de notificação
   - ✅ `notification_logs` - Logs de notificações

---

## Instalar Dependências

### Passo 1: Abrir Terminal

1. Abra o terminal/PowerShell
2. Navegue até a pasta do projeto:

```bash
cd d:/programacao/botmulticanal
```

### Passo 2: Instalar pnpm (se não tiver)

```bash
npm install -g pnpm
```

### Passo 3: Instalar Dependências do Projeto

```bash
pnpm install
```

Isso vai instalar todas as dependências necessárias (React, Node.js, tRPC, etc).

✅ **Dependências instaladas!**

---

## Iniciar o Servidor

### Passo 1: Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

Você deve ver uma mensagem como:

```
Server running on http://localhost:3000/
```

### Passo 2: Acessar a Aplicação

1. Abra seu navegador
2. Vá para: `http://localhost:3000`
3. Faça login com sua conta Manus
4. Você verá o dashboard

✅ **Servidor iniciado!**

---

## Configurar Credenciais de API

### Configurar WhatsApp (Evolution API)

#### O que você precisa:

- **Token de Acesso**: Obtido da Evolution API
- **Phone Number ID**: ID do número de telefone no WhatsApp Business
- **Business Account ID**: ID da conta comercial

#### Como obter:

1. Vá para [https://evolution-api.com](https://evolution-api.com)
2. Crie uma conta ou faça login
3. Crie uma instância para seu número de WhatsApp
4. Copie o **Token de Acesso**

#### Como configurar:

1. No dashboard, clique em **"Configurações"**
2. Vá para aba **"APIs"**
3. Procure a seção **"WhatsApp (Evolution API)"**
4. Cole o token no campo **"Token de Acesso"**
5. Cole o Phone Number ID
6. Cole o Business Account ID
7. Clique em **"Salvar Credenciais"**

✅ **WhatsApp configurado!**

### Configurar Instagram (Meta Graph API)

#### O que você precisa:

- **Token de Acesso**: Obtido do Meta for Developers
- **Business Account ID**: ID da sua conta comercial no Instagram

#### Como obter:

1. Vá para [https://developers.facebook.com](https://developers.facebook.com)
2. Crie um app ou selecione um existente
3. Vá para **"Instagram Graph API"**
4. Gere um **Long-Lived Access Token**
5. Copie o token

#### Como configurar:

1. No dashboard, clique em **"Configurações"**
2. Vá para aba **"APIs"**
3. Procure a seção **"Instagram (Meta Graph API)"**
4. Cole o token no campo **"Token de Acesso"**
5. Cole o Business Account ID
6. Clique em **"Salvar Credenciais"**

✅ **Instagram configurado!**

---

## Criar Regras de Chatbot

### Acessar o Gerenciador de Chatbot

1. No dashboard, clique em **"Configurações"**
2. Vá para aba **"Chatbot"**
3. Você verá a seção **"Criar Nova Regra"**

### Exemplo 1: Saudação Automática

| Campo | Valor |
|-------|-------|
| **Nome da Regra** | Saudação Automática |
| **Palavras-chave** | olá, oi, tudo bem, e aí |
| **Resposta Automática** | Olá {contactName}! 👋 Bem-vindo! Como posso ajudar você hoje? |
| **Plataforma** | both (WhatsApp + Instagram) |

**Como criar:**

1. Preencha os campos acima
2. Clique em **"Criar Regra"**
3. Você verá a regra aparecer em **"Regras Ativas"**

### Exemplo 2: Resposta para Dúvidas

| Campo | Valor |
|-------|-------|
| **Nome da Regra** | Resposta Dúvidas |
| **Palavras-chave** | dúvida, dúvidas, pergunta, como funciona |
| **Resposta Automática** | Ótima pergunta, {contactName}! Você pode encontrar mais informações em nosso site ou falar com um atendente. Deixe seu e-mail que entraremos em contato! |
| **Plataforma** | both |

### Exemplo 3: Resposta para Horário

| Campo | Valor |
|-------|-------|
| **Nome da Regra** | Informar Horário |
| **Palavras-chave** | horário, aberto, fecha, funciona |
| **Resposta Automática** | Estamos abertos de segunda a sexta, das 9h às 18h. Aos sábados, das 9h às 13h. Domingo fechado. 🕐 |
| **Plataforma** | both |

### Variáveis Disponíveis

Você pode usar as seguintes variáveis nas respostas automáticas:

- `{contactName}` - Nome do contato
- `{date}` - Data atual
- `{time}` - Hora atual
- `{platform}` - Plataforma (WhatsApp ou Instagram)

### Gerenciar Regras

- **Editar**: Clique na regra e modifique os campos
- **Deletar**: Clique no ícone de lixeira vermelha

✅ **Regras de chatbot criadas!**

---

## Configurar Notificações

### Acessar Configurações de Notificação

1. No dashboard, clique em **"Configurações"**
2. Vá para aba **"Notificações"**

### Ativar Notificações por E-mail

1. **Notificações por E-mail**: Ative o toggle (deve estar verde)
2. **Limite de Mensagens Não Respondidas**: Digite `10`
   - Você será notificado quando tiver 10 mensagens não respondidas
3. **Notificar em Cada Mensagem**: Desative se quiser receber apenas notificações importantes
4. **Palavras-chave Importantes**: Digite as palavras que devem gerar notificações:
   ```
   urgente, problema, reclamação, cancelamento, refund, erro, bug
   ```

### Salvar Configurações

1. Clique em **"Salvar Configurações"**
2. Você verá uma mensagem de sucesso

✅ **Notificações configuradas!**

---

## Testar o Sistema

### Teste 1: Testar Regras de Chatbot

1. Abra o WhatsApp ou Instagram
2. Envie uma mensagem para seu número/conta com uma das palavras-chave (ex: "olá")
3. Você deve receber a resposta automática em segundos

### Teste 2: Visualizar no Dashboard

1. Vá para o dashboard da aplicação
2. Você deve ver:
   - ✅ Conversas ativas
   - ✅ Mensagens não respondidas
   - ✅ Histórico de conversas
   - ✅ Sugestões de resposta via IA

### Teste 3: Testar Notificações

1. Configure o limite de mensagens não respondidas para `1`
2. Envie 2 mensagens sem responder
3. Você deve receber um e-mail de notificação

✅ **Sistema testado e funcionando!**

---

## 🎯 Próximos Passos

1. **Integrar Webhook do WhatsApp**: Configure a URL do webhook na Evolution API
2. **Integrar Webhook do Instagram**: Configure a URL do webhook no Meta for Developers
3. **Treinar o Chatbot**: Crie mais regras baseadas em suas necessidades
4. **Monitorar Métricas**: Acompanhe o desempenho no dashboard

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se as credenciais de API estão corretas
2. Verifique se os webhooks estão configurados corretamente
3. Consulte os logs de notificação no Supabase
4. Verifique a conexão com o banco de dados

---

## 📝 Checklist Final

- [ ] Banco de dados criado no Supabase
- [ ] Tabelas criadas (execute `SETUP_DATABASE.sql`)
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Servidor iniciado (`pnpm dev`)
- [ ] Dashboard acessível em `http://localhost:3000`
- [ ] Credenciais de WhatsApp configuradas
- [ ] Credenciais de Instagram configuradas
- [ ] Pelo menos 3 regras de chatbot criadas
- [ ] Notificações ativadas
- [ ] Sistema testado

---

**Parabéns! 🎉 Seu chatbot multicanal está pronto para usar!**
