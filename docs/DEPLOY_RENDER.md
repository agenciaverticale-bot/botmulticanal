# 🚀 Guia de Deploy no Render

Este guia detalha como fazer o deploy da plataforma de chatbot multicanal no Render.

---

## 📋 Pré-requisitos

Você precisa ter:

1. ✅ Uma conta no [Render](https://render.com) (crie uma se não tiver)
2. ✅ Uma conta no [GitHub](https://github.com) (para auto-deploy)
3. ✅ O repositório do projeto no GitHub
4. ✅ Supabase configurado (para o bot) e as credenciais prontas
5. ✅ Instância da Evolution API rodando (com banco Neon)

---

## 🔧 Passo 1: Preparar o Repositório GitHub

### 1.1 Criar Repositório

1. Vá para [https://github.com/new](https://github.com/new)
2. Preencha:
   - **Repository name**: `botmulticanal`
   - **Description**: `Plataforma de Chatbot Multicanal`
   - **Visibility**: `Public` (ou `Private` se preferir)
3. Clique em **"Create repository"**

### 1.2 Fazer Push do Código

No terminal, na pasta do projeto:

```bash
cd d:/programacao/botmulticanal

# Inicializar git (se não estiver inicializado)
git init

# Adicionar remote
git remote add origin https://github.com/agenciaverticale-bot/botmulticanal

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit: Chatbot multicanal setup"

# Fazer push
git branch -M main
git push -u origin main
```

✅ **Código no GitHub!**

---

## 🌐 Passo 2: Criar Projeto no Render

### 2.1 Acessar Render Dashboard

1. Vá para [https://dashboard.render.com](https://dashboard.render.com)
2. Faça login com sua conta
3. Clique em **"New +"** → **"Web Service"**

### 2.2 Conectar Repositório GitHub

1. Clique em **"Connect a repository"**
2. Selecione seu repositório `botmulticanal`
3. Clique em **"Connect"**

### 2.3 Configurar Serviço

Preencha os campos:

| Campo           | Valor                                     |
| --------------- | ----------------------------------------- |
| **Name**        | `botmulticanal`                           |
| **Environment** | `Docker`                                  |
| **Region**      | `São Paulo (sao)` ou sua região preferida |
| **Branch**      | `main`                                    |
| **Auto-deploy** | `Yes`                                     |

✅ **Projeto criado!**

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente

### 3.1 Adicionar Variáveis

No Render Dashboard, vá para **"Environment"** e adicione as seguintes variáveis:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:Contato@2026@db.uxvntliomktkrojnlbwi.supabase.co:5432/postgres
SUPABASE_URL=https://uxvntliomktkrojnlbwi.supabase.co
SUPABASE_KEY=sb_publishable_Ivq2WQtgQxh76bhbjWvk7Q_IA9KREHD

# Evolution API
EVOLUTION_API_URL=https://minha-api-whatsapp-gof4.onrender.com
EVOLUTION_API_KEY=269b25b90301acfd3f41cad77b9f48df

JWT_SECRET=seu_jwt_secret_aqui
VITE_APP_ID=seu_app_id_aqui
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=seu_open_id_aqui
OWNER_NAME=Seu Nome
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave_aqui
```

### 3.2 Onde Obter Essas Credenciais

- **DATABASE_URL**: Do Supabase (Settings → Database)
- **SUPABASE_URL**: Do Supabase (Settings → API)
- **SUPABASE_KEY**: Do Supabase (Settings → API)
- **EVOLUTION_API_URL**: URL da sua Evolution API rodando no Render
- **EVOLUTION_API_KEY**: Global API Key configurada na Evolution API
- **JWT_SECRET**: Gere uma chave segura (use `openssl rand -base64 32`)
- **VITE_APP_ID**: Do seu projeto Manus
- **OWNER_OPEN_ID**: Do seu perfil Manus
- **OWNER_NAME**: Seu nome
- **BUILT_IN_FORGE_API_KEY**: Do seu projeto Manus

✅ **Variáveis configuradas!**

---

## 🏗️ Passo 4: Fazer Deploy

### 4.1 Iniciar Deploy

1. No Render Dashboard, clique em **"Deploy"**
2. Aguarde o build completar (pode levar 5-10 minutos)
3. O Render vai gerar uma URL padrão, mas usaremos seu domínio: `https://crm.agenciaverticale.com.br`

### 4.2 Verificar Status

1. Vá para **"Logs"** para ver o progresso
2. Procure por mensagens como:
   - ✅ `Server running on http://localhost:3000/`
   - ✅ `Connected to database`

✅ **Deploy concluído!**

---

## 🧪 Passo 5: Testar a Aplicação

### 5.1 Acessar a Aplicação

1. Vá para: `https://crm.agenciaverticale.com.br`
2. Você deve ver a página de login
3. Faça login com sua conta Manus

### 5.2 Verificar Funcionalidades

1. ✅ Dashboard carrega sem erros
2. ✅ Você consegue visualizar conversas
3. ✅ Você consegue criar regras de chatbot
4. ✅ Você consegue configurar notificações

✅ **Aplicação funcionando!**

---

## 🔄 Passo 6: Configurar Auto-Deploy

### 6.1 Ativar Auto-Deploy

1. No Render Dashboard, vá para **"Settings"**
2. Procure por **"Auto-Deploy"**
3. Selecione **"Yes"**
4. Escolha a branch: `main`

### 6.2 Como Funciona

Agora, sempre que você fizer push para a branch `main` no GitHub:

1. Render detecta a mudança
2. Faz o build automático
3. Deploy automático da nova versão
4. Sua aplicação é atualizada

✅ **Auto-deploy ativado!**

---

## 📊 Passo 7: Monitorar a Aplicação

### 7.1 Acessar Logs

1. No Render Dashboard, clique em **"Logs"**
2. Você verá:
   - ✅ Logs do servidor
   - ✅ Erros e avisos
   - ✅ Requisições HTTP

### 7.2 Monitorar Saúde

1. Vá para **"Metrics"**
2. Você verá:
   - CPU usage
   - Memory usage
   - Request count
   - Response time

✅ **Monitorando a aplicação!**

---

## 🌍 Passo 8: Configurar Domínio Customizado (Opcional)

### 8.1 Usar Domínio Render

Seu domínio padrão gerado pelo Render será substituído pelo seu oficial.

### 8.2 Usar Domínio Customizado

1. Compre um domínio (ex: em Namecheap, GoDaddy, etc)
2. No Render Dashboard do bot, vá para **"Settings"** → **"Custom Domain"**
3. Adicione seu domínio: `crm.agenciaverticale.com.br`
4. Siga as instruções para configurar DNS

✅ **Domínio customizado configurado!**

---

## 🔗 Passo 9: Configurar Webhooks

### 9.1 URL do Webhook

- **WhatsApp:** `https://crm.agenciaverticale.com.br/api/whatsapp/webhook`
- **Instagram:** `https://crm.agenciaverticale.com.br/api/webhook/instagram`

### 9.2 Configurar no Evolution API

1. Vá para o painel da Evolution API
2. Configure o webhook da instância para: `https://crm.agenciaverticale.com.br/api/whatsapp/webhook`
3. Salve as configurações

### 9.3 Configurar no Meta Graph API

1. Vá para o Meta for Developers
2. Configure o webhook para: `https://crm.agenciaverticale.com.br/api/webhook/instagram`
3. Salve as configurações

✅ **Webhooks configurados!**

---

## 📝 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código feito push para GitHub
- [ ] Projeto criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy concluído com sucesso
- [ ] Aplicação acessível online
- [ ] Auto-deploy ativado
- [ ] Webhooks configurados
- [ ] Domínio customizado (opcional)

---

## 🆘 Troubleshooting

### Erro: "Build failed"

1. Verifique os logs no Render
2. Procure por erros de dependências
3. Verifique se o `package.json` está correto

### Erro: "Database connection failed"

1. Verifique se a `DATABASE_URL` está correta
2. Verifique se o Supabase está online
3. Verifique se o IP do Render está permitido no Supabase

### Erro: "Application crashed"

1. Verifique os logs
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Reinicie o serviço no Render

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs no Render Dashboard
2. Consulte a documentação do Render: [https://render.com/docs](https://render.com/docs)
3. Consulte a documentação do Supabase: [https://supabase.com/docs](https://supabase.com/docs)

---

**Parabéns! 🎉 Sua aplicação está rodando online no Render!**
