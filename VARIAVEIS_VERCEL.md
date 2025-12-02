# Variáveis de Ambiente para o Vercel - Hayah Alexsandra Livro

## 📋 Resumo

Este documento lista todas as variáveis de ambiente necessárias para configurar o projeto **hayah-alexsandra-livro** no Vercel.

---

## 🔧 Variáveis Obrigatórias

### 1. Banco de Dados (PostgreSQL via Supabase)
- **`DATABASE_URL`**
  - **Descrição**: URL de conexão com o banco de dados PostgreSQL do Supabase
  - **Formato**: `postgresql://user:password@host:port/database`
  - **Exemplo**: `postgresql://postgres:senha@db.xxx.supabase.co:5432/postgres`
  - **Ambiente**: Production, Preview, Development
  - **Obtenção**: Supabase Dashboard → Settings → Database → Connection String (Transaction pooler)

---

## 🔐 Variáveis de Autenticação (Supabase)

### 2. Supabase URL
- **`VITE_SUPABASE_URL`**
  - **Descrição**: URL do projeto Supabase
  - **Formato**: URL completa
  - **Exemplo**: `https://xxxxxxxxxxxxx.supabase.co`
  - **Ambiente**: Production, Preview, Development
  - **Obtenção**: Supabase Dashboard → Settings → API → Project URL

### 3. Supabase Anon Key
- **`VITE_SUPABASE_ANON_KEY`**
  - **Descrição**: Chave pública (anon) do Supabase para autenticação
  - **Formato**: String JWT
  - **Exemplo**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **Ambiente**: Production, Preview, Development
  - **Obtenção**: Supabase Dashboard → Settings → API → Project API keys → anon public

### 4. JWT Secret (para cookies)
- **`JWT_SECRET`**
  - **Descrição**: Chave secreta para assinatura de cookies de sessão
  - **Formato**: String aleatória segura (mínimo 32 caracteres)
  - **Exemplo**: `sua-chave-secreta-muito-segura-aqui-min-32-chars`
  - **Ambiente**: Production, Preview, Development
  - **Geração**: Use `openssl rand -base64 32` ou gerador online

---

## 💳 Gateway de Pagamento (Pagar.me)

### 5. Pagar.me API Key
- **`PAGARME_API_KEY`**
  - **Descrição**: Chave de API do Pagar.me para processar pagamentos
  - **Formato**: String da chave de API
  - **Exemplo**: `sk_test_xxxxxxxxxxxxx` (teste) ou `sk_live_xxxxxxxxxxxxx` (produção)
  - **Ambiente**: Production, Preview, Development
  - **Obtenção**: Dashboard do Pagar.me → Configurações → API Keys

### 6. Pagar.me API URL
- **`PAGARME_API_URL`**
  - **Descrição**: URL base da API do Pagar.me
  - **Formato**: URL completa
  - **Valor Padrão**: `https://api.pagar.me/core/v5`
  - **Ambiente**: Production, Preview, Development

---

## 📧 Serviço de Email

### 7. Resend API Key (Opção 1 - Recomendado)
- **`RESEND_API_KEY`**
  - **Descrição**: Chave de API do Resend para envio de emails
  - **Formato**: String da chave de API
  - **Exemplo**: `re_xxxxxxxxxxxxx`
  - **Ambiente**: Production, Preview, Development
  - **Obtenção**: Dashboard do Resend → API Keys
  - **Nota**: Use Resend OU SendGrid, não ambos

### 8. SendGrid API Key (Opção 2)
- **`SENDGRID_API_KEY`**
  - **Descrição**: Chave de API do SendGrid para envio de emails (alternativa ao Resend)
  - **Formato**: String da chave de API
  - **Exemplo**: `SG.xxxxxxxxxxxxx`
  - **Ambiente**: Production, Preview, Development
  - **Obtenção**: Dashboard do SendGrid → Settings → API Keys
  - **Nota**: Use SendGrid OU Resend, não ambos

### 9. Email From
- **`EMAIL_FROM`**
  - **Descrição**: Endereço de email remetente
  - **Formato**: Email válido
  - **Valor Padrão**: `noreply@hayahlivros.com.br`
  - **Ambiente**: Production, Preview, Development

### 10. Email From Name
- **`EMAIL_FROM_NAME`**
  - **Descrição**: Nome do remetente exibido nos emails
  - **Formato**: String
  - **Valor Padrão**: `Hayah Livros`
  - **Ambiente**: Production, Preview, Development

---

## 📦 Melhor Envio (Frete)

### 11. Melhor Envio Token
- **`MELHOR_ENVIO_TOKEN`**
  - **Descrição**: Token de autenticação da API do Melhor Envio
  - **Formato**: Bearer token
  - **Exemplo**: `eyJ0eXAiOiJKV1QiLCJhbGc...`
  - **Ambiente**: Production, Preview, Development
  - **Obtenção**: Dashboard do Melhor Envio → Configurações → API

### 12. Melhor Envio URL
- **`MELHOR_ENVIO_URL`**
  - **Descrição**: URL base da API do Melhor Envio
  - **Formato**: URL completa
  - **Valor Padrão**: `https://sandbox.melhorenvio.com.br` (sandbox)
  - **Produção**: `https://melhorenvio.com.br`
  - **Ambiente**: Production, Preview, Development

### 13. Melhor Envio From CEP
- **`MELHOR_ENVIO_FROM_CEP`**
  - **Descrição**: CEP de origem para cálculo de frete
  - **Formato**: 8 dígitos sem formatação
  - **Exemplo**: `01310100`
  - **Ambiente**: Production, Preview, Development

### 14. Melhor Envio Email
- **`MELHOR_ENVIO_EMAIL`**
  - **Descrição**: Email cadastrado no Melhor Envio (usado no User-Agent)
  - **Formato**: Email válido
  - **Exemplo**: `contact@hayahlivros.com.br`
  - **Ambiente**: Production, Preview, Development

---

## 🏗️ Forge API (Opcional)

### 15. Built-in Forge API URL
- **`BUILT_IN_FORGE_API_URL`**
  - **Descrição**: URL da API Forge interna
  - **Formato**: URL completa
  - **Ambiente**: Production, Preview, Development
  - **Nota**: Opcional, usado para funcionalidades específicas

### 16. Built-in Forge API Key
- **`BUILT_IN_FORGE_API_KEY`**
  - **Descrição**: Chave de API do Forge
  - **Formato**: String da chave de API
  - **Ambiente**: Production, Preview, Development
  - **Nota**: Opcional, usado para funcionalidades específicas

---

## 🌍 Ambiente

### 17. Node Environment
- **`NODE_ENV`**
  - **Descrição**: Ambiente de execução do Node.js
  - **Formato**: String
  - **Valores**: `production`, `development`, `test`
  - **Ambiente**: Production → `production`, Preview → `development`, Development → `development`
  - **Nota**: Geralmente configurado automaticamente pelo Vercel

---

## 📝 Instruções de Configuração no Vercel

### Passo a Passo:

1. **Acesse o Dashboard do Vercel**
   - Vá para [vercel.com](https://vercel.com)
   - Selecione o projeto **hayah-alexsandra-livro**

2. **Navegue até Environment Variables**
   - Clique em **Settings**
   - Selecione **Environment Variables** no menu lateral

3. **Adicione cada variável**
   - Clique em **Add New**
   - Insira o **Name** (nome da variável)
   - Insira o **Value** (valor da variável)
   - Selecione os ambientes: **Production**, **Preview**, **Development**
   - Clique em **Save**

4. **Redeploy após configurar**
   - Após adicionar todas as variáveis, faça um novo deploy
   - Vá para **Deployments**
   - Clique nos três pontos do último deployment
   - Selecione **Redeploy**

---

## ✅ Checklist de Configuração

- [ ] `DATABASE_URL` - **OBRIGATÓRIO** (PostgreSQL do Supabase)
- [ ] `VITE_SUPABASE_URL` - **OBRIGATÓRIO**
- [ ] `VITE_SUPABASE_ANON_KEY` - **OBRIGATÓRIO**
- [ ] `JWT_SECRET` - **OBRIGATÓRIO** (para cookies de sessão)
- [ ] `PAGARME_API_KEY` - **OBRIGATÓRIO**
- [ ] `PAGARME_API_URL` - Recomendado
- [ ] `RESEND_API_KEY` ou `SENDGRID_API_KEY` - **OBRIGATÓRIO** (escolha um)
- [ ] `EMAIL_FROM` - Recomendado
- [ ] `EMAIL_FROM_NAME` - Recomendado
- [ ] `MELHOR_ENVIO_TOKEN` - **OBRIGATÓRIO**
- [ ] `MELHOR_ENVIO_URL` - Recomendado
- [ ] `MELHOR_ENVIO_FROM_CEP` - **OBRIGATÓRIO**
- [ ] `MELHOR_ENVIO_EMAIL` - Recomendado
- [ ] `BUILT_IN_FORGE_API_URL` - Opcional
- [ ] `BUILT_IN_FORGE_API_KEY` - Opcional

---

## 🔍 Observações Importantes

1. **Segurança**: Nunca compartilhe suas chaves de API publicamente ou em repositórios Git
2. **Ambientes**: Configure valores diferentes para Production e Preview quando necessário (ex: sandbox vs produção)
3. **Teste**: Após configurar, teste todas as funcionalidades (autenticação, pagamento, email, frete)
4. **Backup**: Mantenha um backup seguro de todas as suas chaves de API
5. **Supabase**: Certifique-se de que as políticas RLS (Row Level Security) estão configuradas corretamente no Supabase

---

## 🆘 Suporte

Se tiver dúvidas sobre como obter alguma dessas chaves:
- **Supabase**: https://supabase.com/docs
- **Pagar.me**: https://docs.pagar.me
- **Resend**: https://resend.com/docs
- **SendGrid**: https://docs.sendgrid.com
- **Melhor Envio**: https://docs.melhorenvio.com.br

---

**Última atualização**: 02 de dezembro de 2024
