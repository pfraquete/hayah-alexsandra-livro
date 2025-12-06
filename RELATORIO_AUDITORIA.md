# Relatório de Auditoria Técnica 360º

## 1. Auditoria Geral
- **Variáveis sensíveis expostas**: o servidor usa variáveis prefixadas com `VITE_`, indicadas para uso no cliente. Isso sinaliza risco de exposição do `SUPABASE_URL` e `SUPABASE_ANON_KEY` em bundles front-end e impede rotação segura de chaves na borda.【F:server/supabase.ts†L1-L21】
- **Autenticação permissiva**: o contexto TRPC considera autenticação opcional e não invalida tokens malformados; falha apenas é registrada em log e segue com `user = null`, abrindo espaço para abuso de rotas sem auditoria de origem.【F:server/_core/context.ts†L13-L56】
- **Ausência de políticas de segurança transversais**: não há rate limiting, controle de origem (CORS), nem proteções contra CSRF/XSS documentadas no lado servidor ou cliente; sessões são baseadas apenas em header `Authorization` sem rotação.
- **Observabilidade insuficiente**: logs espalhados e sem correlação estruturada; ausência de tracing, métricas ou alertas para operações críticas (checkout, criação de usuário, uploads).

## 2. Auditoria do Backend
- **Segurança**
  - Tokens Supabase são consumidos diretamente via anon key; falta validação de expiração/issuer e ausência de chave de serviço para verificação robusta. Recomendação: usar a chave de serviço no backend, validar `exp`/`aud` e extrair claims de forma segura antes de criar sessões.【F:server/supabase.ts†L3-L20】
  - Fluxo de autenticação não diferencia falhas: qualquer erro cai para `user = null`, permitindo chamadas “anônimas” a rotas que deveriam ser protegidas. Sugestão: tornar middleware obrigatório em rotas sensíveis e devolver 401 explícito; mover criação de usuário para caminho autenticado e auditar campos obrigatórios.【F:server/_core/context.ts†L20-L56】
- **Escalabilidade & Performance**
  - Conexões Postgres são criadas sem pool configurado ou retry/backoff; em alta concorrência pode gerar exaustão de conexões. Recomendar `postgres({ max: <n>, idle_timeout: ... })` e health-checks.
  - Ausência de caching para catálogos/produtos e para sessão; todo request faz roundtrip ao Supabase e DB.
- **Banco & Migrations**
  - Não há verificação automática de migrações na inicialização; risco de schema drift. Adicionar passo obrigatório no bootstrap e CI.
- **Assíncrono & Resiliência**
  - Falta fila para eventos (ex.: pedidos, emails, webhooks). Recomendar uso de fila (BullMQ/SQS) com DLQ.
- **Tratamento de erros**
  - Logs genéricos e sem códigos de erro; não há sanitização de erros antes de retornar ao cliente.
- **Observabilidade**
  - Inexistência de tracing (OpenTelemetry), métricas (Prometheus) e dashboards (Grafana). Priorizar instrumentação de checkout, autenticação e uploads.
- **Downtime & Operação**
  - Sem healthcheck/heartbeat; recomenda-se endpoint `/healthz` com checagem de DB, Supabase e fila.
- **Custo Operacional**
  - Chamada a Supabase por requisição aumenta custo; implementar cache de sessão (Redis) e job de rotação de tokens.

### Correções rápidas propostas
- Trocar criação do cliente Supabase para usar variável `SUPABASE_SERVICE_ROLE_KEY` e validar JWT antes de aceitar o usuário. Exemplo:
  ```ts
  // server/supabase.ts
  import { createClient } from '@supabase/supabase-js';
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
  });
  export async function assertUser(accessToken: string) {
    const { data, error } = await supabase.auth.getUser(accessToken);
    if (error || !data.user || !data.user.aud?.includes('authenticated')) {
      throw new Error('INVALID_TOKEN');
    }
    return data.user;
  }
  ```
- Transformar `createContext` em middleware estrito para rotas protegidas e devolver 401 em vez de silenciar erros; aplicar rate limiting e CORS fechado por domínio confiável.

## 3. Auditoria do Frontend
- **Proteção de rotas baseada apenas em flag de autenticação**: `ProtectedRoute` só verifica `isAuthenticated` (sem role/escopo), permitindo que um usuário comum acesse páginas de admin caso o componente não valide internamente. Recomendação: expandir `ProtectedRoute` para aceitar roles e validar claims JWT antes do render.【F:client/src/components/ProtectedRoute.tsx†L6-L55】
- **Roteamento extenso sem divisão de bundles**: `App.tsx` importa todas as páginas em bundle único; risco de carregamento lento e layout shift em dispositivos móveis. Implementar code-splitting via `lazy`/`Suspense` e rotas assíncronas.【F:client/src/App.tsx†L1-L194】
- **Acessibilidade/UX**
  - Falta fallback global para erros de rede e estados vazios; apenas loader básico em auth.
  - Necessário revisar formulários (login/cadastro) para labels e aria attributes.
- **SEO/Performance**
  - Uso de Wouter sem SSR/Meta tags; páginas públicas carecem de `title/description` dinâmicos.

## 4. Teste Integrado (E2E) – Plano mínimo
- **Cenários críticos a automatizar**: login/cadastro, checkout de produto físico/digital, reprodução de curso, upload de mídia, fluxo de comunidade (criar post/comentar), reset de senha.
- **Matriz de avaliação**: cada cenário deve registrar `Passou/ Falhou`, impacto e severidade com logs estruturados. Ferramenta sugerida: Playwright + Supabase emulator para fixtures.

## 5. Organização do GitHub
- **Estrutura sugerida**
  - Monorepo com workspaces (`apps/server`, `apps/web`, `packages/shared`).
  - Pastas `infra/` (IaC, pipelines), `docs/` (runbooks), `tests/e2e`.
- **Governança**
  - Convenção de branches: `main` (prod), `develop` (staging), feature branches `feat/*`, hotfix `fix/*`.
  - Commits: Conventional Commits; PR template com checklist de segurança (auth, logs, migração, testes).
  - Rodmap inicial: hardening de auth (Semana 1-2), observabilidade (Semana 3-4), SSR e code-splitting (Semana 5-6), filas e webhooks idempotentes (Semana 7-8), testes E2E completos (até 90 dias).
- **Itens para remoção/arquivamento**
  - Variáveis `VITE_*` no backend; mover para `.env.server`. Arquivar arquivos de especificação obsoletos duplicados e consolidar em `/docs`.

## 6. Roadmap Técnico 90 dias (macro)
1. **Segurança (0-2 semanas)**: chave de serviço Supabase, rate limiting, CORS fechado, middleware 401 estrito, rotação de tokens, auditoria de roles.
2. **Observabilidade (2-4 semanas)**: OpenTelemetry + Prometheus/Grafana, logs estruturados, dashboards de erro/performance.
3. **Performance/UX (4-8 semanas)**: code-splitting, skeletons, SEO básico, cache de catálogo e sessão.
4. **Resiliência (8-12 semanas)**: fila de eventos, DLQ, webhooks idempotentes, retries com backoff, healthchecks.
5. **Qualidade (contínuo)**: CI com lint/test/unit/e2e, verificação de migrações, testes de carga para checkout.

## 7. KPIs Recomendados
- Taxa de erro 4xx/5xx por rota crítica; tempo médio de resposta por domínio (auth, checkout, uploads).
- Latência P95 do checkout e login; sucesso de webhooks; tempo de build/deploy.
- Cobertura de testes (unit e e2e); tempo de recuperação após incidente.

