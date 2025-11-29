# PROMPT PARA IA/CODER - PROJETO HAYAH ALEXSANDRA LIVRO

## CONTEXTO DO PROJETO

Você vai desenvolver um sistema completo de vendas para o livro "Mulher Sábia, Vida Próspera" da autora Alexsandra Sardinha, publicado pela Editora Hayah. O sistema deve ser uma aplicação web moderna que permite:

1. Landing page de alta conversão para venda do livro
2. Checkout completo com cálculo de frete e pagamento
3. Área do cliente para acompanhamento de pedidos
4. Painel administrativo para gestão de vendas, estoque e comunicação

---

## STACK TECNOLÓGICA OBRIGATÓRIA

- **Framework**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Pagamentos**: Pagar.me API v5
- **WhatsApp**: 2chat API
- **Frete**: Melhor Envio API (ou Correios SIGEPWeb)
- **E-mail**: Resend
- **Deploy**: Vercel

---

## ESTRUTURA DE DIRETÓRIOS

```
hayah-alexsandra-livro/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Landing page
│   │   ├── checkout/page.tsx        # Checkout
│   │   ├── login/page.tsx           # Login
│   │   └── cadastro/page.tsx        # Cadastro
│   ├── (auth)/
│   │   └── minha-conta/
│   │       ├── page.tsx             # Dashboard cliente
│   │       ├── pedidos/page.tsx     # Lista de pedidos
│   │       └── pedidos/[id]/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx             # Dashboard admin
│   │       ├── pedidos/page.tsx
│   │       ├── contatos/page.tsx
│   │       ├── estoque/page.tsx
│   │       ├── etiquetas/page.tsx
│   │       └── whatsapp/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── checkout/
│   │   ├── shipping/
│   │   ├── admin/
│   │   └── webhooks/
│   │       ├── pagarme/route.ts
│   │       └── 2chat/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                          # shadcn/ui
│   ├── landing/
│   ├── checkout/
│   ├── admin/
│   └── shared/
├── lib/
│   ├── supabase/
│   ├── pagarme/
│   ├── 2chat/
│   ├── shipping/
│   └── email/
├── types/
├── hooks/
└── utils/
```

---

## IDENTIDADE VISUAL

**Cores principais:**
- Rosa principal: #E91E63
- Rosa escuro: #880E4F
- Rosa claro: #FCE4EC
- Branco: #FFFFFF
- Cinza texto: #333333

**Tipografia:**
- Títulos: Font family moderna (Inter ou Poppins)
- Corpo: System font stack

**Estilo geral:**
- Design clean e elegante
- Muito espaço em branco
- Botões arredondados
- Sombras sutis
- Mobile-first

---

## FUNCIONALIDADES DETALHADAS

### 1. LANDING PAGE (/)

**Seções obrigatórias:**

1. **Header fixo**
   - Logo Hayah (esquerda)
   - Botão "Comprar o Livro" (direita, cor rosa)

2. **Hero Section**
   - Título: "Mulher Sábia, Vida Próspera"
   - Subtítulo: "Um ano inteiro aprendendo com Provérbios a viver com equilíbrio, abundância e graça"
   - Imagem do livro (mockup 3D)
   - Botão CTA grande: "Quero Meu Exemplar"
   - Badge "Lançamento"

3. **Sobre a Autora**
   - Foto de Alexsandra Sardinha
   - Bio em 3-4 parágrafos
   - Credenciais

4. **Sobre o Livro**
   - Sinopse
   - Lista de benefícios/aprendizados
   - Estrutura (365 dias)

5. **Para Quem É**
   - 4-6 perfis de leitoras ideais
   - Ícones ilustrativos

6. **Depoimentos**
   - 3-6 cards com foto, nome e testemunho
   - Carrossel em mobile

7. **Oferta/Preço**
   - Preço: R$ 89,90
   - Lista de bônus (se houver)
   - Garantia 7 dias
   - Formas de pagamento
   - CTA final

8. **Footer**
   - Logo
   - Links legais
   - Contato
   - CNPJ

---

### 2. CHECKOUT (/checkout)

**Fluxo em 3 passos com stepper visual:**

**Passo 1 - Identificação:**
```typescript
interface CustomerData {
  name: string;        // Obrigatório, min 3 chars
  email: string;       // Obrigatório, formato válido, único
  cpf: string;         // Obrigatório, CPF válido
  phone: string;       // Obrigatório, formato (XX) XXXXX-XXXX
  password: string;    // Obrigatório, min 6 chars
}
```

**Passo 2 - Endereço:**
```typescript
interface AddressData {
  cep: string;         // Auto-busca via ViaCEP
  street: string;      // Auto-preenchido
  number: string;      // Manual
  complement?: string; // Opcional
  district: string;    // Auto-preenchido
  city: string;        // Auto-preenchido
  state: string;       // Auto-preenchido
}

interface ShippingOption {
  method: 'PAC' | 'SEDEX';
  price: number;
  days: number;
}
```

**Passo 3 - Pagamento:**
```typescript
// Cartão de Crédito
interface CardPayment {
  number: string;
  holderName: string;
  expiry: string;      // MM/YY
  cvv: string;
  installments: 1 | 2 | 3;
}

// Pix
interface PixPayment {
  // Gera QR Code automaticamente
  qrCode: string;
  copyPaste: string;
  expiresAt: Date;     // 30 minutos
}
```

**Resumo lateral fixo:**
- Imagem do produto
- Nome do produto
- Quantidade
- Subtotal
- Frete
- Total

---

### 3. ÁREA DO CLIENTE (/minha-conta)

**Menu lateral:**
- Meus Pedidos
- Meus Dados
- Alterar Senha
- Sair

**Lista de Pedidos:**
```typescript
interface OrderCard {
  orderNumber: number;
  createdAt: Date;
  status: OrderStatus;
  totalCents: number;
}
```

**Detalhes do Pedido:**
- Timeline de status (visual)
- Código de rastreio (quando disponível)
- Link para rastrear nos Correios
- Itens do pedido
- Endereço de entrega
- Forma de pagamento

**Status com cores:**
```typescript
const statusColors = {
  AGUARDANDO_PAGAMENTO: 'yellow',
  PAGO: 'green',
  EM_SEPARACAO: 'blue',
  POSTADO: 'purple',
  EM_TRANSITO: 'orange',
  ENTREGUE: 'emerald',
  PROBLEMA: 'red',
};
```

---

### 4. ADMIN (/admin)

**Autenticação:** Apenas usuários com `role = 'admin'`

**4.1 Dashboard:**
- Card: Faturamento total
- Card: Faturamento hoje
- Card: Número de pedidos
- Card: Ticket médio
- Gráfico: Vendas últimos 30 dias (linha)
- Tabela: Últimos 5 pedidos

**4.2 Pedidos:**
- Tabela com filtros e busca
- Colunas: #, Cliente, Data, Valor, Status, Pagamento, Ações
- Ações: Ver, Atualizar status, Inserir rastreio, Gerar etiqueta

**4.3 Etiquetas:**
- Lista de pedidos PAGO sem etiqueta
- Checkbox para seleção múltipla
- Botão "Gerar Etiquetas Selecionadas"
- Gera PDF combinado para impressão
- Atualiza status e envia notificações

**4.4 Contatos:**
- Lista de leads/clientes
- Exportar CSV
- Link para WhatsApp

**4.5 Estoque:**
- Card com estoque atual
- Formulário para entrada de estoque
- Histórico de movimentações

**4.6 WhatsApp:**
- Lista de conversas (inbox)
- Visualização de mensagens
- Campo para resposta

---

## INTEGRAÇÕES

### Pagar.me

```typescript
// Criar transação cartão
const transaction = await pagarme.transactions.create({
  amount: totalCents,
  payment_method: 'credit_card',
  card_number: '...',
  card_holder_name: '...',
  card_expiration_date: '...',
  card_cvv: '...',
  customer: { ... },
  billing: { ... },
  shipping: { ... },
  items: [{ ... }],
  postback_url: `${APP_URL}/api/webhooks/pagarme`,
});

// Criar transação Pix
const transaction = await pagarme.transactions.create({
  amount: totalCents,
  payment_method: 'pix',
  pix_expiration_date: addMinutes(new Date(), 30),
  customer: { ... },
  postback_url: `${APP_URL}/api/webhooks/pagarme`,
});
```

### Webhook Pagar.me

```typescript
// POST /api/webhooks/pagarme
export async function POST(request: Request) {
  const body = await request.json();
  
  // Validar assinatura
  const signature = request.headers.get('x-hub-signature');
  if (!validateSignature(body, signature)) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  const { id, current_status } = body;
  
  if (current_status === 'paid') {
    // Atualizar pedido para PAGO
    // Enviar e-mail
    // Enviar WhatsApp
  }
  
  return new Response('OK');
}
```

### 2chat (WhatsApp)

```typescript
// Enviar mensagem
async function sendWhatsApp(phone: string, message: string) {
  const response = await fetch('https://api.2chat.io/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TWOCHAT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: phone,
      body: message,
    }),
  });
  return response.json();
}
```

### Melhor Envio

```typescript
// Calcular frete
async function calculateShipping(cep: string, weight: number) {
  const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { postal_code: ORIGIN_CEP },
      to: { postal_code: cep },
      package: {
        weight: weight / 1000, // em kg
        width: 16,
        height: 23,
        length: 3,
      },
      services: '1,2', // PAC e SEDEX
    }),
  });
  return response.json();
}

// Gerar etiqueta
async function generateLabel(orderId: string, orderData: any) {
  // 1. Criar pedido no Melhor Envio
  // 2. Pagar frete
  // 3. Gerar etiqueta
  // 4. Retornar URL do PDF e código de rastreio
}
```

---

## VARIÁVEIS DE AMBIENTE

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Pagar.me
PAGARME_API_KEY=
PAGARME_ENCRYPTION_KEY=
PAGARME_WEBHOOK_SECRET=

# 2chat
TWOCHAT_API_KEY=
TWOCHAT_PHONE_ID=
TWOCHAT_WEBHOOK_SECRET=

# Melhor Envio
MELHOR_ENVIO_TOKEN=
MELHOR_ENVIO_SANDBOX=true

# E-mail
RESEND_API_KEY=
EMAIL_FROM=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=
```

---

## TEMPLATES DE MENSAGEM

### E-mail: Compra Aprovada
**Assunto:** Sua compra foi aprovada! Pedido #{{order_number}}

### WhatsApp: Compra Aprovada
```
Olá, {{nome}}! 🎉

Sua compra do livro *Mulher Sábia, Vida Próspera* foi aprovada!

📦 Pedido: #{{order_number}}
💰 Valor: R$ {{total}}
📬 Previsão de postagem: {{estimated_post_date}}

Assim que seu pedido for enviado, você receberá o código de rastreio.

Qualquer dúvida, é só responder esta mensagem!

Com carinho,
Equipe Hayah 💗
```

### WhatsApp: Pedido Enviado
```
Olá, {{nome}}! 🚚

Seu pedido #{{order_number}} foi ENVIADO!

📬 Código de rastreio: {{tracking_code}}
🔗 Acompanhe: {{tracking_url}}

Previsão de entrega: {{estimated_delivery}}

Equipe Hayah 💗
```

---

## ORDEM DE IMPLEMENTAÇÃO

### Semana 1:
1. Setup Next.js + TypeScript + Tailwind
2. Configurar Supabase + criar tabelas
3. Implementar Landing Page completa
4. Implementar autenticação (cadastro/login)

### Semana 2:
5. Implementar Checkout (3 passos)
6. Integrar Pagar.me (cartão + Pix)
7. Implementar webhook Pagar.me
8. E-mail de compra aprovada

### Semana 3:
9. Área do cliente (meus pedidos)
10. Admin: Dashboard
11. Admin: Lista de pedidos

### Semana 4:
12. Integrar cálculo de frete
13. Admin: Gestão de pedidos
14. Admin: Estoque básico

### Semana 5:
15. Integrar 2chat (envio de mensagens)
16. Webhook 2chat (recebimento)
17. Admin: Tela de conversas WhatsApp

### Semana 6:
18. Geração de etiquetas (Melhor Envio)
19. Impressão em lote
20. Testes e ajustes finais

---

## REGRAS DE NEGÓCIO IMPORTANTES

1. **Estoque:** Reduzir automaticamente quando pedido for PAGO
2. **Status:** Registrar histórico de todas as mudanças
3. **Notificações:** Enviar e-mail E WhatsApp em cada mudança de status
4. **Frete:** Calcular em tempo real, nunca cachear por muito tempo
5. **Pagamento Pix:** Expirar em 30 minutos
6. **Parcelamento:** Máximo 3x sem juros, mínimo R$ 30/parcela
7. **Segurança:** Validar webhook signatures, usar RLS no Supabase

---

## COMECE AGORA

Inicie criando:
1. O projeto Next.js com a estrutura de pastas
2. Configure o Supabase e execute o SQL do schema
3. Implemente a Landing Page com todos os componentes
4. Configure as variáveis de ambiente

Boa sorte! 🚀
