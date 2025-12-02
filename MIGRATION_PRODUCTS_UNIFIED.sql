-- Migration: Unificar produtos físicos e digitais
-- Data: 02/12/2024
-- Descrição: Adiciona suporte para produtos físicos e digitais na mesma tabela

-- 1. Criar enum de tipo de produto
CREATE TYPE product_type AS ENUM ('physical', 'digital');

-- 2. Adicionar novas colunas à tabela products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS "creatorId" INTEGER,
  ADD COLUMN IF NOT EXISTS "productType" product_type DEFAULT 'physical' NOT NULL,
  ADD COLUMN IF NOT EXISTS "fileUrl" VARCHAR(500),
  ADD COLUMN IF NOT EXISTS "fileType" VARCHAR(50),
  ADD COLUMN IF NOT EXISTS "fileSizeBytes" INTEGER;

-- 3. Tornar campos físicos opcionais (nullable)
ALTER TABLE products 
  ALTER COLUMN "weightGrams" DROP NOT NULL,
  ALTER COLUMN "widthCm" DROP NOT NULL,
  ALTER COLUMN "heightCm" DROP NOT NULL,
  ALTER COLUMN "depthCm" DROP NOT NULL,
  ALTER COLUMN "stockQuantity" DROP NOT NULL;

-- 4. Remover defaults dos campos físicos
ALTER TABLE products 
  ALTER COLUMN "weightGrams" DROP DEFAULT,
  ALTER COLUMN "widthCm" DROP DEFAULT,
  ALTER COLUMN "heightCm" DROP DEFAULT,
  ALTER COLUMN "depthCm" DROP DEFAULT;

-- 5. Criar índice para productType
CREATE INDEX IF NOT EXISTS "product_type_idx" ON products("productType");

-- 6. Criar índice para creatorId
CREATE INDEX IF NOT EXISTS "creator_id_idx" ON products("creatorId");

-- Comentários
COMMENT ON COLUMN products."productType" IS 'Tipo do produto: physical (físico com frete) ou digital (download)';
COMMENT ON COLUMN products."creatorId" IS 'ID da criadora que criou o produto (opcional, null = admin)';
COMMENT ON COLUMN products."fileUrl" IS 'URL do arquivo para produtos digitais (Supabase Storage)';
COMMENT ON COLUMN products."fileType" IS 'Tipo do arquivo (pdf, epub, zip, etc)';
COMMENT ON COLUMN products."fileSizeBytes" IS 'Tamanho do arquivo em bytes';
COMMENT ON COLUMN products."weightGrams" IS 'Peso em gramas (apenas para produtos físicos)';
COMMENT ON COLUMN products."widthCm" IS 'Largura em cm (apenas para produtos físicos)';
COMMENT ON COLUMN products."heightCm" IS 'Altura em cm (apenas para produtos físicos)';
COMMENT ON COLUMN products."depthCm" IS 'Profundidade em cm (apenas para produtos físicos)';
COMMENT ON COLUMN products."stockQuantity" IS 'Quantidade em estoque (apenas para produtos físicos)';
