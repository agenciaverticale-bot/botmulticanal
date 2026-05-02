# 🎯 Guia Final: Setup Completo e Deploy no Render

Este é o guia final com todos os passos para colocar sua aplicação online.

---

## 📋 Índice

1. [Preparar Banco de Dados](#preparar-banco-de-dados)
2. [Fazer Push para GitHub](#fazer-push-para-github)
3. [Configurar Deploy no Render](#configurar-deploy-no-render)
4. [Testar a Aplicação](#testar-a-aplicação)

---

## 🗄️ Preparar Banco de Dados

### Passo 1: Criar Tabelas no Supabase

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto `uxvntliomktkrojnlbwi`
3. Clique em **"SQL Editor"** → **"New Query"**
4. Abra o arquivo: `docs/SETUP_DATABASE.sql`
5. Cole TODO o conteúdo
6. Clique em **"Run"**
7. Você deve ver: **"Success"** em verde

✅ **Banco de dados criado!**

---

## 📤 Fazer Push para GitHub

### Passo 1: Abrir Terminal

Abra o terminal/PowerShell e navegue até a pasta do projeto:

```bash
cd d:/programacao/botmulticanal
```

### Passo 2: Configurar Git (primeira vez)

```bash
git config --global user.email "seu_email@example.com"
git config --global user.name "Seu Nome"
```

### Passo 3: Inicializar Git

```bash
git init
git remote add origin https://github.com/agenciaverticale-bot/botmulticanal.git
```

### Passo 4: Fazer Commit

```bash
git add .
git commit -m "Initial commit: Chatbot multicanal"
```

### Passo 5: Fazer Push

```bash
git branch -M main
git push -u origin main
```

**Você será pedido para:**

- **Username**: Seu username do GitHub
- **Password**: Seu token de acesso (não sua senha)

Para gerar um token:

1. Vá para: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Dê um nome: `botmulticanal-deploy`
4. Selecione: `repo` (full control of private repositories)
5. Clique em **"Generate token"**
6. Copie o token e cole no terminal

✅ **Código no GitHub!**

---

## 🚀 Configurar Deploy no Render

### Passo 1: Acessar Render Dashboard

1. Vá para: https://dashboard.render.com
2. Faça login com sua conta (ou crie uma se não tiver)

### Passo 2: Criar Novo Serviço

1. Clique em **"New +"** → **"Web Service"**
2. Clique em **"Connect a repository"**
3. Selecione seu repositório: `botmulticanal`
4. Clique em **"Connect"**

### Passo 3: Configurar Serviço

Preencha os campos:

| Campo           | Valor             |
| --------------- | ----------------- |
| **Name**        | `botmulticanal`   |
| **Environment** | `Docker`          |
| **Region**      | `São Paulo (sao)` |
| **Branch**      | `main`            |
| **Auto-deploy** | `Yes`             |

Clique em **"Create Web Service"**

### Passo 4: Adicionar Variáveis de Ambiente

Aguarde a página carregar. Vá para **"Environment"** e adicione as seguintes variáveis:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:Contato@2026@db.uxvntliomktkrojnlbwi.supabase.co:5432/postgres
SUPABASE_URL=https://uxvntliomktkrojnlbwi.supabase.co
SUPABASE_KEY=sb_publishable_Ivq2WQtgQxh76bhbjWvk7Q_IA9KREHD

EVOLUTION_API_URL=https://minha-api-whatsapp-gof4.onrender.com
EVOLUTION_API_KEY=269b25b90301acfd3f41cad77b9f48df

JWT_SECRET=gere_uma_chave_segura_com_openssl_rand_base64_32
VITE_APP_ID=seu_app_id_do_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=seu_open_id_do_manus
OWNER_NAME=Seu Nome
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_forge_api
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend_forge_api
```

### Passo 5: Iniciar Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (5-10 minutos)
3. Configure o Custom Domain para apontar para `https://crm.agenciaverticale.com.br`

✅ **Deploy iniciado!**

---

## 🧪 Testar a Aplicação

### Passo 1: Acessar a Aplicação

1. Vá para: `https://crm.agenciaverticale.com.br`
2. Você deve ver a página de login
3. Faça login com sua conta Manus

### Passo 2: Verificar Funcionalidades

1. ✅ Dashboard carrega sem erros
2. ✅ Você consegue visualizar conversas
3. ✅ Você consegue criar regras de chatbot
4. ✅ Você consegue configurar notificações

### Passo 3: Monitorar Logs

1. No Render Dashboard, vá para **"Logs"**
2. Procure por mensagens como:
   - ✅ `Server running on http://localhost:3000/`
   - ✅ `Connected to database`

✅ **Aplicação funcionando!**

---

## 🔗 Configurar Webhooks (Opcional)

### WhatsApp (Evolution API)

1. Vá para o painel da Evolution API
2. Configure o webhook apontando para: `https://crm.agenciaverticale.com.br/api/whatsapp/webhook`
3. Salve as configurações

### Instagram (Meta Graph API)

1. Vá para o Meta for Developers
2. Configure o webhook para: `https://crm.agenciaverticale.com.br/api/webhook/instagram`
3. Salve as configurações

✅ **Webhooks configurados!**

---

## 📝 Checklist Final

- [ ] Banco de dados criado no Supabase
- [ ] Tabelas criadas (execute `SETUP_DATABASE.sql`)
- [ ] Código feito push para GitHub
- [ ] Projeto criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] Aplicação acessível online
- [ ] Webhooks configurados (opcional)

---

## 🎉 Parabéns!

Sua aplicação está rodando online no Render!

**URL da aplicação**: `https://crm.agenciaverticale.com.br`

---

## 📞 Próximos Passos

1. Configurar credenciais de WhatsApp e Instagram no painel
2. Criar regras de chatbot
3. Ativar notificações por e-mail
4. Configurar webhooks para receber mensagens em tempo real

---

**Sucesso! 🚀**
