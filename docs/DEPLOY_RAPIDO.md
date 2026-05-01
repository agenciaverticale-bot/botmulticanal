# ⚡ Deploy Rápido no Render (10 Minutos)

Guia rápido para fazer deploy da aplicação no Render.

---

## 1️⃣ Preparar GitHub (2 minutos)

```bash
cd d:/programacao/botmulticanal

git init
git remote add origin https://github.com/SEU_USERNAME/botmulticanal.git
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```

---

## 2️⃣ Criar Projeto no Render (3 minutos)

1. Vá para: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Selecione seu repositório `botmulticanal`
4. Preencha:
   - **Name**: `botmulticanal`
   - **Environment**: `Docker`
   - **Region**: `São Paulo (sao)`
   - **Branch**: `main`
   - **Auto-deploy**: `Yes`

---

## 3️⃣ Configurar Variáveis (3 minutos)

Vá para **"Environment"** e adicione:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:Contato@2026@db.uxvntliomktkrojnlbwi.supabase.co:5432/postgres
SUPABASE_URL=https://uxvntliomktkrojnlbwi.supabase.co
SUPABASE_KEY=sb_publishable_Ivq2WQtgQxh76bhbjWvk7Q_IA9KREHD
JWT_SECRET=gere_uma_chave_segura_aqui
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_chave
```

---

## 4️⃣ Fazer Deploy (2 minutos)

1. Clique em **"Deploy"**
2. Aguarde o build (5-10 minutos)
3. Você receberá uma URL: `https://botmulticanal.onrender.com`

---

## ✅ Pronto!

Sua aplicação está online! 🎉

Para mais detalhes, leia: `docs/DEPLOY_RENDER.md`
