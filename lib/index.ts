// ============================================================================
// HAYAH ALEXSANDRA LIVRO - BIBLIOTECAS DE INTEGRAÇÃO
// ============================================================================

// ============================================================================
// 1. LIB SUPABASE - CLIENT
// ============================================================================
// Arquivo: lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}


// ============================================================================
// 2. LIB SUPABASE - SERVER
// ============================================================================
// Arquivo: lib/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Handle cookies in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookies in middleware
          }
        },
      },
    }
  );
}

// Admin client with service role
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}


// ============================================================================
// 3. LIB AUTH
// ============================================================================
// Arquivo: lib/auth.ts

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface AuthUser {
  id: string;
  email: string;
  role: 'customer' | 'admin';
  name: string;
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, role, name')
    .eq('id', user.user_metadata?.user_id || user.id)
    .single();

  return profile;
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    redirect('/minha-conta');
  }

  return user;
}


// ============================================================================
// 4. LIB PAGAR.ME
// ============================================================================
// Arquivo: lib/pagarme.ts

import crypto from 'crypto';

const PAGARME_API_URL = 'https://api.pagar.me/core/v5';

interface PagarmeTransactionData {
  amount: number;
  payment_method: 'credit_card' | 'pix' | 'boleto';
  customer: {
    external_id: string;
    name: string;
    email: string;
    country: string;
    type: string;
    documents: { type: string; number: string }[];
    phone_numbers: string[];
  };
  billing: {
    name: string;
    address: {
      country: string;
      state: string;
      city: string;
      neighborhood: string;
      street: string;
      street_number: string;
      zipcode: string;
    };
  };
  shipping?: any;
  items: {
    id: string;
    title: string;
    unit_price: number;
    quantity: number;
    tangible: boolean;
  }[];
  metadata?: Record<string, any>;
  postback_url?: string;
  // Card fields
  card_number?: string;
  card_holder_name?: string;
  card_expiration_date?: string;
  card_cvv?: string;
  installments?: number;
  // Pix fields
  pix_expiration_date?: string;
}

interface PagarmeTransaction {
  id: number;
  status: string;
  amount: number;
  installments?: number;
  pix_qr_code?: string;
  pix_qr_code_url?: string;
  pix_copy_paste?: string;
  pix_expiration_date?: string;
  card?: {
    last_digits: string;
    brand: string;
    holder_name: string;
  };
  boleto_url?: string;
  boleto_barcode?: string;
  boleto_expiration_date?: string;
}

export async function createPagarmeTransaction(
  data: PagarmeTransactionData
): Promise<PagarmeTransaction> {
  const response = await fetch(`${PAGARME_API_URL}/transactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(
        process.env.PAGARME_API_KEY + ':'
      ).toString('base64')}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Pagar.me error:', error);
    throw new Error(error.errors?.[0]?.message || 'Erro ao processar pagamento');
  }

  return response.json();
}

export async function getPagarmeTransaction(
  transactionId: string
): Promise<PagarmeTransaction> {
  const response = await fetch(
    `${PAGARME_API_URL}/transactions/${transactionId}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          process.env.PAGARME_API_KEY + ':'
        ).toString('base64')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao buscar transação');
  }

  return response.json();
}

export async function refundPagarmeTransaction(
  transactionId: string,
  amount?: number
): Promise<PagarmeTransaction> {
  const body: any = {};
  if (amount) {
    body.amount = amount;
  }

  const response = await fetch(
    `${PAGARME_API_URL}/transactions/${transactionId}/refund`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(
          process.env.PAGARME_API_KEY + ':'
        ).toString('base64')}`,
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao reembolsar transação');
  }

  return response.json();
}

export function validatePagarmeSignature(
  payload: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha1', process.env.PAGARME_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  return `sha1=${expectedSignature}` === signature;
}


// ============================================================================
// 5. LIB 2CHAT (WHATSAPP)
// ============================================================================
// Arquivo: lib/2chat.ts

import crypto from 'crypto';

const TWOCHAT_API_URL = process.env.TWOCHAT_API_URL || 'https://api.2chat.io/v1';

interface SendWhatsAppParams {
  phone: string;
  template?: string;
  variables?: Record<string, string>;
  message?: string;
}

interface SendWhatsAppResult {
  id: string;
  status: string;
}

// Template messages
const TEMPLATES: Record<string, string> = {
  MSG_COMPRA_APROVADA: `Olá, {{nome}}! 🎉

Sua compra do livro *Mulher Sábia, Vida Próspera* foi aprovada!

📦 Pedido: #{{order_number}}
💰 Valor: R$ {{total}}
📬 Previsão de postagem: em até 2 dias úteis

Assim que seu pedido for enviado, você receberá o código de rastreio.

Qualquer dúvida, é só responder esta mensagem!

Com carinho,
Equipe Hayah 💗`,

  MSG_PEDIDO_SEPARADO: `Olá, {{nome}}! 📦

Seu pedido #{{order_number}} está sendo preparado para envio!

Em breve você receberá o código de rastreio.

Equipe Hayah 💗`,

  MSG_PEDIDO_POSTADO: `Olá, {{nome}}! 🚚

Seu pedido #{{order_number}} foi ENVIADO!

📬 Código de rastreio: {{tracking_code}}
🔗 Acompanhe: https://www.linkcorreios.com.br/?id={{tracking_code}}

Previsão de entrega: {{estimated_delivery}}

Equipe Hayah 💗`,

  MSG_ENTREGUE: `Olá, {{nome}}! 🎊

Seu pedido #{{order_number}} foi ENTREGUE!

Esperamos que o livro "Mulher Sábia, Vida Próspera" abençoe sua vida.

📚 Aproveite cada reflexão diária!

Se puder, nos conte o que está achando. Seu feedback é muito importante!

Com carinho,
Equipe Hayah 💗`,
};

export async function sendWhatsApp(
  params: SendWhatsAppParams
): Promise<SendWhatsAppResult> {
  const { phone, template, variables, message } = params;

  // Format phone number
  const formattedPhone = phone.replace(/\D/g, '');
  const fullPhone = formattedPhone.startsWith('55')
    ? formattedPhone
    : `55${formattedPhone}`;

  // Get message content
  let content = message;

  if (template && TEMPLATES[template]) {
    content = TEMPLATES[template];

    // Replace variables
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        content = content!.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
    }
  }

  if (!content) {
    throw new Error('Message content is required');
  }

  // Send via 2chat API
  const response = await fetch(`${TWOCHAT_API_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWOCHAT_API_KEY}`,
    },
    body: JSON.stringify({
      to: fullPhone,
      body: content,
      from_phone_id: process.env.TWOCHAT_PHONE_ID,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('2chat error:', error);
    throw new Error(error.message || 'Erro ao enviar WhatsApp');
  }

  return response.json();
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<SendWhatsAppResult> {
  return sendWhatsApp({ phone, message });
}

export function validateTwoChatSignature(
  payload: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.TWOCHAT_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex');

  return expectedSignature === signature;
}


// ============================================================================
// 6. LIB EMAIL (RESEND)
// ============================================================================
// Arquivo: lib/email.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  template: string;
  variables: Record<string, string>;
}

// Email templates
const EMAIL_TEMPLATES: Record<string, { subject: string; html: string }> = {
  'order-confirmed': {
    subject: 'Sua compra foi aprovada! Pedido #{{order_number}}',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #E91E63; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; background: #E91E63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Pagamento Aprovado!</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>{{customer_name}}</strong>!</p>
      <p>Sua compra do livro <strong>Mulher Sábia, Vida Próspera</strong> foi aprovada com sucesso!</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background: #f9f9f9;">
          <td style="padding: 10px; border: 1px solid #eee;"><strong>Pedido</strong></td>
          <td style="padding: 10px; border: 1px solid #eee;">#{{order_number}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee;"><strong>Valor</strong></td>
          <td style="padding: 10px; border: 1px solid #eee;">R$ {{total_amount}}</td>
        </tr>
      </table>
      
      <p>Seu pedido será preparado e enviado em até 2 dias úteis.</p>
      <p>Assim que for postado, você receberá um e-mail com o código de rastreio.</p>
      
      <p style="margin-top: 30px;">Com carinho,<br><strong>Equipe Hayah</strong></p>
    </div>
    <div class="footer">
      <p>Hayah Editora | contato@hayah.com.br</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'order-shipped': {
    subject: 'Seu pedido foi enviado! Rastreie aqui 📦',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #E91E63; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; background: #E91E63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .tracking-box { background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Pedido Enviado!</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>{{customer_name}}</strong>!</p>
      <p>Seu pedido <strong>#{{order_number}}</strong> foi enviado e está a caminho!</p>
      
      <div class="tracking-box">
        <p style="margin: 0; font-size: 14px; color: #666;">Código de Rastreio</p>
        <p style="margin: 10px 0; font-size: 24px; font-weight: bold;">{{tracking_code}}</p>
        <a href="{{tracking_url}}" class="button">Rastrear Pedido</a>
      </div>
      
      <p style="margin-top: 30px;">Com carinho,<br><strong>Equipe Hayah</strong></p>
    </div>
    <div class="footer">
      <p>Hayah Editora | contato@hayah.com.br</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'order-delivered': {
    subject: 'Seu pedido foi entregue! Aproveite a leitura 📚',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #E91E63; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 Pedido Entregue!</h1>
    </div>
    <div class="content">
      <p>Olá, <strong>{{customer_name}}</strong>!</p>
      <p>Seu pedido <strong>#{{order_number}}</strong> foi entregue!</p>
      
      <p>Esperamos que o livro <strong>Mulher Sábia, Vida Próspera</strong> abençoe sua vida com sabedoria e inspiração diária.</p>
      
      <p>📚 Aproveite cada reflexão!</p>
      
      <p style="margin-top: 30px;">Com carinho,<br><strong>Equipe Hayah</strong></p>
    </div>
    <div class="footer">
      <p>Hayah Editora | contato@hayah.com.br</p>
    </div>
  </div>
</body>
</html>
    `,
  },

  'password-reset': {
    subject: 'Recuperação de senha',
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: #E91E63; color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; background: #E91E63; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Recuperar Senha</h1>
    </div>
    <div class="content">
      <p>Olá!</p>
      <p>Você solicitou a recuperação de senha da sua conta.</p>
      
      <p style="text-align: center;">
        <a href="{{reset_url}}" class="button">Redefinir Minha Senha</a>
      </p>
      
      <p style="font-size: 12px; color: #666;">Este link expira em {{expiration}}.</p>
      <p style="font-size: 12px; color: #666;">Se você não solicitou esta recuperação, ignore este e-mail.</p>
      
      <p style="margin-top: 30px;">Equipe Hayah</p>
    </div>
    <div class="footer">
      <p>Hayah Editora | contato@hayah.com.br</p>
    </div>
  </div>
</body>
</html>
    `,
  },
};

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, template, variables } = params;

  const emailTemplate = EMAIL_TEMPLATES[template];
  if (!emailTemplate) {
    throw new Error(`Template "${template}" not found`);
  }

  // Replace variables
  let subject = emailTemplate.subject;
  let html = emailTemplate.html;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
  });

  // Send email
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Email error:', error);
    throw new Error('Erro ao enviar e-mail');
  }
}


// ============================================================================
// 7. LIB FORMATTERS
// ============================================================================
// Arquivo: lib/formatters.ts

export function formatCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

export function formatPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
}

export function formatCEP(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
}

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})\d+?$/, '$1');
}

export function formatExpiry(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\/\d{2})\d+?$/, '$1');
}

export function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('pt-BR');
}


// ============================================================================
// 8. LIB UTILS
// ============================================================================
// Arquivo: lib/utils.ts

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${timestamp}${random}`;
}

export function isValidCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');

  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 11;
}

export function isValidCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

export async function fetchViaCEP(cep: string) {
  const cleaned = cep.replace(/\D/g, '');
  const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
  const data = await response.json();

  if (data.erro) {
    throw new Error('CEP não encontrado');
  }

  return {
    street: data.logradouro,
    district: data.bairro,
    city: data.localidade,
    state: data.uf,
  };
}
