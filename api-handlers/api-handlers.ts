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
import { generateShippingLabel } from '@/lib/shipping';
import { sendEmail } from '@/lib/email';
import { sendWhatsApp } from '@/lib/2chat';
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
    const results: { order_id: string; success: boolean; error?: string; tracking_code?: string }[] = [];

    // Process each order
    for (const orderId of order_ids) {
      try {
        // Get order with details
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            user:users(*),
            shipment:shipments(*),
            items:order_items(
              *,
              product:products(*)
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderError || !order) {
          results.push({ order_id: orderId, success: false, error: 'Pedido não encontrado' });
          continue;
        }

        if (order.status !== 'PAGO') {
          results.push({ order_id: orderId, success: false, error: 'Pedido não está pago' });
          continue;
        }

        if (order.shipment?.tracking_code) {
          results.push({ order_id: orderId, success: false, error: 'Etiqueta já gerada' });
          continue;
        }

        // Calculate total weight and dimensions
        let totalWeight = 0;
        let maxWidth = 0;
        let maxHeight = 0;
        let totalDepth = 0;

        for (const item of order.items) {
          totalWeight += (item.product.weight_grams || 300) * item.quantity;
          maxWidth = Math.max(maxWidth, item.product.width_cm || 16);
          maxHeight = Math.max(maxHeight, item.product.height_cm || 23);
          totalDepth += (item.product.depth_cm || 3) * item.quantity;
        }

        // Generate label via Melhor Envio
        const labelResult = await generateShippingLabel({
          service_id: parseInt(order.shipment.shipping_service_code || '1'),
          from: {
            name: process.env.COMPANY_NAME || 'Hayah Editora',
            phone: process.env.COMPANY_PHONE || '',
            email: process.env.COMPANY_EMAIL || '',
            document: process.env.COMPANY_CNPJ || '',
            address: process.env.SHIPPING_ORIGIN_ADDRESS || '',
            number: process.env.SHIPPING_ORIGIN_NUMBER || '',
            district: process.env.SHIPPING_ORIGIN_DISTRICT || '',
            city: process.env.SHIPPING_ORIGIN_CITY || '',
            state_abbr: process.env.SHIPPING_ORIGIN_STATE || '',
            postal_code: process.env.SHIPPING_ORIGIN_CEP || '',
          },
          to: {
            name: order.shipping_address.recipient_name,
            phone: order.user.phone,
            email: order.user.email,
            document: order.user.cpf,
            address: order.shipping_address.street,
            number: order.shipping_address.number,
            complement: order.shipping_address.complement,
            district: order.shipping_address.district,
            city: order.shipping_address.city,
            state_abbr: order.shipping_address.state,
            postal_code: order.shipping_address.cep,
          },
          package: {
            weight: totalWeight / 1000,
            width: Math.max(maxWidth, 11),
            height: Math.max(maxHeight, 2),
            length: Math.max(totalDepth, 16),
          },
          options: {
            insurance_value: order.total_cents / 100,
            receipt: false,
            own_hand: false,
          },
          volumes: 1,
        });

        // Update shipment with tracking info
        await supabase
          .from('shipments')
          .update({
            tracking_code: labelResult.tracking_code,
            tracking_url: labelResult.tracking_url,
            label_url: labelResult.label_url,
            label_generated_at: new Date().toISOString(),
            status: 'ETIQUETA_GERADA',
            estimated_delivery: labelResult.estimated_delivery,
          })
          .eq('order_id', orderId);

        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'EM_SEPARACAO' })
          .eq('id', orderId);

        // Send notifications
        await sendEmail({
          to: order.user.email,
          template: 'order-preparing',
          variables: {
            customer_name: order.user.name,
            order_number: order.order_number,
          },
        });

        await sendWhatsApp({
          phone: order.user.phone,
          template: 'MSG_PEDIDO_SEPARADO',
          variables: {
            nome: order.user.name.split(' ')[0],
            order_number: order.order_number,
          },
        });

        results.push({
          order_id: orderId,
          success: true,
          tracking_code: labelResult.tracking_code,
        });
      } catch (error) {
        console.error(`Error generating label for order ${orderId}:`, error);
        results.push({
          order_id: orderId,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    }

    // Generate combined PDF URL if multiple labels
    const successfulLabels = results.filter((r) => r.success);
    let combinedPdfUrl: string | undefined;

    if (successfulLabels.length > 1) {
      // Get all label URLs
      const { data: shipments } = await supabase
        .from('shipments')
        .select('label_url')
        .in(
          'order_id',
          successfulLabels.map((r) => r.order_id)
        );

      const labelUrls = shipments?.map((s) => s.label_url).filter(Boolean) || [];

      if (labelUrls.length > 0) {
        // Combine PDFs (would use a PDF library in production)
        // For now, return first label URL as placeholder
        combinedPdfUrl = labelUrls[0];
      }
    }

    return NextResponse.json({
      success: true,
      results,
      combined_pdf_url: combinedPdfUrl,
      summary: {
        total: order_ids.length,
        successful: successfulLabels.length,
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
  notes: z.string().optional(),
  tracking_code: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const { status, notes, tracking_code } = updateStatusSchema.parse(body);

    const supabase = createClient();
    const orderId = params.id;

    // Get current order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        shipment:shipments(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    const previousStatus = order.status;

    // Update order status
    const updateData: any = { status };

    if (status === 'POSTADO') {
      updateData.shipped_at = new Date().toISOString();
    } else if (status === 'ENTREGUE') {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === 'CANCELADO') {
      updateData.cancelled_at = new Date().toISOString();
    }

    await supabase.from('orders').update(updateData).eq('id', orderId);

    // Update shipment if tracking code provided
    if (tracking_code) {
      await supabase
        .from('shipments')
        .update({
          tracking_code,
          tracking_url: `https://rastreamento.correios.com.br/app/index.php?objetos=${tracking_code}`,
          status: status === 'POSTADO' ? 'POSTADO' : order.shipment?.status,
          posted_at: status === 'POSTADO' ? new Date().toISOString() : null,
        })
        .eq('order_id', orderId);
    }

    // Update shipment status
    if (status === 'ENTREGUE') {
      await supabase
        .from('shipments')
        .update({
          status: 'ENTREGUE',
          delivered_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);
    }

    // Log status change
    await supabase.from('order_status_history').insert({
      order_id: orderId,
      from_status: previousStatus,
      to_status: status,
      notes,
      created_by: user.id,
      created_by_system: false,
    });

    // Send notifications based on status
    if (status === 'POSTADO' && tracking_code) {
      await sendEmail({
        to: order.user.email,
        template: 'order-shipped',
        variables: {
          customer_name: order.user.name,
          order_number: order.order_number,
          tracking_code,
          tracking_url: `https://rastreamento.correios.com.br/app/index.php?objetos=${tracking_code}`,
        },
      });

      await sendWhatsApp({
        phone: order.user.phone,
        template: 'MSG_PEDIDO_POSTADO',
        variables: {
          nome: order.user.name.split(' ')[0],
          order_number: order.order_number,
          tracking_code,
        },
      });
    } else if (status === 'ENTREGUE') {
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
      previous_status: previousStatus,
      new_status: status,
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
// 9. API ADMIN - ORDERS LIST
// ============================================================================
// Arquivo: app/api/admin/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;

    // Parse filters
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Build query
    let query = supabase
      .from('orders')
      .select(
        `
        *,
        user:users(id, name, email, phone),
        shipment:shipments(tracking_code, status, shipping_method),
        payment:payment_transactions(method, status, card_brand, card_last_digits)
      `,
        { count: 'exact' }
      );

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `order_number.eq.${search},user.name.ilike.%${search}%,user.email.ilike.%${search}%`
      );
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data: orders, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: orders || [],
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
// 10. API ADMIN - STOCK MOVEMENT
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
  reason: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();

    const body = await request.json();
    const { product_id, type, quantity, reason } = stockMovementSchema.parse(body);

    const supabase = createClient();

    // Get current stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Calculate new stock
    let quantityDelta: number;
    switch (type) {
      case 'IN':
        quantityDelta = Math.abs(quantity);
        break;
      case 'OUT':
        quantityDelta = -Math.abs(quantity);
        break;
      case 'ADJUSTMENT':
        quantityDelta = quantity - product.stock_quantity;
        break;
    }

    const newStock = product.stock_quantity + quantityDelta;

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Estoque não pode ficar negativo' },
        { status: 400 }
      );
    }

    // Create movement record
    await supabase.from('stock_movements').insert({
      product_id,
      type,
      quantity: quantityDelta,
      stock_before: product.stock_quantity,
      stock_after: newStock,
      reason,
      created_by: user.id,
    });

    // Update product stock
    await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', product_id);

    return NextResponse.json({
      success: true,
      product_name: product.name,
      previous_stock: product.stock_quantity,
      new_stock: newStock,
      movement: {
        type,
        quantity: quantityDelta,
        reason,
      },
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
      { error: 'Erro ao movimentar estoque' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 11. API ADMIN - SEND WHATSAPP MESSAGE
// ============================================================================
// Arquivo: app/api/admin/whatsapp/send/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/2chat';
import { z } from 'zod';

const sendMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  message: z.string().min(1),
  order_id: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { conversation_id, message, order_id } = sendMessageSchema.parse(body);

    const supabase = createClient();

    // Get conversation
    const { data: conversation, error: convError } = await supabase
      .from('whatsapp_conversations')
      .select('phone')
      .eq('id', conversation_id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Send message via 2chat
    const result = await sendWhatsAppMessage({
      phone: conversation.phone,
      message,
    });

    // Save message to database
    await supabase.from('whatsapp_messages').insert({
      conversation_id,
      order_id,
      direction: 'out',
      content: message,
      external_id: result.id,
      status: 'sent',
      raw_payload: result,
      sent_at: new Date().toISOString(),
    });

    // Update conversation
    await supabase
      .from('whatsapp_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: message.substring(0, 100),
      })
      .eq('id', conversation_id);

    return NextResponse.json({
      success: true,
      message_id: result.id,
    });
  } catch (error) {
    console.error('Send WhatsApp message error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 12. API CUSTOMER - MY ORDERS
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

    const { data: orders, count, error } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        total_cents,
        status,
        created_at,
        paid_at,
        shipped_at,
        delivered_at,
        shipment:shipments(
          tracking_code,
          tracking_url,
          status,
          shipping_method,
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
      data: orders || [],
      pagination: {
        page,
        per_page: perPage,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / perPage),
      },
    });
  } catch (error) {
    console.error('List customer orders error:', error);
    return NextResponse.json(
      { error: 'Erro ao listar pedidos' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 13. API CUSTOMER - ORDER DETAILS
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
        shipment:shipments(*),
        payment:payment_transactions(
          method,
          status,
          card_brand,
          card_last_digits,
          installments
        ),
        items:order_items(
          *,
          product:products(name, image_url)
        ),
        status_history:order_status_history(
          to_status,
          notes,
          created_at
        )
      `
      )
      .eq('id', params.id)
      .eq('user_id', user.id) // Ensure user can only see their own orders
      .single();

    if (error || !order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: order });
  } catch (error) {
    console.error('Get order details error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pedido' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 14. API AUTH - REGISTER
// ============================================================================
// Arquivo: app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  cpf: z.string().min(11),
  phone: z.string().min(10),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const supabase = createClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'E-mail já cadastrado' },
        { status: 400 }
      );
    }

    // Check if CPF already exists
    const { data: existingCPF } = await supabase
      .from('users')
      .select('id')
      .eq('cpf', data.cpf.replace(/\D/g, ''))
      .single();

    if (existingCPF) {
      return NextResponse.json(
        { error: 'CPF já cadastrado' },
        { status: 400 }
      );
    }

    // Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw authError;
    }

    // Create user in database
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id, // Use same ID as auth
        name: data.name,
        email: data.email,
        cpf: data.cpf.replace(/\D/g, ''),
        phone: data.phone.replace(/\D/g, ''),
        role: 'customer',
        source: 'register',
      })
      .select('id, name, email')
      .single();

    if (userError) throw userError;

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'Cadastro realizado! Verifique seu e-mail para confirmar.',
    });
  } catch (error) {
    console.error('Register error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}


// ============================================================================
// 15. API AUTH - LOGIN
// ============================================================================
// Arquivo: app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', data.user.id)
      .single();

    return NextResponse.json({
      success: true,
      user,
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'Erro ao fazer login' }, { status: 500 });
  }
}
