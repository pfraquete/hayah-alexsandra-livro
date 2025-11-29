/**
 * Email Service
 * Supports multiple providers: Resend, SendGrid, or SMTP
 */

// Environment variables
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@hayahlivros.com.br";
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Hayah Livros";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!(RESEND_API_KEY || SENDGRID_API_KEY);
}

/**
 * Send email using configured provider
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (RESEND_API_KEY) {
    return sendWithResend(options);
  }

  if (SENDGRID_API_KEY) {
    return sendWithSendGrid(options);
  }

  // Development mode - log email instead of sending
  console.log("[Email] No provider configured. Email would be sent:");
  console.log(`  To: ${options.to}`);
  console.log(`  Subject: ${options.subject}`);
  console.log(`  Content: ${options.text || options.html.substring(0, 100)}...`);

  return {
    success: true,
    messageId: `dev_${Date.now()}`,
  };
}

/**
 * Send email using Resend
 */
async function sendWithResend(options: EmailOptions): Promise<EmailResult> {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error("[Email] Resend error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        subject: options.subject,
        content: [
          { type: "text/plain", value: options.text || options.html.replace(/<[^>]*>/g, "") },
          { type: "text/html", value: options.html },
        ],
        reply_to: options.replyTo ? { email: options.replyTo } : undefined,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.errors?.[0]?.message || "Failed to send email");
    }

    return {
      success: true,
      messageId: response.headers.get("x-message-id") || `sg_${Date.now()}`,
    };
  } catch (error) {
    console.error("[Email] SendGrid error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// ============================================================
// Email Templates
// ============================================================

/**
 * Order confirmation email
 */
export function orderConfirmationEmail(data: {
  customerName: string;
  orderId: number;
  items: Array<{ name: string; quantity: number; priceCents: number }>;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    cep: string;
  };
  paymentMethod: string;
}): { subject: string; html: string; text: string } {
  const formatPrice = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.priceCents)}</td>
      </tr>
    `
    )
    .join("");

  const itemsText = data.items.map((item) => `  - ${item.name} x${item.quantity}: ${formatPrice(item.priceCents)}`).join("\n");

  const paymentMethodLabel: Record<string, string> = {
    credit_card: "Cartão de Crédito",
    pix: "PIX",
    boleto: "Boleto Bancário",
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hayah Livros</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #333; margin-top: 0;">Pedido Confirmado!</h2>

      <p style="color: #666; line-height: 1.6;">
        Olá <strong>${data.customerName}</strong>,
      </p>

      <p style="color: #666; line-height: 1.6;">
        Recebemos seu pedido <strong>#${data.orderId}</strong> e ele está sendo processado.
      </p>

      <!-- Order Items -->
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ec4899;">Produto</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ec4899;">Qtd</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ec4899;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right;">Subtotal:</td>
            <td style="padding: 12px; text-align: right;">${formatPrice(data.subtotalCents)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right;">Frete:</td>
            <td style="padding: 12px; text-align: right;">${formatPrice(data.shippingCents)}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 18px;">
            <td colspan="2" style="padding: 12px; text-align: right; color: #ec4899;">Total:</td>
            <td style="padding: 12px; text-align: right; color: #ec4899;">${formatPrice(data.totalCents)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Shipping Address -->
      <div style="background-color: #f8f8f8; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #333;">Endereço de Entrega</h3>
        <p style="color: #666; margin: 0; line-height: 1.6;">
          ${data.shippingAddress.street}, ${data.shippingAddress.number}
          ${data.shippingAddress.complement ? ` - ${data.shippingAddress.complement}` : ""}<br>
          ${data.shippingAddress.district}<br>
          ${data.shippingAddress.city} - ${data.shippingAddress.state}<br>
          CEP: ${data.shippingAddress.cep}
        </p>
      </div>

      <!-- Payment Method -->
      <p style="color: #666; line-height: 1.6;">
        <strong>Forma de Pagamento:</strong> ${paymentMethodLabel[data.paymentMethod] || data.paymentMethod}
      </p>

      <p style="color: #666; line-height: 1.6;">
        Você receberá atualizações sobre o status do seu pedido por e-mail.
      </p>

      <p style="color: #666; line-height: 1.6;">
        Obrigado por comprar com a gente!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #333; padding: 24px; text-align: center;">
      <p style="color: #999; margin: 0; font-size: 14px;">
        © ${new Date().getFullYear()} Hayah Livros. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
HAYAH LIVROS - Pedido Confirmado!

Olá ${data.customerName},

Recebemos seu pedido #${data.orderId} e ele está sendo processado.

ITENS DO PEDIDO:
${itemsText}

Subtotal: ${formatPrice(data.subtotalCents)}
Frete: ${formatPrice(data.shippingCents)}
Total: ${formatPrice(data.totalCents)}

ENDEREÇO DE ENTREGA:
${data.shippingAddress.street}, ${data.shippingAddress.number}${data.shippingAddress.complement ? ` - ${data.shippingAddress.complement}` : ""}
${data.shippingAddress.district}
${data.shippingAddress.city} - ${data.shippingAddress.state}
CEP: ${data.shippingAddress.cep}

Forma de Pagamento: ${paymentMethodLabel[data.paymentMethod] || data.paymentMethod}

Você receberá atualizações sobre o status do seu pedido por e-mail.

Obrigado por comprar com a gente!

---
Hayah Livros
  `;

  return {
    subject: `Pedido #${data.orderId} confirmado - Hayah Livros`,
    html,
    text,
  };
}

/**
 * Order status update email
 */
export function orderStatusUpdateEmail(data: {
  customerName: string;
  orderId: number;
  status: string;
  trackingCode?: string;
  trackingUrl?: string;
}): { subject: string; html: string; text: string } {
  const statusLabels: Record<string, { label: string; description: string; color: string }> = {
    PAGO: {
      label: "Pagamento Confirmado",
      description: "Seu pagamento foi confirmado e seu pedido está sendo preparado.",
      color: "#22c55e",
    },
    EM_SEPARACAO: {
      label: "Em Separação",
      description: "Seu pedido está sendo preparado para envio.",
      color: "#3b82f6",
    },
    POSTADO: {
      label: "Enviado",
      description: "Seu pedido foi enviado e está a caminho!",
      color: "#8b5cf6",
    },
    EM_TRANSITO: {
      label: "Em Trânsito",
      description: "Seu pedido está a caminho do destino.",
      color: "#f59e0b",
    },
    ENTREGUE: {
      label: "Entregue",
      description: "Seu pedido foi entregue. Esperamos que você aproveite!",
      color: "#22c55e",
    },
    CANCELADO: {
      label: "Cancelado",
      description: "Seu pedido foi cancelado.",
      color: "#ef4444",
    },
  };

  const statusInfo = statusLabels[data.status] || {
    label: data.status,
    description: "O status do seu pedido foi atualizado.",
    color: "#666",
  };

  const trackingSection =
    data.trackingCode && data.trackingUrl
      ? `
      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">Rastreamento</h3>
        <p style="color: #666; margin: 0;">
          Código: <strong>${data.trackingCode}</strong><br>
          <a href="${data.trackingUrl}" style="color: #3b82f6;">Clique aqui para rastrear seu pedido</a>
        </p>
      </div>
    `
      : "";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hayah Livros</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #333; margin-top: 0;">Atualização do Pedido #${data.orderId}</h2>

      <p style="color: #666; line-height: 1.6;">
        Olá <strong>${data.customerName}</strong>,
      </p>

      <div style="background-color: ${statusInfo.color}15; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid ${statusInfo.color};">
        <h3 style="margin-top: 0; color: ${statusInfo.color};">${statusInfo.label}</h3>
        <p style="color: #666; margin: 0;">${statusInfo.description}</p>
      </div>

      ${trackingSection}

      <p style="color: #666; line-height: 1.6;">
        Se tiver alguma dúvida, entre em contato conosco.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #333; padding: 24px; text-align: center;">
      <p style="color: #999; margin: 0; font-size: 14px;">
        © ${new Date().getFullYear()} Hayah Livros. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
HAYAH LIVROS - Atualização do Pedido #${data.orderId}

Olá ${data.customerName},

${statusInfo.label}
${statusInfo.description}

${data.trackingCode ? `Código de rastreamento: ${data.trackingCode}` : ""}
${data.trackingUrl ? `Link de rastreamento: ${data.trackingUrl}` : ""}

Se tiver alguma dúvida, entre em contato conosco.

---
Hayah Livros
  `;

  return {
    subject: `Pedido #${data.orderId} - ${statusInfo.label}`,
    html,
    text,
  };
}

/**
 * Password reset email
 */
export function passwordResetEmail(data: {
  customerName: string;
  resetLink: string;
}): { subject: string; html: string; text: string } {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hayah Livros</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #333; margin-top: 0;">Recuperação de Senha</h2>

      <p style="color: #666; line-height: 1.6;">
        Olá <strong>${data.customerName}</strong>,
      </p>

      <p style="color: #666; line-height: 1.6;">
        Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.resetLink}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold;">
          Redefinir Senha
        </a>
      </div>

      <p style="color: #666; line-height: 1.6;">
        Se você não solicitou esta alteração, ignore este e-mail.
      </p>

      <p style="color: #999; font-size: 14px; line-height: 1.6;">
        Este link expira em 1 hora.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #333; padding: 24px; text-align: center;">
      <p style="color: #999; margin: 0; font-size: 14px;">
        © ${new Date().getFullYear()} Hayah Livros. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
HAYAH LIVROS - Recuperação de Senha

Olá ${data.customerName},

Recebemos uma solicitação para redefinir sua senha.

Clique no link abaixo para criar uma nova senha:
${data.resetLink}

Se você não solicitou esta alteração, ignore este e-mail.

Este link expira em 1 hora.

---
Hayah Livros
  `;

  return {
    subject: "Recuperação de Senha - Hayah Livros",
    html,
    text,
  };
}
