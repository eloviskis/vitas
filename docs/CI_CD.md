# Guia de CI/CD - Projeto VITAS

## Visão Geral

O pipeline de CI/CD do VITAS é implementado com GitHub Actions e garante qualidade, segurança e deploy automatizado.

## Workflows

### 1. CI - Continuous Integration (.github/workflows/ci.yml)

**Triggers:**
- Push em `main` ou `develop`
- Pull Requests para `main` ou `develop`

**Jobs:**

#### Lint
- ESLint (backend e frontend)
- Prettier (formatação)

#### Test Backend
- Testes unitários
- Testes de integração
- Coverage report (Codecov)
- Serviços: PostgreSQL, Redis

#### Test Frontend
- Testes de componentes
- Testes E2E (opcional)
- Coverage report

#### Build Backend
- Compilação TypeScript
- Validação de build
- Upload de artifacts

#### Build Frontend
- Build PWA (Vite/React ou similar)
- Otimização de assets
- Upload de artifacts

#### Security Scan
- npm audit
- Snyk security scan

**Tempo estimado:** 8-12 minutos

### 2. CD - Continuous Deployment (.github/workflows/deploy.yml)

**Triggers:**
- Push em `main` (automático)
- Manual (workflow_dispatch)

**Ambientes:**

#### Staging
- Deploy automático após merge em `main`
- URL: https://staging.vitas.app
- Testes de smoke
- Notificação no Slack

#### Produção
- Requer aprovação manual (GitHub Environments)
- Deploy após staging bem-sucedido
- URL: https://vitas.app
- Smoke tests obrigatórios
- Criação automática de tags
- Notificação no Slack

**Tempo estimado:** 10-15 minutos

### 3. Kanban Automation (.github/workflows/kanban-automation.yml)

- Adiciona label "In progress" ao abrir PR
- Adiciona label "Done" ao fechar issue

## Docker

### Dockerfiles

#### Backend (docker/Dockerfile.backend)
- Multi-stage build
- Node.js 20 Alpine
- Usuário não-root
- Health check configurado
- Imagem otimizada (~150MB)

#### Frontend (docker/Dockerfile.frontend)
- Build com Node.js
- Servido por Nginx Alpine
- PWA otimizado
- Cache headers configurados
- Imagem otimizada (~25MB)

### Docker Compose (docker-compose.yml)

**Serviços:**
- PostgreSQL 15
- Redis 7
- Backend API
- Frontend PWA

**Uso:**
```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild
docker-compose up -d --build
```

## Secrets Necessários

### GitHub Secrets

#### Docker
- `DOCKER_USERNAME`: Usuário Docker Hub
- `DOCKER_PASSWORD`: Password/Token Docker Hub

#### Staging
- `STAGING_API_URL`: URL da API staging
- `STAGING_DATABASE_URL`: Connection string do DB staging

#### Produção
- `PROD_API_URL`: URL da API produção
- `PROD_DATABASE_URL`: Connection string do DB produção

#### Integrações
- `CODECOV_TOKEN`: Token do Codecov
- `SNYK_TOKEN`: Token do Snyk
- `SLACK_WEBHOOK_URL`: Webhook para notificações

#### Frontend
- `VITE_API_URL`: URL da API (staging/prod)

## Configuração de Environments

No GitHub, configure dois environments:

### staging
- Sem proteção (deploy automático)
- Reviewers: opcional

### production
- Required reviewers: 1-2 pessoas
- Wait timer: 10 minutos (opcional)
- Deployment branches: apenas `main`

## Scripts NPM Necessários

Adicione ao `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/main.ts",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "tsc",
    "build:frontend": "vite build",
    "lint": "eslint src --ext .ts,.tsx",
    "format:check": "prettier --check 'src/**/*.{ts,tsx,json}'",
    "format": "prettier --write 'src/**/*.{ts,tsx,json}'",
    "test": "npm run test:unit && npm run test:integration",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:frontend": "vitest run",
    "test:smoke": "jest --testPathPattern=smoke",
    "migrate:up": "node scripts/migrate.js up",
    "migrate:test": "node scripts/migrate.js test"
  }
}
```

## Status Checks

### Obrigatórios para Merge
- ✅ Lint passou
- ✅ Testes backend (unit + integration)
- ✅ Testes frontend
- ✅ Build backend
- ✅ Build frontend
- ✅ Security scan (warning only)

## Estratégia de Branches

- `main`: Produção (deploy automático para staging, manual para prod)
- `develop`: Desenvolvimento (opcional)
- `feature/*`: Features (ex: `feature/auth`)
- `fix/*`: Bugfixes
- `issue-N-*`: Issues do GitHub (recomendado)

## Monitoramento

### Métricas de CI/CD
- Tempo médio de build: < 12 min
- Taxa de sucesso: > 95%
- Tempo de deploy: < 15 min

### Alertas
- Build falhou: Slack
- Deploy falhou: Slack + e-mail
- Security issues: Slack

## Rollback

### Automático
- Smoke tests falham → rollback automático (configurar)

### Manual
```bash
# Reverter para versão anterior
git revert <commit-sha>
git push

# Ou redeployar tag anterior
gh workflow run deploy.yml -f tag=<tag-anterior>
```

## Troubleshooting

### Build falha
1. Verificar logs no GitHub Actions
2. Rodar localmente: `npm run build`
3. Verificar dependências: `npm ci`

### Testes falham
1. Rodar localmente com Docker Compose
2. Verificar variáveis de ambiente
3. Checar conexão com serviços (Postgres, Redis)

### Deploy falha
1. Verificar secrets configurados
2. Validar permissões de deploy
3. Checar logs do provedor (AWS, Railway, etc)

## Próximos Passos

1. Configurar secrets no GitHub
2. Criar environments (staging, production)
3. Testar pipeline com PR de teste
4. Configurar Codecov e Snyk
5. Adicionar Slack webhook
6. Documentar processo de deploy manual
