-- ============================================================================
-- HAYAH ALEXSANDRA LIVRO - SCHEMA COMPLETO DO BANCO DE DADOS
-- Sistema de vendas do livro "Mulher Sábia, Vida Próspera"
-- Banco: PostgreSQL (Supabase)
-- Data: 28/11/2025
-- ============================================================================

-- ============================================================================
-- 1. EXTENSÕES
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. TIPOS ENUM
-- ============================================================================

-- Status do pedido
CREATE TYPE order_status AS ENUM (
  'AGUARDANDO_PAGAMENTO',
  'PAGO',
  'EM_SEPARACAO',
  'POSTADO',
  'EM_TRANSITO',
  'ENTREGUE',
  'CANCELADO',
  'REEMBOLSADO',
  'PROBLEMA'
);

-- Status do envio
CREATE TYPE shipment_status AS ENUM (
  'PENDENTE',
  'ETIQUETA_GERADA',
  'POSTADO',
  'EM_TRANSITO',
  'SAIU_PARA_ENTREGA',
  'ENTREGUE',
  'DEVOLVIDO',
  'EXTRAVIADO'
);

-- Tipo de movimentação de estoque
CREATE TYPE movement_type AS ENUM (
  'IN',        -- Entrada
  'OUT',       -- Saída
  'ADJUSTMENT' -- Ajuste manual
);

-- Tipo de endereço
CREATE TYPE address_type AS ENUM (
  'shipping',  -- Entrega
  'billing'    -- Cobrança
);

-- Direção da mensagem WhatsApp
CREATE TYPE message_direction AS ENUM (
  'in',   -- Recebida
  'out'   -- Enviada
);

-- Papel do usuário
CREATE TYPE user_role AS ENUM (
  'customer',
  'admin'
);

-- ============================================================================
-- 3. TABELAS PRINCIPAIS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 USERS - Usuários (clientes e admins)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados pessoais
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  
  -- Autenticação (pode usar Supabase Auth)
  password_hash VARCHAR(255),
  
  -- Perfil
  role user_role DEFAULT 'customer',
  avatar_url VARCHAR(500),
  
  -- Verificações
  email_verified_at TIMESTAMP,
  phone_verified_at TIMESTAMP,
  
  -- Origem do cadastro
  source VARCHAR(50) DEFAULT 'landing', -- landing, checkout, admin, import
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_cpf ON users(cpf);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created ON users(created_at);

-- ----------------------------------------------------------------------------
-- 3.2 PRODUCTS - Produtos (livros)
-- ----------------------------------------------------------------------------
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  sku VARCHAR(50) UNIQUE NOT NULL,
  
  -- Preços (em centavos para evitar problemas de arredondamento)
  price_cents INTEGER NOT NULL,
  compare_at_price_cents INTEGER, -- Preço "de" para mostrar desconto
  
  -- Estoque
  stock_quantity INTEGER DEFAULT 0,
  stock_minimum INTEGER DEFAULT 10,
  track_stock BOOLEAN DEFAULT true,
  
  -- Físico
  weight_grams INTEGER DEFAULT 300,
  width_cm DECIMAL(5,2) DEFAULT 14,
  height_cm DECIMAL(5,2) DEFAULT 21,
  depth_cm DECIMAL(5,2) DEFAULT 2,
  
  -- Mídia
  image_url VARCHAR(500),
  images JSONB DEFAULT '[]', -- Array de URLs
  
  -- Status
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(active);

-- ----------------------------------------------------------------------------
-- 3.3 ADDRESSES - Endereços
-- ----------------------------------------------------------------------------
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo
  type address_type DEFAULT 'shipping',
  
  -- Identificação
  label VARCHAR(50), -- "Casa", "Trabalho", etc.
  recipient_name VARCHAR(255), -- Nome do destinatário (pode ser diferente do user)
  
  -- Endereço
  cep VARCHAR(10) NOT NULL,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(100),
  district VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state CHAR(2) NOT NULL,
  country VARCHAR(50) DEFAULT 'BR',
  
  -- Referência
  reference VARCHAR(255),
  
  -- Flags
  is_default BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_cep ON addresses(cep);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default);

-- ----------------------------------------------------------------------------
-- 3.4 ORDERS - Pedidos
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Número do pedido (sequencial, amigável)
  order_number SERIAL,
  
  -- Relacionamentos
  user_id UUID REFERENCES users(id),
  address_id UUID REFERENCES addresses(id),
  
  -- Valores (em centavos)
  subtotal_cents INTEGER NOT NULL,
  shipping_price_cents INTEGER NOT NULL,
  discount_cents INTEGER DEFAULT 0,
  total_cents INTEGER NOT NULL,
  
  -- Cupom de desconto (se houver)
  coupon_code VARCHAR(50),
  coupon_discount_cents INTEGER DEFAULT 0,
  
  -- Status
  status order_status DEFAULT 'AGUARDANDO_PAGAMENTO',
  
  -- Pagamento
  payment_method VARCHAR(50), -- credit_card, pix, boleto
  
  -- Observações
  customer_notes TEXT, -- Notas do cliente
  admin_notes TEXT,    -- Notas internas
  
  -- Dados do endereço no momento da compra (snapshot)
  shipping_address JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_paid ON orders(paid_at);

-- ----------------------------------------------------------------------------
-- 3.5 ORDER_ITEMS - Itens do pedido
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  
  -- Quantidade
  quantity INTEGER NOT NULL DEFAULT 1,
  
  -- Preço no momento da compra (snapshot)
  unit_price_cents INTEGER NOT NULL,
  total_price_cents INTEGER NOT NULL,
  
  -- Snapshot do produto
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(50) NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ----------------------------------------------------------------------------
-- 3.6 SHIPMENTS - Envios
-- ----------------------------------------------------------------------------
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Método de envio
  shipping_method VARCHAR(50) NOT NULL, -- PAC, SEDEX, MINI_ENVIOS
  shipping_service_code VARCHAR(20),     -- Código do serviço
  
  -- Valores
  shipping_price_cents INTEGER NOT NULL,
  
  -- Rastreamento
  tracking_code VARCHAR(50),
  tracking_url VARCHAR(500),
  
  -- Status
  status shipment_status DEFAULT 'PENDENTE',
  
  -- Etiqueta
  label_url VARCHAR(500),
  label_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Datas
  estimated_delivery DATE,
  posted_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Dados da transportadora
  carrier VARCHAR(100) DEFAULT 'Correios',
  carrier_response JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_shipments_order ON shipments(order_id);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_code);
CREATE INDEX idx_shipments_status ON shipments(status);

-- ----------------------------------------------------------------------------
-- 3.7 PAYMENT_TRANSACTIONS - Transações de pagamento
-- ----------------------------------------------------------------------------
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Identificação externa
  external_id VARCHAR(100), -- ID no gateway (Pagar.me)
  
  -- Gateway
  provider VARCHAR(50) DEFAULT 'pagarme',
  
  -- Método
  method VARCHAR(50) NOT NULL, -- credit_card, pix, boleto
  
  -- Status
  status VARCHAR(50) NOT NULL, -- pending, paid, refused, refunded, etc.
  
  -- Valores
  amount_cents INTEGER NOT NULL,
  refunded_amount_cents INTEGER DEFAULT 0,
  
  -- Parcelamento
  installments INTEGER DEFAULT 1,
  installment_value_cents INTEGER,
  
  -- Dados do Pix
  pix_qr_code TEXT,
  pix_qr_code_url VARCHAR(500),
  pix_copy_paste TEXT,
  pix_expiration TIMESTAMP WITH TIME ZONE,
  
  -- Dados do cartão (parciais, por segurança)
  card_last_digits VARCHAR(4),
  card_brand VARCHAR(50),
  card_holder_name VARCHAR(255),
  
  -- Dados do boleto
  boleto_url VARCHAR(500),
  boleto_barcode VARCHAR(100),
  boleto_expiration DATE,
  
  -- Resposta completa do gateway
  raw_request JSONB,
  raw_response JSONB,
  
  -- Mensagem de erro (se houver)
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_payment_order ON payment_transactions(order_id);
CREATE INDEX idx_payment_external ON payment_transactions(external_id);
CREATE INDEX idx_payment_status ON payment_transactions(status);

-- ----------------------------------------------------------------------------
-- 3.8 ORDER_STATUS_HISTORY - Histórico de status do pedido
-- ----------------------------------------------------------------------------
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Status
  from_status order_status,
  to_status order_status NOT NULL,
  
  -- Notas
  notes TEXT,
  
  -- Quem alterou
  created_by UUID REFERENCES users(id),
  created_by_system BOOLEAN DEFAULT false, -- Se foi alteração automática
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_status_history_created ON order_status_history(created_at);

-- ----------------------------------------------------------------------------
-- 3.9 STOCK_MOVEMENTS - Movimentações de estoque
-- ----------------------------------------------------------------------------
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Tipo e quantidade
  type movement_type NOT NULL,
  quantity INTEGER NOT NULL, -- Positivo para entrada, negativo para saída
  
  -- Estoque resultante
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,
  
  -- Motivo
  reason VARCHAR(255),
  
  -- Relacionamentos
  order_id UUID REFERENCES orders(id), -- Se foi venda
  
  -- Quem fez
  created_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_stock_product ON stock_movements(product_id);
CREATE INDEX idx_stock_order ON stock_movements(order_id);
CREATE INDEX idx_stock_created ON stock_movements(created_at);

-- ----------------------------------------------------------------------------
-- 3.10 WHATSAPP_CONVERSATIONS - Conversas do WhatsApp
-- ----------------------------------------------------------------------------
CREATE TABLE whatsapp_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  user_id UUID REFERENCES users(id),
  
  -- Identificação
  phone VARCHAR(20) NOT NULL,
  
  -- Status da conversa
  unread_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  
  -- Última mensagem
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_preview VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_wa_conv_user ON whatsapp_conversations(user_id);
CREATE INDEX idx_wa_conv_phone ON whatsapp_conversations(phone);
CREATE INDEX idx_wa_conv_last ON whatsapp_conversations(last_message_at DESC);

-- ----------------------------------------------------------------------------
-- 3.11 WHATSAPP_MESSAGES - Mensagens do WhatsApp
-- ----------------------------------------------------------------------------
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  
  -- Relacionamento opcional com pedido
  order_id UUID REFERENCES orders(id),
  
  -- Direção
  direction message_direction NOT NULL,
  
  -- Conteúdo
  content TEXT NOT NULL,
  
  -- Template (se foi mensagem automática)
  template_name VARCHAR(100),
  template_variables JSONB,
  
  -- Identificação externa
  external_id VARCHAR(100),
  
  -- Status da mensagem
  status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, read, failed
  
  -- Resposta completa da API
  raw_payload JSONB,
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_wa_msg_conv ON whatsapp_messages(conversation_id);
CREATE INDEX idx_wa_msg_order ON whatsapp_messages(order_id);
CREATE INDEX idx_wa_msg_sent ON whatsapp_messages(sent_at DESC);
CREATE INDEX idx_wa_msg_external ON whatsapp_messages(external_id);

-- ----------------------------------------------------------------------------
-- 3.12 EMAIL_LOGS - Log de e-mails enviados
-- ----------------------------------------------------------------------------
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamentos
  user_id UUID REFERENCES users(id),
  order_id UUID REFERENCES orders(id),
  
  -- E-mail
  to_email VARCHAR(255) NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  
  -- Template
  template_name VARCHAR(100) NOT NULL,
  template_variables JSONB,
  
  -- Status
  status VARCHAR(50) DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
  
  -- Identificação externa
  external_id VARCHAR(100),
  
  -- Resposta do provider
  raw_response JSONB,
  error_message TEXT,
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_email_user ON email_logs(user_id);
CREATE INDEX idx_email_order ON email_logs(order_id);
CREATE INDEX idx_email_sent ON email_logs(sent_at DESC);

-- ----------------------------------------------------------------------------
-- 3.13 COUPONS - Cupons de desconto (opcional, para futuro)
-- ----------------------------------------------------------------------------
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Código
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(255),
  
  -- Tipo de desconto
  discount_type VARCHAR(20) NOT NULL, -- percentage, fixed
  discount_value INTEGER NOT NULL,     -- Percentual ou valor em centavos
  
  -- Limites
  min_order_cents INTEGER DEFAULT 0,
  max_discount_cents INTEGER,
  
  -- Uso
  usage_limit INTEGER,           -- Limite total de usos
  usage_per_user INTEGER DEFAULT 1, -- Limite por usuário
  usage_count INTEGER DEFAULT 0,    -- Usos realizados
  
  -- Validade
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(active, starts_at, expires_at);

-- ----------------------------------------------------------------------------
-- 3.14 SETTINGS - Configurações do sistema
-- ----------------------------------------------------------------------------
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Chave-valor
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  
  -- Metadados
  description VARCHAR(500),
  type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_settings_key ON settings(key);

-- ============================================================================
-- 4. TRIGGERS E FUNÇÕES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 Função para atualizar updated_at automaticamente
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wa_conversations_updated_at
  BEFORE UPDATE ON whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4.2 Função para registrar histórico de status do pedido
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, from_status, to_status, created_by_system)
    VALUES (NEW.id, OLD.status, NEW.status, true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ----------------------------------------------------------------------------
-- 4.3 Função para atualizar estoque automaticamente
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_stock_on_order_paid()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Quando pedido é marcado como PAGO, reduz estoque
  IF OLD.status != 'PAGO' AND NEW.status = 'PAGO' THEN
    FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
      -- Registra movimentação
      INSERT INTO stock_movements (product_id, type, quantity, stock_before, stock_after, reason, order_id, created_by)
      SELECT 
        item.product_id,
        'OUT',
        -item.quantity,
        p.stock_quantity,
        p.stock_quantity - item.quantity,
        'Venda - Pedido #' || NEW.order_number,
        NEW.id,
        NULL
      FROM products p WHERE p.id = item.product_id;
      
      -- Atualiza estoque do produto
      UPDATE products 
      SET stock_quantity = stock_quantity - item.quantity
      WHERE id = item.product_id;
    END LOOP;
  END IF;
  
  -- Quando pedido é cancelado/reembolsado, devolve estoque
  IF OLD.status = 'PAGO' AND NEW.status IN ('CANCELADO', 'REEMBOLSADO') THEN
    FOR item IN SELECT * FROM order_items WHERE order_id = NEW.id LOOP
      -- Registra movimentação
      INSERT INTO stock_movements (product_id, type, quantity, stock_before, stock_after, reason, order_id, created_by)
      SELECT 
        item.product_id,
        'IN',
        item.quantity,
        p.stock_quantity,
        p.stock_quantity + item.quantity,
        'Cancelamento - Pedido #' || NEW.order_number,
        NEW.id,
        NULL
      FROM products p WHERE p.id = item.product_id;
      
      -- Atualiza estoque do produto
      UPDATE products 
      SET stock_quantity = stock_quantity + item.quantity
      WHERE id = item.product_id;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_stock_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_stock_on_order_paid();

-- ----------------------------------------------------------------------------
-- 4.4 Função para garantir apenas um endereço padrão por usuário
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE addresses 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER address_default_trigger
  BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION ensure_single_default_address();

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Produtos e configurações são públicos para leitura
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5.1 Políticas para USERS
-- ----------------------------------------------------------------------------
-- Usuários podem ver/editar apenas seus próprios dados
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins podem ver todos
CREATE POLICY users_admin_all ON users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- 5.2 Políticas para ADDRESSES
-- ----------------------------------------------------------------------------
CREATE POLICY addresses_own ON addresses
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY addresses_admin ON addresses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- 5.3 Políticas para ORDERS
-- ----------------------------------------------------------------------------
CREATE POLICY orders_own ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY orders_admin ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Permitir inserção durante checkout (service role)
CREATE POLICY orders_insert ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.4 Políticas para ORDER_ITEMS
-- ----------------------------------------------------------------------------
CREATE POLICY order_items_own ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY order_items_admin ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- 5.5 Políticas para PRODUCTS (público para leitura)
-- ----------------------------------------------------------------------------
CREATE POLICY products_public_read ON products
  FOR SELECT USING (active = true);

CREATE POLICY products_admin ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- 5.6 Políticas para SHIPMENTS
-- ----------------------------------------------------------------------------
CREATE POLICY shipments_own ON shipments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = shipments.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY shipments_admin ON shipments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ----------------------------------------------------------------------------
-- 5.7 Políticas para WHATSAPP (apenas admin)
-- ----------------------------------------------------------------------------
CREATE POLICY wa_conversations_admin ON whatsapp_conversations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY wa_messages_admin ON whatsapp_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================================
-- 6. DADOS INICIAIS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6.1 Produto inicial (o livro)
-- ----------------------------------------------------------------------------
INSERT INTO products (
  name,
  slug,
  description,
  short_description,
  sku,
  price_cents,
  compare_at_price_cents,
  stock_quantity,
  stock_minimum,
  weight_grams,
  width_cm,
  height_cm,
  depth_cm,
  active,
  featured
) VALUES (
  'Mulher Sábia, Vida Próspera',
  'mulher-sabia-vida-prospera',
  'Um ano inteiro aprendendo com Provérbios a viver com equilíbrio, abundância e graça. Este livro oferece 365 dias de reflexões diárias baseadas no livro de Provérbios, ajudando mulheres a desenvolverem sabedoria prática para todas as áreas da vida.',
  'Devocional diário com 365 reflexões baseadas em Provérbios.',
  'MSVP-001',
  8990,  -- R$ 89,90
  NULL,
  500,   -- Estoque inicial
  50,    -- Estoque mínimo
  350,   -- 350 gramas
  16.00, -- 16cm largura
  23.00, -- 23cm altura
  2.50,  -- 2.5cm profundidade
  true,
  true
);

-- ----------------------------------------------------------------------------
-- 6.2 Configurações iniciais
-- ----------------------------------------------------------------------------
INSERT INTO settings (key, value, description, type) VALUES
  ('site_name', 'Mulher Sábia, Vida Próspera', 'Nome do site', 'string'),
  ('site_description', 'Livro devocional de Alexsandra Sardinha', 'Descrição do site', 'string'),
  ('contact_email', 'contato@hayah.com.br', 'E-mail de contato', 'string'),
  ('contact_phone', '+5511999999999', 'Telefone de contato', 'string'),
  ('shipping_origin_cep', '01310100', 'CEP de origem para cálculo de frete', 'string'),
  ('free_shipping_threshold', '0', 'Valor mínimo para frete grátis (0 = desativado)', 'number'),
  ('pix_discount_percent', '0', 'Desconto para pagamento via Pix (0 = sem desconto)', 'number'),
  ('max_installments', '3', 'Número máximo de parcelas', 'number'),
  ('min_installment_value', '3000', 'Valor mínimo da parcela em centavos', 'number');

-- ============================================================================
-- 7. VIEWS ÚTEIS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 7.1 View de pedidos com informações completas
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW orders_complete AS
SELECT 
  o.*,
  u.name as customer_name,
  u.email as customer_email,
  u.phone as customer_phone,
  s.tracking_code,
  s.status as shipping_status,
  s.shipping_method,
  pt.method as payment_method_detail,
  pt.status as payment_status,
  pt.card_brand,
  pt.card_last_digits
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN shipments s ON o.id = s.order_id
LEFT JOIN payment_transactions pt ON o.id = pt.order_id;

-- ----------------------------------------------------------------------------
-- 7.2 View de dashboard financeiro
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW dashboard_metrics AS
SELECT
  COUNT(*) FILTER (WHERE status NOT IN ('CANCELADO', 'REEMBOLSADO')) as total_orders,
  COUNT(*) FILTER (WHERE status = 'PAGO') as paid_orders,
  COUNT(*) FILTER (WHERE status = 'ENTREGUE') as delivered_orders,
  COALESCE(SUM(total_cents) FILTER (WHERE status NOT IN ('AGUARDANDO_PAGAMENTO', 'CANCELADO', 'REEMBOLSADO')), 0) as total_revenue_cents,
  COALESCE(AVG(total_cents) FILTER (WHERE status NOT IN ('AGUARDANDO_PAGAMENTO', 'CANCELADO', 'REEMBOLSADO')), 0) as average_order_cents,
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as orders_today,
  COALESCE(SUM(total_cents) FILTER (WHERE DATE(created_at) = CURRENT_DATE AND status NOT IN ('AGUARDANDO_PAGAMENTO', 'CANCELADO', 'REEMBOLSADO')), 0) as revenue_today_cents
FROM orders;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
