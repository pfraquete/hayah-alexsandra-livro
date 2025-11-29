// ============================================================================
// HAYAH ALEXSANDRA LIVRO - API HANDLERS (CONTINUAÇÃO)
// ============================================================================

// ============================================================================
// 7. API ADMIN - GENERATE LABELS (COMPLETO)
// ============================================================================
// Arquivo: app/api/admin/labels/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const generateLabelsSchema = z.object({
  order_ids: z.array(z.string().uuid()).min(1),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { order_ids } = generateLabelsSchema.parse(body);

    const supabase = createClient();

    // Get orders with shipment data
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        shipment:shipments(*),
        items:order_items(*)
      `)
      .in('id', order_ids)
      .eq('status', 'PAGO');

    if (ordersError) throw ordersError;

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum pedido elegível encontrado' },
        { status: 400 }
      );
    }

    const results: {
      order_id: string;
      order_number: number;
      success: boolean;
      tracking_code?: string;
      label_url?: string;
      error?: string;
    }[] = [];

    // Process each order
    for (const order of orders) {
      try {
        // Skip if already has label
        if (order.shipment?.tracking_code) {
          results.push({
            order_id: order.id,
            order_number: order.order_number,
            success: true,
            tracking_code: order.shipment.tracking_code,
            label_url: order.shipment.label_url,
          });
          continue;
        }

        // Calculate total weight
        const totalWeight = order.items.reduce(
          (sum: number, item: any) => sum + (item.quantity * 350), // 350g per book
          0
        );

        // Create shipment in Melhor Envio
        const cartResponse = await fetch(
          `${process.env.MELHOR_ENVIO_API_URL}/me/cart`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              service: order.shipment?.shipping_method === 'SEDEX' ? 2 : 1,
              from: {
                name: 'Hayah Editora',
                phone: process.env.COMPANY_PHONE,
                email: process.env.COMPANY_EMAIL,
                document: process.env.COMPANY_CNPJ,
                company_document: process.env.COMPANY_CNPJ,
                address: process.env.COMPANY_STREET,
                number: process.env.COMPANY_NUMBER,
                complement: process.env.COMPANY_COMPLEMENT,
                district: process.env.COMPANY_DISTRICT,
                city: process.env.COMPANY_CITY,
                state_abbr: process.env.COMPANY_STATE,
                postal_code: process.env.SHIPPING_ORIGIN_CEP,
                country_id: 'BR',
              },
              to: {
                name: order.shipping_address.recipient_name,
                phone: order.user.phone,
                email: order.user.email,
                document: order.user.cpf.replace(/\D/g, ''),
                address: order.shipping_address.street,
                number: order.shipping_address.number,
                complement: order.shipping_address.complement || '',
                district: order.shipping_address.district,
                city: order.shipping_address.city,
                state_abbr: order.shipping_address.state,
                postal_code: order.shipping_address.cep.replace(/\D/g, ''),
                country_id: 'BR',
              },
              products: order.items.map((item: any) => ({
                name: item.product_name,
                quantity: item.quantity,
                unitary_value: item.unit_price_cents / 100,
              })),
              volumes: [
                {
                  weight: totalWeight / 1000,
                  width: 16,
                  height: 23,
                  length: 3 * order.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
                },
              ],
              options: {
                insurance_value: order.total_cents / 100,
                receipt: false,
                own_hand: false,
                reverse: false,
                non_commercial: false,
                invoice: {
                  key: order.order_number.toString(),
                },
              },
            }),
          }
        );

        if (!cartResponse.ok) {
          const errorData = await cartResponse.json();
          throw new Error(errorData.message || 'Erro ao criar envio');
        }

        const cartData = await cartResponse.json();

        // Checkout (pay for label)
        const checkoutResponse = await fetch(
          `${process.env.MELHOR_ENVIO_API_URL}/me/shipment/checkout`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              orders: [cartData.id],
            }),
          }
        );

        if (!checkoutResponse.ok) {
          throw new Error('Erro ao pagar etiqueta');
        }

        // Generate label
        const generateResponse = await fetch(
          `${process.env.MELHOR_ENVIO_API_URL}/me/shipment/generate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              orders: [cartData.id],
            }),
          }
        );

        if (!generateResponse.ok) {
          throw new Error('Erro ao gerar etiqueta');
        }

        // Get tracking info
        const trackingResponse = await fetch(
          `${process.env.MELHOR_ENVIO_API_URL}/me/shipment/tracking`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              orders: [cartData.id],
            }),
          }
        );

        const trackingData = await trackingResponse.json();
        const tracking = trackingData[cartData.id];

        // Print label URL
        const printResponse = await fetch(
          `${process.env.MELHOR_ENVIO_API_URL}/me/shipment/print`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              mode: 'private',
              orders: [cartData.id],
            }),
          }
        );

        const printData = await printResponse.json();

        // Update shipment in database
        await supabase
          .from('shipments')
          .update({
            tracking_code: tracking?.tracking,
            tracking_url: `https://www.linkcorreios.com.br/?id=${tracking?.tracking}`,
            label_url: printData.url,
            label_generated_at: new Date().toISOString(),
            status: 'ETIQUETA_GERADA',
            carrier_response: { cart: cartData, tracking, print: printData },
          })
          .eq('order_id', order.id);

        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'EM_SEPARACAO' })
          .eq('id', order.id);

        results.push({
          order_id: order.id,
          order_number: order.order_number,
          success: true,
          tracking_code: tracking?.tracking,
          label_url: printData.url,
        });
      } catch (error: any) {
        console.error(`Error generating label for order ${order.id}:`, error);
        results.push({
          order_id: order.id,
          order_number: order.order_number,
          success: false,
          error: error.message,
        });
      }
    }

    // Generate combined PDF URL if multiple labels
    let combinedLabelUrl = null;
    const successfulLabels = results.filter((r) => r.success && r.label_url);

    if (successfulLabels.length > 1) {
      // In production, you would combine PDFs here
      // For now, just return the list
      combinedLabelUrl = successfulLabels[0].label_url;
    }

    return NextResponse.json({
      success: true,
      results,
      combined_label_url: combinedLabelUrl,
      summary: {
        total: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    console.error('Generate labels error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao gerar etiquetas' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 8. API ADMIN - UPDATE ORDER STATUS
// ============================================================================
// Arquivo: app/api/admin/orders/[id]/status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { sendWhatsApp } from '@/lib/2chat';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum([
    'AGUARDANDO_PAGAMENTO',
    'PAGO',
    'EM_SEPARACAO',
    'POSTADO',
    'EM_TRANSITO',
    'ENTREGUE',
    'CANCELADO',
    'REEMBOLSADO',
    'PROBLEMA',
  ]),
  tracking_code: z.string().optional(),
  notes: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const data = updateStatusSchema.parse(body);

    const supabase = createClient();

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        shipment:shipments(*)
      `)
      .eq('id', params.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    const previousStatus = order.status;

    // Update order
    const updateData: any = {
      status: data.status,
    };

    if (data.status === 'POSTADO') {
      updateData.shipped_at = new Date().toISOString();
    } else if (data.status === 'ENTREGUE') {
      updateData.delivered_at = new Date().toISOString();
    } else if (data.status === 'CANCELADO') {
      updateData.cancelled_at = new Date().toISOString();
    }

    await supabase.from('orders').update(updateData).eq('id', params.id);

    // Update tracking code if provided
    if (data.tracking_code && order.shipment) {
      await supabase
        .from('shipments')
        .update({
          tracking_code: data.tracking_code,
          tracking_url: `https://www.linkcorreios.com.br/?id=${data.tracking_code}`,
          status: data.status === 'POSTADO' ? 'POSTADO' : order.shipment.status,
          posted_at: data.status === 'POSTADO' ? new Date().toISOString() : null,
        })
        .eq('order_id', params.id);
    }

    // Log status change
    await supabase.from('order_status_history').insert({
      order_id: params.id,
      from_status: previousStatus,
      to_status: data.status,
      notes: data.notes,
      created_by: admin.id,
      created_by_system: false,
    });

    // Send notifications based on status change
    if (data.status === 'POSTADO' && data.tracking_code) {
      // Send shipping notification
      await sendEmail({
        to: order.user.email,
        template: 'order-shipped',
        variables: {
          customer_name: order.user.name,
          order_number: order.order_number,
          tracking_code: data.tracking_code,
          tracking_url: `https://www.linkcorreios.com.br/?id=${data.tracking_code}`,
        },
      });

      await sendWhatsApp({
        phone: order.user.phone,
        template: 'MSG_PEDIDO_POSTADO',
        variables: {
          nome: order.user.name.split(' ')[0],
          order_number: order.order_number,
          tracking_code: data.tracking_code,
        },
      });
    } else if (data.status === 'ENTREGUE') {
      // Send delivery notification
      await sendEmail({
        to: order.user.email,
        template: 'order-delivered',
        variables: {
          customer_name: order.user.name,
          order_number: order.order_number,
        },
      });

      await sendWhatsApp({
        phone: order.user.phone,
        template: 'MSG_ENTREGUE',
        variables: {
          nome: order.user.name.split(' ')[0],
          order_number: order.order_number,
        },
      });
    }

    return NextResponse.json({
      success: true,
      order_id: params.id,
      previous_status: previousStatus,
      new_status: data.status,
    });
  } catch (error) {
    console.error('Update order status error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar status' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 9. API CLIENT - LIST ORDERS
// ============================================================================
// Arquivo: app/api/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '10');

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Get orders
    const { data: orders, error, count } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        total_cents,
        status,
        payment_method,
        created_at,
        paid_at,
        shipped_at,
        delivered_at,
        shipment:shipments(
          tracking_code,
          tracking_url,
          status,
          estimated_delivery
        ),
        items:order_items(
          quantity,
          product_name,
          unit_price_cents
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / perPage),
      },
    });
  } catch (error) {
    console.error('List orders error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar pedidos' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 10. API CLIENT - ORDER DETAILS
// ============================================================================
// Arquivo: app/api/orders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const supabase = createClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        items:order_items(
          id,
          quantity,
          product_name,
          product_sku,
          unit_price_cents,
          total_price_cents
        ),
        shipment:shipments(
          id,
          shipping_method,
          shipping_price_cents,
          tracking_code,
          tracking_url,
          status,
          estimated_delivery,
          posted_at,
          delivered_at
        ),
        payment:payment_transactions(
          id,
          method,
          status,
          amount_cents,
          installments,
          card_brand,
          card_last_digits,
          created_at,
          paid_at
        ),
        status_history:order_status_history(
          id,
          from_status,
          to_status,
          notes,
          created_at
        )
      `
      )
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 11. API ADMIN - WHATSAPP CONVERSATIONS
// ============================================================================
// Arquivo: app/api/admin/whatsapp/conversations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const archived = searchParams.get('archived') === 'true';

    const { data: conversations, error } = await supabase
      .from('whatsapp_conversations')
      .select(
        `
        id,
        phone,
        unread_count,
        last_message_at,
        last_message_preview,
        is_archived,
        user:users(
          id,
          name,
          email
        )
      `
      )
      .eq('is_archived', archived)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error('List conversations error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar conversas' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 12. API ADMIN - WHATSAPP MESSAGES
// ============================================================================
// Arquivo: app/api/admin/whatsapp/conversations/[id]/messages/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/2chat';
import { z } from 'zod';

// GET - List messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createClient();

    // Get conversation
    const { data: conversation } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select(
        `
        id,
        direction,
        content,
        template_name,
        status,
        sent_at,
        delivered_at,
        read_at,
        order:orders(
          id,
          order_number
        )
      `
      )
      .eq('conversation_id', params.id)
      .order('sent_at', { ascending: true });

    if (error) throw error;

    // Mark as read
    await supabase
      .from('whatsapp_conversations')
      .update({ unread_count: 0 })
      .eq('id', params.id);

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error('List messages error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar mensagens' },
      { status: 500 }
    );
  }
}

// POST - Send message
const sendMessageSchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { content } = sendMessageSchema.parse(body);

    const supabase = createClient();

    // Get conversation
    const { data: conversation } = await supabase
      .from('whatsapp_conversations')
      .select('phone')
      .eq('id', params.id)
      .single();

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Send via 2chat
    const result = await sendWhatsAppMessage(conversation.phone, content);

    // Save message
    const { data: message, error } = await supabase
      .from('whatsapp_messages')
      .insert({
        conversation_id: params.id,
        direction: 'out',
        content,
        external_id: result.id,
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation
    await supabase
      .from('whatsapp_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: content.substring(0, 100),
      })
      .eq('id', params.id);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 13. API ADMIN - STOCK MOVEMENT
// ============================================================================
// Arquivo: app/api/admin/stock/movement/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

const stockMovementSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
  quantity: z.number().int(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    const body = await request.json();
    const data = stockMovementSchema.parse(body);

    const supabase = createClient();

    // Get current product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', data.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Calculate new stock
    let quantityChange: number;
    switch (data.type) {
      case 'IN':
        quantityChange = Math.abs(data.quantity);
        break;
      case 'OUT':
        quantityChange = -Math.abs(data.quantity);
        break;
      case 'ADJUSTMENT':
        quantityChange = data.quantity - product.stock_quantity;
        break;
    }

    const newStock = product.stock_quantity + quantityChange;

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Estoque não pode ficar negativo' },
        { status: 400 }
      );
    }

    // Create movement record
    await supabase.from('stock_movements').insert({
      product_id: data.product_id,
      type: data.type,
      quantity: quantityChange,
      stock_before: product.stock_quantity,
      stock_after: newStock,
      reason: data.reason,
      created_by: admin.id,
    });

    // Update product stock
    await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', data.product_id);

    return NextResponse.json({
      success: true,
      previous_stock: product.stock_quantity,
      new_stock: newStock,
      change: quantityChange,
    });
  } catch (error) {
    console.error('Stock movement error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao registrar movimentação' },
      { status: 500 }
    );
  }
}

// GET - Stock movement history
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('product_id');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');

    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = supabase
      .from('stock_movements')
      .select(
        `
        *,
        product:products(name, sku),
        created_by_user:users(name)
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data: movements, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: movements,
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / perPage),
      },
    });
  } catch (error) {
    console.error('List stock movements error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar movimentações' },
      { status: 500 }
    );
  }
}
