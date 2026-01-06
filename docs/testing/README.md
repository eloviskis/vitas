# VITAS - Testing Documentation

Documentação completa da estratégia de testes e guia de execução.

## 📚 Índice

1. [Test Plan](#test-plan) - Estratégia completa
2. [Test Cases](#test-cases) - Casos específicos
3. [Test Configuration](#test-configuration) - Setup e scripts
4. [Execution Guide](#execution-guide) - Como rodar testes

---

## Test Plan

**Arquivo**: [test-plan.md](./test-plan.md)

Plano abrangente com:
- ✓ Estratégia de testes (Unit, Integration, E2E, UAT)
- ✓ Pirâmide de testes e cobertura alvo
- ✓ Matriz de rastreabilidade (requisitos → testes)
- ✓ Plano de UAT com 4 cenários detalhados
- ✓ Métricas de teste e exit criteria
- ✓ Gerenciamento de riscos
- ✓ Formulário de feedback

**Destaques**:
- 141 testes no total (80 unit + 45 integration + 12 E2E + 4 UAT)
- Cobertura alvo: 80% backend, 60% frontend
- Alinhamento 100% com requisitos do Speckit
- Exit criteria clara para go-live

---

## Test Cases

**Arquivo**: [test-cases.md](./test-cases.md)

17 casos de teste detalhados e prontos para execução:

### Autenticação (4 testes)
- ✓ TC-AUTH-001: Registro de novo cliente
- ✓ TC-AUTH-002: Login com credenciais válidas
- ✓ TC-AUTH-003: Login com senha inválida
- ✓ TC-AUTH-004: Registro de profissional com especialidades

### Chamados (3 testes)
- ✓ TC-CHAMADO-001: Criar chamado completo
- ✓ TC-CHAMADO-002: Validação de campos obrigatórios
- ✓ TC-CHAMADO-003: Listar chamados do usuário

### Triagem (2 testes)
- ✓ TC-TRIAGEM-001: Scoring correto (algoritmo)
- ✓ TC-TRIAGEM-002: Sem profissionais disponíveis

### Pagamento (4 testes)
- ✓ TC-PAGTO-001: Gerar QR Code PIX
- ✓ TC-PAGTO-002: Webhook PIX confirma pagamento
- ✓ TC-PAGTO-003: Pagamento com cartão
- ✓ TC-PAGTO-004: Pagamento recusado

### Notificações (2 testes)
- ✓ TC-NOTIF-001: Enviar FCM para novo chamado
- ✓ TC-NOTIF-002: Notificação de orçamento aprovado

### Avaliação (2 testes)
- ✓ TC-AVAL-001: Avaliar serviço
- ✓ TC-AVAL-002: Follow-up automático D+7

Cada teste inclui:
- Pré-condições claras
- Passos detalhados
- Resultado esperado
- Dados de banco esperados
- Critério de aceitação

---

## Test Configuration

**Arquivo**: [test-configuration.md](./test-configuration.md)

Configuração técnica e scripts:

### Backend (NestJS + Jest)
- Jest configuration
- Test database setup (SQLite em memória)
- Unit test examples
- Integration test examples

### Frontend (React + Vitest)
- Vitest configuration
- Test setup (mocks Firebase, localStorage, etc.)
- Component test examples

### E2E (Playwright)
- Playwright configuration
- E2E test examples (login, registration, complete flows)

### CI/CD (GitHub Actions)
- Pipeline completa com 4 jobs:
  - Backend unit + integration testes
  - Frontend unit testes
  - E2E testes
  - Coverage reporting

### NPM Scripts
```bash
# Backend
npm run test              # Todos os testes
npm run test:unit       # Testes unitários
npm run test:integration # Testes de integração
npm run test:cov        # Com cobertura

# Frontend
npm run test:run        # Testes unitários
npm run test:e2e        # E2E testes
npm run test:coverage   # Com cobertura

# CI/CD
npm run test:all       # Todos (unit + E2E)
```

---

## Execution Guide

### Pré-requisitos

```bash
# Node.js 20+
node --version

# Git
git --version

# Dependências instaladas
npm install --workspaces
```

### Executar Testes Localmente

#### 1. Testes Unitários (Backend)

```bash
cd backend

# Rodar uma vez
npm run test:unit

# Modo watch (desenvolvimento)
npm run test:watch

# Com cobertura
npm run test:cov

# Teste específico
npm run test -- src/auth/auth.service.spec.ts
```

#### 2. Testes de Integração (Backend)

```bash
cd backend

# Rodar testes de integração
npm run test:integration

# Com cobertura
npm run test:integration -- --coverage
```

#### 3. Testes Unitários (Frontend)

```bash
cd frontend

# Rodar uma vez
npm run test:run

# Modo watch
npm run test:watch

# Com cobertura
npm run test:coverage

# Com interface (UI)
npm run test:ui
```

#### 4. Testes E2E

```bash
cd frontend

# Rodar testes E2E
npm run test:e2e

# Modo UI (visual)
npm run test:e2e:ui

# Modo headed (navegador visível)
npm run test:e2e:headed

# Teste específico
npm run test:e2e -- e2e/auth.spec.ts
```

### Executar Todos os Testes

```bash
# Na raiz do projeto
npm run test:all

# Ou com cobertura
npm run test:cov
```

### Visualizar Relatórios de Cobertura

```bash
# Backend
open backend/coverage/lcov-report/index.html

# Frontend
open frontend/coverage/lcov-report/index.html

# E2E (HTML report)
open frontend/playwright-report/index.html
```

---

## Fluxo de Testes na Documentação

```
test-plan.md
    ├─ Estratégia geral
    ├─ Níveis de teste (Unit, Integration, E2E, UAT)
    ├─ Pirâmide de testes
    ├─ Matriz de rastreabilidade
    └─ Exit criteria

        ↓

test-cases.md
    ├─ 17 casos específicos
    ├─ Pré-condições
    ├─ Passos detalhados
    ├─ Resultados esperados
    └─ Dados de banco

        ↓

test-configuration.md
    ├─ Jest/Vitest setup
    ├─ Exemplos de código
    ├─ GitHub Actions CI/CD
    └─ NPM scripts

        ↓

Execução local e CI/CD
    ├─ npm run test
    ├─ npm run test:cov
    └─ GitHub Actions
```

---

## Cobertura de Testes

### Matriz de Rastreabilidade

| Módulo | Caso de Uso | TC-ID | Tipo | Cobertura |
|--------|------------|-------|------|-----------|
| Auth | Registro Cliente | TC-AUTH-001 | Unit + Integration + E2E | 100% |
| Auth | Login | TC-AUTH-002, 003 | Unit + Integration + E2E | 100% |
| Auth | Registro Profissional | TC-AUTH-004 | Integration + E2E | 100% |
| Chamado | Criar | TC-CHAMADO-001 | Unit + Integration + E2E | 100% |
| Chamado | Validação | TC-CHAMADO-002 | Unit + Integration | 100% |
| Chamado | Listar | TC-CHAMADO-003 | Unit + Integration | 100% |
| Triagem | Scoring | TC-TRIAGEM-001 | Unit | 100% |
| Triagem | Sem Profissionais | TC-TRIAGEM-002 | E2E | 100% |
| Pagamento | PIX | TC-PAGTO-001, 002 | Unit + Integration + E2E | 100% |
| Pagamento | Cartão | TC-PAGTO-003, 004 | Integration + E2E | 100% |
| Notificação | FCM | TC-NOTIF-001, 002 | Integration + Manual | 100% |
| Avaliação | Avaliar | TC-AVAL-001 | E2E | 100% |
| Avaliação | Follow-up | TC-AVAL-002 | Unit | 100% |

**Total**: 11/11 requisitos cobertos por testes

---

## Status de Implementação

### ✅ Documentação Completa
- [x] test-plan.md (3100+ linhas)
- [x] test-cases.md (2500+ linhas)
- [x] test-configuration.md (1200+ linhas)
- [x] README.md (este arquivo)

### 🔄 Implementação em Progresso
- [ ] Testes unitários backend (Jest)
- [ ] Testes de integração backend (Supertest)
- [ ] Testes unitários frontend (Vitest)
- [ ] Testes E2E (Playwright)

### 📋 Pronto para Próximos Passos
1. Implementar testes unitários backend (10-15 horas)
2. Implementar testes de integração (8-10 horas)
3. Implementar testes unitários frontend (5-8 horas)
4. Implementar testes E2E (5-8 horas)
5. Configurar CI/CD GitHub Actions (2-3 horas)
6. Executar e validar UAT (8-10 horas)

---

## Próximos Passos

### Fase 1: Preparação (1 dia)
- [ ] Setup repositories de testes
- [ ] Configurar jest.config.js + vitest.config.ts
- [ ] Preparar dados de teste no banco

### Fase 2: Backend (3 dias)
- [ ] 80 testes unitários
- [ ] 45 testes de integração
- [ ] Atingir 80% cobertura

### Fase 3: Frontend (2 dias)
- [ ] Testes unitários dos componentes
- [ ] Testes de hooks e utilities
- [ ] Atingir 60% cobertura

### Fase 4: E2E (2 dias)
- [ ] 12 testes E2E críticos
- [ ] Teste em múltiplos navegadores
- [ ] Performance validation

### Fase 5: CI/CD (1 dia)
- [ ] GitHub Actions pipeline
- [ ] Codecov integration
- [ ] Automated reporting

### Fase 6: UAT (1 semana)
- [ ] Preparar ambiente de teste
- [ ] Treinar stakeholders
- [ ] Executar 4 cenários UAT
- [ ] Validação final

---

## Referências

### Documentação Externa
- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)

### Arquivos Relacionados
- [UX Wireframes](../ux/wireframes.md) - Design e fluxos
- [User Flows](../ux/user-flows.md) - Jornadas detalhadas
- [OpenAPI Specification](../api/openapi.json) - Contrato de API
- [Architecture Documentation](../architecture/c4-component.md) - Componentes internos

---

## Contato e Suporte

Para dúvidas sobre testes, consulte:
- QA Lead: [nome]
- Dev Lead: [nome]
- Product Manager: [nome]

---

**Última atualização**: 6 de janeiro de 2026  
**Versão**: 1.0.0  
**Status**: 📋 Documentação Completa - Pronto para Implementação  
**Próxima Fase**: Implementação de testes automatizados
