# 📚 Hayah Alexsandra Livro

Sistema completo de vendas para o livro "Mulher Sábia, Vida Próspera" de Alexsandra Sardinha.

## 📁 Arquivos do Projeto

Este pacote contém todos os arquivos necessários para iniciar o desenvolvimento:

### Documentação
| Arquivo | Descrição |
|---------|-----------|
| `especificacao-hayah-alexsandra-livro.docx` | Especificação técnica resumida |
| `especificacao-completa-hayah-alexsandra.docx` | Especificação técnica completa (14 seções) |
| `prompt-ia-coder.md` | Prompt otimizado para IAs de código |

### Banco de Dados
| Arquivo | Descrição |
|---------|-----------|
| `schema-completo.sql` | Schema PostgreSQL completo (14 tabelas, triggers, RLS) |

### Código-Fonte
| Arquivo | Descrição |
|---------|-----------|
| `types.ts` | Tipos TypeScript para todo o sistema |
| `env.example` | Template de variáveis de ambiente |
| `components/landing/index.tsx` | Componentes da Landing Page |
| `components/checkout/index.tsx` | Componentes do Checkout |
| `api-handlers.ts` | Handlers das APIs (parte 1) |
| `api-handlers-part2.ts` | Handlers das APIs (parte 2) |
| `lib/index.ts` | Bibliotecas de integração (Pagar.me, 2chat, Resend) |

### Protótipo
| Arquivo | Descrição |
|---------|-----------|
| `hayah-alexsandra-livro.jsx` | Protótipo interativo em React |

---

## 🚀 Quick Start

### 1. Criar o Projeto Next.js

```bash
npx create-next-app@latest hayah-alexsandra-livro --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
cd hayah-alexsandra-livro
```

### 2. Instalar Dependências

```bash
# Core
npm install @supabase/supabase-js @supabase/ssr

# UI
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-radio-group @radix-ui/react-select @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Forms
npm install react-hook-form @hookform/resolvers zod

# Utils
npm install date-fns axios

# Email
npm install resend

# Charts (admin dashboard)
npm install recharts
```

### 3. Configurar shadcn/ui

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label badge radio-group select
```

### 4. Configurar Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em SQL Editor e execute o arquivo `schema-completo.sql`
3. Copie as chaves de API em Settings > API

### 5. Configurar Variáveis de Ambiente

```bash
cp env.example .env.local
# Edite o .env.local com suas chaves
```

### 6. Estrutura de Pastas

Crie a estrutura de pastas conforme o prompt:

```bash
mkdir -p app/{(public),(auth)/minha-conta/pedidos,(admin)/admin}
mkdir -p app/api/{auth,checkout,shipping,admin,webhooks}
mkdir -p components/{ui,landing,checkout,admin,shared}
mkdir -p lib/{supabase,pagarme,2chat,shipping,email}
mkdir -p types hooks utils
```

### 7. Copiar Arquivos

Copie os arquivos deste pacote para as respectivas pastas:

- `types.ts` → `types/index.ts`
- `components/landing/index.tsx` → `components/landing/index.tsx`
- `components/checkout/index.tsx` → `components/checkout/index.tsx`
- `lib/index.ts` → divida entre os arquivos em `lib/`

---

## 🔧 Configurações Externas

### Pagar.me
1. Crie conta em [pagar.me](https://pagar.me)
2. Obtenha as chaves de API em Dashboard > Configurações
3. Configure o webhook para `{APP_URL}/api/webhooks/pagarme`

### 2chat (WhatsApp)
1. Crie conta em [2chat.io](https://2chat.io)
2. Conecte seu número WhatsApp Business
3. Configure o webhook para `{APP_URL}/api/webhooks/2chat`

### Melhor Envio
1. Crie conta em [melhorenvio.com.br](https://melhorenvio.com.br)
2. Gere um token OAuth2 em Configurações > Integrações
3. Ative o ambiente sandbox para testes

### Resend (E-mail)
1. Crie conta em [resend.com](https://resend.com)
2. Verifique seu domínio
3. Obtenha a API Key

---

## 📋 Checklist de Implementação

### Fase 1 - MVP (Semanas 1-2)
- [ ] Setup Next.js + TypeScript + Tailwind
- [ ] Configurar Supabase + executar SQL
- [ ] Landing Page completa
- [ ] Autenticação (cadastro/login)
- [ ] Checkout (3 passos)
- [ ] Integração Pagar.me
- [ ] E-mail de compra aprovada

### Fase 2 - Admin Básico (Semanas 3-4)
- [ ] Dashboard financeiro
- [ ] Listagem de pedidos
- [ ] Área do cliente
- [ ] Gestão de pedidos
- [ ] Gestão de contatos
- [ ] Cálculo de frete

### Fase 3 - Integrações (Semanas 5-6)
- [ ] Integração 2chat (envio)
- [ ] Webhook WhatsApp (recebimento)
- [ ] Tela de conversas admin
- [ ] Geração de etiquetas
- [ ] Impressão em lote
- [ ] Gestão de estoque

### Fase 4 - Polimento (Semana 7)
- [ ] Testes E2E
- [ ] Ajustes UX/UI
- [ ] Otimização performance
- [ ] Monitoramento
- [ ] Deploy produção

---

## 🎨 Identidade Visual

### Cores
```css
:root {
  --pink-primary: #E91E63;
  --pink-dark: #880E4F;
  --pink-light: #FCE4EC;
}
```

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        pink: {
          50: '#FCE4EC',
          100: '#F8BBD9',
          200: '#F48FB1',
          300: '#F06292',
          400: '#EC407A',
          500: '#E91E63',
          600: '#D81B60',
          700: '#C2185B',
          800: '#AD1457',
          900: '#880E4F',
        },
      },
    },
  },
};
```

---

## 📱 Rotas do Sistema

### Públicas
| Rota | Descrição |
|------|-----------|
| `/` | Landing Page |
| `/checkout` | Checkout |
| `/login` | Login |
| `/cadastro` | Cadastro |
| `/recuperar-senha` | Recuperar senha |

### Cliente (autenticado)
| Rota | Descrição |
|------|-----------|
| `/minha-conta` | Dashboard do cliente |
| `/minha-conta/pedidos` | Lista de pedidos |
| `/minha-conta/pedidos/[id]` | Detalhes do pedido |
| `/minha-conta/dados` | Editar dados |

### Admin
| Rota | Descrição |
|------|-----------|
| `/admin` | Dashboard |
| `/admin/pedidos` | Gestão de pedidos |
| `/admin/contatos` | Lista de contatos |
| `/admin/estoque` | Gestão de estoque |
| `/admin/etiquetas` | Geração de etiquetas |
| `/admin/whatsapp` | Conversas WhatsApp |

---

## 🔐 Segurança

1. **Row Level Security (RLS)** habilitado em todas as tabelas
2. **Validação de webhooks** com assinatura HMAC
3. **Rate limiting** em APIs públicas
4. **Sanitização** de inputs com Zod
5. **Tokens JWT** para autenticação

---

## 📞 Suporte

Para dúvidas sobre a implementação, consulte:

1. A especificação técnica completa
2. O prompt para IA/Coder
3. Os comentários nos arquivos de código

---

## 📄 Licença

Este projeto é de uso exclusivo para a Editora Hayah.

---

**Desenvolvido com 💗 para Alexsandra Sardinha e Editora Hayah**
