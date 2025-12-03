# Auditoria Completa de Usabilidade
## Sistema Hayah Alexsandra - Plataforma de Livros e Cursos

---

## 1. O QUE É O SISTEMA?

**Hayah Alexsandra Livro** é uma **plataforma completa de e-commerce e educação online** desenvolvida para a autora Hayah Alexsandra, com foco no público feminino empreendedor cristão.

### Visão Geral
O sistema funciona como um **ecossistema digital completo** que combina:
- **Loja Online** - Venda de livros físicos e produtos digitais
- **Plataforma de Cursos** - Marketplace de cursos online com videoaulas
- **Comunidade Social** - Rede social para criadoras e seguidoras
- **Área Administrativa** - Painel de gestão completo para administradores

O nome "Empreendedoras do Reino" representa a identidade do projeto, voltado para mulheres que desejam empreender com propósito.

---

## 2. PERFIS DE USUÁRIO

O sistema atende **4 perfis distintos** de usuários:

### 👤 Visitante (Sem Cadastro)
Pessoa que ainda não tem conta no sistema.
- Pode navegar pela página inicial
- Pode ver a loja e os produtos
- Pode explorar o marketplace de cursos
- Pode ver a comunidade (modo leitura)
- Precisa criar conta para comprar ou interagir

### 👩 Usuária Cadastrada (Cliente)
Pessoa com conta ativa que consome conteúdo.
- Pode comprar livros físicos e digitais
- Pode se matricular em cursos
- Pode assistir aulas e acompanhar progresso
- Pode interagir na comunidade (curtir, comentar)
- Pode seguir criadoras de conteúdo
- Pode gerenciar seu perfil e pedidos

### ✨ Criadora de Conteúdo
Usuária aprovada para criar e vender conteúdo.
- Pode criar e publicar cursos
- Pode vender produtos digitais próprios
- Pode publicar posts na comunidade
- Pode fixar posts importantes
- Pode ver estatísticas de vendas e engajamento
- Tem perfil público para seguidoras

### 👑 Administradora
Gestora com acesso total ao sistema.
- Pode gerenciar todos os pedidos
- Pode gerenciar todas as usuárias
- Pode moderar conteúdo da comunidade
- Pode ver relatórios financeiros
- Pode gerenciar estoque de produtos
- Controle total sobre a plataforma

---

## 3. PÁGINAS E FUNCIONALIDADES

### 🏠 PÁGINA INICIAL (Home)

**Caminho:** `/`

A página inicial é uma **landing page de alta conversão** para venda do livro principal. É composta por seções estrategicamente organizadas:

#### Seções da Página Inicial:

| Seção | Descrição |
|-------|-----------|
| **Hero** | Banner principal com imagem impactante, título e chamada para ação |
| **Sobre o Livro** | Descrição detalhada do conteúdo e benefícios do livro |
| **Público-Alvo** | Para quem o livro foi escrito (identificação com a leitora) |
| **Sobre a Autora** | Biografia e credenciais de Hayah Alexsandra |
| **Preview** | Prévia do conteúdo - capítulos ou excertos |
| **Bônus** | Materiais extras incluídos na compra |
| **Oferta** | Preço, condições de pagamento e botão de compra |
| **Depoimentos** | Testemunhos de leitoras satisfeitas |
| **Garantia** | Política de satisfação garantida |
| **CTA Final** | Última chamada para ação antes do rodapé |
| **Rodapé** | Links úteis, redes sociais e informações legais |

#### Menu de Navegação:
O menu fixo no topo oferece acesso rápido a:
- **Início** - Volta ao topo da página
- **Loja** - Vai para a loja de produtos
- **Cursos** - Acessa o marketplace de cursos
- **Comunidade** - Entra na rede social
- **Entrar/Ir para o App** - Login ou acesso à área logada

---

### 🛍️ LOJA

**Caminho:** `/loja`

A loja é onde a usuária pode explorar e comprar produtos.

#### Funcionalidades:

| Recurso | Descrição |
|---------|-----------|
| **Busca** | Campo para pesquisar produtos por nome ou descrição |
| **Filtros por Categoria** | Abas para filtrar: Todos, Livros Físicos, Produtos Digitais |
| **Contador** | Mostra quantidade de produtos em cada categoria |
| **Cards de Produto** | Exibe foto, nome, descrição, preço e disponibilidade |
| **Indicador de Estoque** | Mostra quantos itens disponíveis ou "Esgotado" |
| **Preço Comparativo** | Exibe preço original riscado quando há desconto |
| **Tipo de Produto** | Badge indicando se é Físico ou Digital |

#### Tipos de Produtos:

**📦 Produtos Físicos (Livros)**
- Requerem endereço de entrega
- Têm cálculo de frete
- Possuem controle de estoque
- Prazo de entrega informado

**📥 Produtos Digitais**
- Acesso imediato após pagamento
- Não tem frete
- Download ilimitado
- Formatos: PDF, ePub, ZIP

---

### 📖 PÁGINA DO PRODUTO

**Caminho:** `/produto/[nome-do-produto]`

Página detalhada de cada produto com todas as informações.

#### Informações Exibidas:
- Imagem grande do produto
- Nome completo
- Descrição detalhada
- Preço (com desconto se aplicável)
- Disponibilidade em estoque
- Tipo (Físico ou Digital)
- Botão de compra

#### Funcionalidades:
- Seleção de quantidade
- Adição ao carrinho
- Cálculo de frete por CEP (produtos físicos)
- Botão direto para checkout

---

### 🛒 CHECKOUT (Finalização de Compra)

**Caminho:** `/checkout`

Processo de compra em etapas claras e organizadas.

#### Etapa 1: Produto
- Visualização do produto selecionado
- Imagem, nome e preço
- Campo para ajustar quantidade
- Botão "Continuar"

#### Etapa 2: Endereço (apenas produtos físicos)
| Campo | Obrigatório |
|-------|-------------|
| Nome Completo | ✅ Sim |
| CEP | ✅ Sim |
| Endereço (Rua) | ✅ Sim |
| Número | ✅ Sim |
| Complemento | ❌ Não |
| Bairro | ✅ Sim |
| Cidade | ✅ Sim |
| Estado (UF) | ✅ Sim |

**Cálculo de Frete:**
- Digita o CEP e clica em "Calcular Frete"
- Sistema consulta transportadoras em tempo real
- Exibe opções com nome, prazo e preço
- Usuária escolhe a opção desejada

**Opções de Frete Disponíveis:**
- PAC (Correios) - mais econômico
- SEDEX (Correios) - mais rápido
- Jadlog - alternativa privada
- Outras transportadoras conforme região

#### Etapa 3: Pagamento
| Método | Descrição |
|--------|-----------|
| **PIX** | Pagamento instantâneo via QR Code |
| **Boleto Bancário** | Gera boleto para pagamento em banco/lotérica |
| **Cartão de Crédito** | Pagamento parcelado ou à vista |

#### Resumo do Pedido (lateral):
- Subtotal (quantidade × preço)
- Valor do frete
- Total final
- Informações sempre visíveis durante o checkout

---

### 📋 MEUS PEDIDOS

**Caminho:** `/minha-conta/pedidos`

Lista todos os pedidos realizados pela usuária.

#### Informações de Cada Pedido:
- Número do pedido
- Data da compra
- Itens comprados
- Valor total
- Status atual

#### Status Possíveis:

| Status | Significado |
|--------|-------------|
| **Pendente** | Aguardando pagamento |
| **Pago** | Pagamento confirmado |
| **Em Separação** | Sendo preparado para envio |
| **Enviado** | Produto em trânsito |
| **Entregue** | Entrega concluída |
| **Cancelado** | Pedido cancelado |

---

### 📦 DETALHES DO PEDIDO

**Caminho:** `/minha-conta/pedidos/[id-do-pedido]`

Página completa com todas as informações de um pedido específico.

#### Informações Disponíveis:
- Dados completos do pedido
- Lista de itens com fotos
- Endereço de entrega
- Método de pagamento usado
- Histórico de status
- **Código de rastreio** (quando enviado)
- Link para rastrear entrega

---

### 📥 MEUS PRODUTOS DIGITAIS

**Caminho:** `/meus-produtos-digitais`

Biblioteca pessoal de produtos digitais comprados.

#### Funcionalidades:
- Lista de todos os e-books e materiais adquiridos
- Botão de download para cada produto
- Informação de formato do arquivo
- Contador de downloads (se aplicável)
- Acesso permanente aos materiais

---

### 🎓 MARKETPLACE DE CURSOS

**Caminho:** `/marketplace`

Catálogo de todos os cursos disponíveis na plataforma.

#### Funcionalidades:
- Grade de cursos disponíveis
- Filtros por categoria
- Busca por nome
- Cards com informações resumidas

#### Informações de Cada Curso:
- Imagem de capa
- Título do curso
- Nome da criadora
- Descrição breve
- Preço
- Avaliação (estrelas)
- Quantidade de alunos matriculados
- Duração total

---

### 📚 PÁGINA DO CURSO

**Caminho:** `/curso/[nome-do-curso]`

Página detalhada de um curso específico.

#### Seções:

**Informações Gerais:**
- Imagem de capa grande
- Título e descrição completa
- Sobre a instrutora
- Preço e botão de matrícula

**Conteúdo Programático:**
- Lista de módulos
- Aulas de cada módulo
- Duração de cada aula
- Preview de aulas gratuitas (se disponível)

**Avaliações:**
- Nota média (1 a 5 estrelas)
- Quantidade de avaliações
- Comentários de alunas

**O que está incluso:**
- Certificado de conclusão
- Acesso vitalício
- Materiais de apoio
- Suporte

---

### ▶️ ASSISTIR CURSO

**Caminho:** `/curso/[nome-do-curso]/assistir`

Player de vídeo com interface de aprendizado.

#### Funcionalidades:

**Área do Vídeo:**
- Player de vídeo em tela grande
- Controles de reprodução
- Velocidade de reprodução
- Tela cheia

**Menu Lateral:**
- Lista de módulos expansíveis
- Lista de aulas em cada módulo
- Indicador de aula atual
- ✓ Marca de aula concluída
- Duração de cada aula

**Progresso:**
- Barra de progresso do curso
- Porcentagem concluída
- Aulas assistidas vs total

**Ao Concluir:**
- Certificado gerado automaticamente
- Opção de download do certificado
- Convite para avaliar o curso

---

### 📝 MEUS CURSOS

**Caminho:** `/meus-cursos`

Painel de cursos matriculados.

#### Funcionalidades:
- Lista de cursos em andamento
- Barra de progresso de cada curso
- Botão "Continuar assistindo"
- Cursos concluídos
- Acesso aos certificados

---

### 👥 COMUNIDADE

**Caminho:** `/comunidade`

Rede social interna da plataforma.

#### Feed Principal:
- Posts das criadoras que você segue
- Posts em destaque
- Posts fixados (importantes)
- Atualização em tempo real

#### Funcionalidades de Cada Post:
| Ação | Descrição |
|------|-----------|
| **Curtir** | Demonstrar que gostou do post |
| **Comentar** | Escrever comentário no post |
| **Compartilhar** | Compartilhar com outras pessoas |
| **Ver Criadora** | Acessar perfil da autora |

#### Tipos de Conteúdo:
- Textos
- Imagens
- Vídeos
- Links
- Hashtags clicáveis

---

### 🔍 EXPLORAR

**Caminho:** `/comunidade/explorar`

Descobrir novos conteúdos e criadoras.

#### Funcionalidades:
- Posts populares
- Criadoras em destaque
- Hashtags em alta
- Sugestões personalizadas

---

### 👩‍🎨 PERFIL DA CRIADORA

**Caminho:** `/comunidade/criadora/[id]`

Página pública de uma criadora de conteúdo.

#### Informações:
- Foto de perfil
- Nome e biografia
- Redes sociais
- Quantidade de seguidoras
- Cursos publicados
- Posts recentes
- Botão "Seguir"

---

### ✨ TORNAR-SE CRIADORA

**Caminho:** `/comunidade/tornar-criadora`

Formulário para se candidatar a criadora de conteúdo.

#### Processo:
1. Preencher formulário de inscrição
2. Descrever área de atuação
3. Enviar links de trabalhos anteriores
4. Aguardar aprovação da equipe

---

## 4. ÁREA DA CRIADORA

### 📝 Criar Novo Post

**Caminho:** `/criadora/novo-post`

Interface para publicar na comunidade.

#### Campos Disponíveis:
- Texto do post (suporta formatação)
- Upload de imagens/vídeos
- Hashtags
- Opção de fixar post

---

### 📊 Gerenciar Cursos

**Caminho:** `/criadora/cursos`

Painel de gestão dos cursos criados.

#### Funcionalidades:
- Lista de cursos publicados
- Rascunhos em andamento
- Estatísticas de cada curso:
  - Quantidade de alunas matriculadas
  - Receita gerada
  - Avaliação média
  - Taxa de conclusão

---

## 5. PAINEL ADMINISTRATIVO

**Caminho:** `/admin`

Central de controle completa do sistema.

### 📊 Dashboard Principal

#### Métricas em Tempo Real:
- Total de vendas do período
- Quantidade de pedidos
- Novos cadastros
- Receita total

#### Gráficos:
- Vendas por dia/semana/mês
- Produtos mais vendidos
- Cursos mais populares

---

### 📦 Gestão de Pedidos

#### Funcionalidades:
- Lista de todos os pedidos
- Filtros por status, data, cliente
- Atualização de status
- Visualização de detalhes
- Geração de etiquetas de envio
- Registro de rastreio

---

### 👥 Gestão de Usuárias

#### Funcionalidades:
- Lista de todas as usuárias
- Busca por nome/email
- Visualização de perfil
- Alteração de permissões
- Histórico de compras
- Desativação de conta

---

### 📚 Gestão de Produtos

#### Funcionalidades:
- Adicionar novos produtos
- Editar produtos existentes
- Controle de estoque
- Definição de preços
- Upload de imagens
- Ativar/desativar produtos

---

### 🎓 Gestão de Cursos

**Caminho:** `/admin/courses/[id]`

#### Funcionalidades:
- Aprovar/rejeitar cursos
- Editar informações
- Gerenciar módulos e aulas
- Ver estatísticas

---

### 💰 Relatórios Financeiros

#### Disponível:
- Receita por período
- Vendas por produto
- Comissões de criadoras
- Pagamentos pendentes
- Exportação de relatórios

---

## 6. SISTEMA DE AUTENTICAÇÃO

### 🔐 Login

**Caminho:** `/login`

#### Opções de Entrada:
- Email + Senha
- Recuperação de senha

#### Segurança:
- Sessão segura
- Expiração automática
- Proteção contra tentativas excessivas

---

### 📝 Cadastro

**Caminho:** `/cadastro`

#### Campos Obrigatórios:
- Nome completo
- Email
- Senha
- Confirmação de senha
- Aceite dos termos

---

### 🔑 Recuperar Senha

**Caminho:** `/recuperar-senha`

#### Processo:
1. Digitar email cadastrado
2. Receber link por email
3. Criar nova senha
4. Login com nova senha

---

## 7. ÁREA PESSOAL

### 🏠 Dashboard do Usuário

**Caminho:** `/dashboard`

Painel principal após o login.

#### Seções:
- Resumo de pedidos recentes
- Cursos em andamento
- Produtos digitais disponíveis
- Notificações
- Atalhos rápidos

---

### 👤 Meu Perfil

#### Dados Editáveis:
- Nome
- Foto de perfil
- Telefone
- Data de nascimento
- Bio (se criadora)

---

### 📍 Meus Endereços

#### Funcionalidades:
- Adicionar novo endereço
- Editar endereço existente
- Definir endereço padrão
- Excluir endereço

---

## 8. FORMAS DE PAGAMENTO

O sistema oferece **3 métodos de pagamento** integrados:

### 💳 Cartão de Crédito
- Pagamento à vista ou parcelado
- Principais bandeiras aceitas
- Processamento imediato
- Parcelamento em até 12x

### 📱 PIX
- Pagamento instantâneo
- QR Code para leitura
- Código para cópia
- Confirmação automática

### 📄 Boleto Bancário
- Vencimento em 3 dias úteis
- Pagável em qualquer banco
- Compensação em até 2 dias úteis
- PDF para impressão

---

## 9. SISTEMA DE FRETE

### Cálculo Automático
- Consulta transportadoras em tempo real
- Baseado no CEP de destino
- Considera peso e dimensões do produto
- Exibe prazo de entrega

### Transportadoras Integradas:
- **Correios PAC** - Econômico
- **Correios SEDEX** - Expresso
- **Jadlog** - Alternativa privada
- Outras conforme disponibilidade regional

### Rastreamento:
- Código de rastreio informado por email
- Acompanhamento na área do cliente
- Atualização automática de status

---

## 10. NOTIFICAÇÕES E EMAILS

### Emails Automáticos:

| Evento | Email Enviado |
|--------|---------------|
| Cadastro | Boas-vindas + confirmação |
| Compra | Confirmação do pedido |
| Pagamento confirmado | Nota fiscal + acesso |
| Envio | Código de rastreio |
| Entrega | Confirmação + pedido de avaliação |
| Matrícula em curso | Acesso liberado |
| Conclusão de curso | Certificado disponível |
| Recuperação de senha | Link de reset |

---

## 11. RECURSOS ADICIONAIS

### 🤖 Chat com IA (AIChatBox)
- Assistente virtual integrado
- Responde dúvidas sobre produtos
- Ajuda na navegação
- Suporte básico automatizado

### 🗺️ Mapa de Endereço
- Seleção visual de localização
- Preenchimento automático de campos
- Validação de CEP

### 📱 Design Responsivo
- Funciona em computador, tablet e celular
- Interface adaptativa
- Touch-friendly em dispositivos móveis

### 🌙 Tema Claro/Escuro
- Alternância entre modos
- Preferência salva automaticamente
- Respeita configuração do sistema

---

## 12. SEGURANÇA DO SISTEMA

### Proteções Implementadas:
- ✅ Autenticação segura via Supabase
- ✅ Controle de acesso por perfil (RLS)
- ✅ Proteção contra ataques comuns
- ✅ HTTPS em todas as páginas
- ✅ Dados sensíveis criptografados
- ✅ Limite de tentativas de login
- ✅ Sessões com expiração automática

---

## 13. RESUMO DE NAVEGAÇÃO

### Fluxo Principal do Cliente:

```
Página Inicial → Loja → Produto → Checkout → Meus Pedidos
                   ↓
            Marketplace → Curso → Assistir → Certificado
                   ↓
            Comunidade → Explorar → Seguir Criadoras
```

### Fluxo da Criadora:

```
Login → Dashboard → Criar Curso → Publicar → Acompanhar Vendas
                         ↓
                    Novo Post → Publicar → Interagir com Seguidoras
```

### Fluxo Administrativo:

```
Login Admin → Dashboard → Pedidos/Usuárias/Produtos → Relatórios
```

---

## 14. CONCLUSÃO

O sistema **Hayah Alexsandra Livro** é uma plataforma **completa e integrada** que oferece:

- **E-commerce robusto** com venda de físicos e digitais
- **Educação online** com cursos em vídeo
- **Comunidade engajada** com interações sociais
- **Gestão profissional** com painel administrativo
- **Experiência fluida** em qualquer dispositivo

A plataforma atende desde a visitante curiosa até a administradora do sistema, oferecendo funcionalidades específicas para cada perfil de usuária.

---

*Documento gerado em: Dezembro de 2024*
*Versão do Sistema: 1.0*
