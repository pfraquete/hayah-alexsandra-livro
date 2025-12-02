# Configuração do Supabase Storage

Este documento descreve como configurar os buckets do Supabase Storage necessários para o projeto **Hayah Alexsandra Livro**.

---

## 📦 Buckets Necessários

O projeto utiliza **8 buckets** diferentes para organizar os arquivos por tipo e finalidade. Todos os buckets devem ser criados no Supabase Dashboard antes do primeiro uso.

---

## 🔧 Como Criar os Buckets

### Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para [app.supabase.com](https://app.supabase.com)
   - Selecione seu projeto

2. **Navegue até Storage**
   - No menu lateral, clique em **Storage**
   - Clique em **New bucket**

3. **Configure cada bucket conforme a tabela abaixo**

---

## 📋 Lista de Buckets

### 1. **avatars**
- **Nome**: `avatars`
- **Público**: ✅ Sim (Public bucket)
- **Descrição**: Fotos de perfil dos usuários
- **Tipos de arquivo**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Tamanho máximo recomendado**: 2 MB por arquivo
- **Exemplo de uso**: `avatars/user-123.jpg`

**Políticas RLS recomendadas**:
```sql
-- Permitir leitura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Permitir atualização apenas do próprio avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING ( 
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### 2. **covers**
- **Nome**: `covers`
- **Público**: ✅ Sim (Public bucket)
- **Descrição**: Imagens de capa de perfis de criadoras
- **Tipos de arquivo**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Tamanho máximo recomendado**: 5 MB por arquivo
- **Exemplo de uso**: `covers/creator-456.jpg`

**Políticas RLS recomendadas**:
```sql
-- Permitir leitura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'covers' );

-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'covers' 
  AND auth.role() = 'authenticated'
);
```

---

### 3. **products**
- **Nome**: `products`
- **Público**: ✅ Sim (Public bucket)
- **Descrição**: Imagens de produtos (livros)
- **Tipos de arquivo**: `.jpg`, `.jpeg`, `.png`, `.webp`
- **Tamanho máximo recomendado**: 3 MB por arquivo
- **Exemplo de uso**: `products/book-mulher-sabia.jpg`

**Políticas RLS recomendadas**:
```sql
-- Permitir leitura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Permitir upload apenas para admins
CREATE POLICY "Only admins can upload products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
  -- Adicione verificação de role admin aqui se necessário
);
```

---

### 4. **generated**
- **Nome**: `generated`
- **Público**: ✅ Sim (Public bucket)
- **Descrição**: Imagens geradas por IA
- **Tipos de arquivo**: `.png`, `.jpg`, `.webp`
- **Tamanho máximo recomendado**: 5 MB por arquivo
- **Exemplo de uso**: `generated/1733155200000.png`

**Políticas RLS recomendadas**:
```sql
-- Permitir leitura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'generated' );

-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload generated images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'generated' 
  AND auth.role() = 'authenticated'
);
```

---

### 5. **courses**
- **Nome**: `courses`
- **Público**: ❌ Não (Private bucket)
- **Descrição**: Arquivos de cursos (vídeos, PDFs, materiais)
- **Tipos de arquivo**: `.mp4`, `.pdf`, `.zip`, `.docx`
- **Tamanho máximo recomendado**: 100 MB por arquivo (vídeos), 10 MB (outros)
- **Exemplo de uso**: `courses/module-1/lesson-1.mp4`

**Políticas RLS recomendadas**:
```sql
-- Permitir acesso apenas para usuários matriculados
-- (Requer lógica customizada no backend para verificar matrícula)
CREATE POLICY "Enrolled users can access course files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'courses'
  AND auth.role() = 'authenticated'
  -- Adicione verificação de matrícula aqui
);

-- Permitir upload apenas para criadoras
CREATE POLICY "Creators can upload course files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'courses' 
  AND auth.role() = 'authenticated'
  -- Adicione verificação de role creator aqui
);
```

---

### 6. **digital-products**
- **Nome**: `digital-products`
- **Público**: ❌ Não (Private bucket)
- **Descrição**: Produtos digitais para download (e-books, templates, etc.)
- **Tipos de arquivo**: `.pdf`, `.epub`, `.zip`, `.docx`
- **Tamanho máximo recomendado**: 50 MB por arquivo
- **Exemplo de uso**: `digital-products/ebook-bonus.pdf`

**Políticas RLS recomendadas**:
```sql
-- Permitir acesso apenas para compradores
CREATE POLICY "Buyers can access digital products"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'digital-products'
  AND auth.role() = 'authenticated'
  -- Adicione verificação de compra aqui
);

-- Permitir upload apenas para admins/criadoras
CREATE POLICY "Creators can upload digital products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'digital-products' 
  AND auth.role() = 'authenticated'
);
```

---

### 7. **posts**
- **Nome**: `posts`
- **Público**: ✅ Sim (Public bucket)
- **Descrição**: Imagens e vídeos de posts da rede social
- **Tipos de arquivo**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.mp4`
- **Tamanho máximo recomendado**: 10 MB por arquivo
- **Exemplo de uso**: `posts/post-789/image-1.jpg`

**Políticas RLS recomendadas**:
```sql
-- Permitir leitura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'posts' );

-- Permitir upload apenas para usuários autenticados
CREATE POLICY "Authenticated users can upload post media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' 
  AND auth.role() = 'authenticated'
);
```

---

### 8. **public**
- **Nome**: `public`
- **Público**: ✅ Sim (Public bucket)
- **Descrição**: Arquivos públicos diversos (logos, banners, etc.)
- **Tipos de arquivo**: Todos
- **Tamanho máximo recomendado**: 10 MB por arquivo
- **Exemplo de uso**: `public/logo.png`

**Políticas RLS recomendadas**:
```sql
-- Permitir leitura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'public' );

-- Permitir upload apenas para admins
CREATE POLICY "Only admins can upload to public bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public' 
  AND auth.role() = 'authenticated'
);
```

---

## 🔐 Configurações de Segurança

### MIME Types Permitidos

Configure os MIME types permitidos para cada bucket:

**Imagens**:
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

**Vídeos**:
- `video/mp4`
- `video/webm`

**Documentos**:
- `application/pdf`
- `application/zip`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `application/epub+zip`

### Limites de Tamanho

Configure os limites de tamanho no Supabase Dashboard:

1. Vá para **Storage** → **Settings**
2. Configure **File size limit** para cada bucket
3. Recomendações:
   - Avatars/Covers/Products: 5 MB
   - Posts: 10 MB
   - Courses: 100 MB
   - Digital Products: 50 MB
   - Generated: 5 MB
   - Public: 10 MB

---

## 📝 Checklist de Configuração

Após criar todos os buckets, verifique:

- [ ] **avatars** - Público, RLS configurado
- [ ] **covers** - Público, RLS configurado
- [ ] **products** - Público, RLS configurado
- [ ] **generated** - Público, RLS configurado
- [ ] **courses** - Privado, RLS configurado
- [ ] **digital-products** - Privado, RLS configurado
- [ ] **posts** - Público, RLS configurado
- [ ] **public** - Público, RLS configurado

---

## 🧪 Testando o Storage

Após configurar os buckets, teste o upload:

```typescript
// Exemplo de teste no console do Supabase
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('test/test.jpg', file);

console.log(data, error);
```

---

## 🆘 Troubleshooting

### Erro: "Bucket not found"
- Verifique se o bucket foi criado no Supabase Dashboard
- Confirme que o nome do bucket está correto (case-sensitive)

### Erro: "Row Level Security policy violation"
- Verifique se as políticas RLS foram criadas
- Confirme que o usuário está autenticado
- Verifique se o usuário tem permissão para a operação

### Erro: "File size exceeds limit"
- Verifique os limites de tamanho configurados no bucket
- Reduza o tamanho do arquivo antes do upload

---

## 📚 Documentação Oficial

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage API Reference](https://supabase.com/docs/reference/javascript/storage-from-upload)

---

**Última atualização**: 02 de dezembro de 2024
