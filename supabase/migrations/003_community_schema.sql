-- Community schema for exclusive posts, comments, and likes

-- 1. Tabela de Posts
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Comentários
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Curtidas (Likes)
CREATE TABLE community_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Índices para performance
CREATE INDEX idx_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON community_comments(post_id);

-- Gatilhos para contagem automática
CREATE OR REPLACE FUNCTION update_likes_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_likes
AFTER INSERT OR DELETE ON community_likes
FOR EACH ROW EXECUTE FUNCTION update_likes_count();

CREATE OR REPLACE FUNCTION update_comments_count() RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comments
AFTER INSERT OR DELETE ON community_comments
FOR EACH ROW EXECUTE FUNCTION update_comments_count();

-- Habilitar RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para verificar se é cliente (comprou algo pago)
CREATE OR REPLACE FUNCTION is_verified_customer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM orders 
    WHERE user_id = auth.uid() 
    AND status = 'pago'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de acesso
CREATE POLICY "Clientes podem ver posts" ON community_posts
FOR SELECT USING (is_verified_customer() OR is_admin());

CREATE POLICY "Clientes podem ver comentários" ON community_comments
FOR SELECT USING (is_verified_customer() OR is_admin());

CREATE POLICY "Clientes podem ver likes" ON community_likes
FOR SELECT USING (is_verified_customer() OR is_admin());

CREATE POLICY "Clientes podem criar posts" ON community_posts
FOR INSERT WITH CHECK (auth.uid() = user_id AND is_verified_customer());

CREATE POLICY "Clientes podem comentar" ON community_comments
FOR INSERT WITH CHECK (auth.uid() = user_id AND is_verified_customer());

CREATE POLICY "Clientes podem curtir" ON community_likes
FOR INSERT WITH CHECK (auth.uid() = user_id AND is_verified_customer());

CREATE POLICY "Usuário apaga próprio post" ON community_posts
FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Usuário remove próprio like" ON community_likes
FOR DELETE USING (auth.uid() = user_id);
