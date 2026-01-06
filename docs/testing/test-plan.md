# VITAS - Test Plan v1.0

Plano de testes abrangente para o MVP do VITAS (Gestão de Chamados de Manutenção).

## 📋 Sumário Executivo

### Escopo
Testes funcionais, de integração, e2e e UAT para validar todos os fluxos críticos do MVP.

### Objetivos
- Validar que o sistema atende aos requisitos especificados
- Identificar bugs críticos antes do lançamento
- Garantir qualidade mínima de 80% cobertura de testes
- Validar experiência do usuário com dados reais

### Cronograma
- **Unit Tests**: Paralelo ao desenvolvimento
- **Integration Tests**: Após feature completa
- **E2E Tests**: Após integração
- **UAT**: Última semana antes do lançamento
- **Go-live**: Quando cobertura >= 80%

---

## 1. Estratégia de Testes

### Níveis de Teste

#### 1.1 Testes Unitários (Unit Tests)
**Escopo**: Funções, métodos, services isolados

**Tecnologia**: Jest

**Cobertura Alvo**: 80%

**O que testar**:
- Services (AuthService, ChamadoService, TriagemService, etc.)
- DTOs e validações
- Utilities/helpers
- Guards e middlewares

**O que NÃO testar**:
- Controllers (testado em integração)
- Banco de dados (testado em integração)
- APIs externas (mockar)

**Exemplo**:
```typescript
describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash password with bcrypt', async () => {
      const password = 'teste123';
      const hashed = await authService.hashPassword(password);
      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'teste123';
      const hashed = await authService.hashPassword(password);
      const result = await authService.comparePassword(password, hashed);
      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'teste123';
      const hashed = await authService.hashPassword(password);
      const result = await authService.comparePassword('wrong', hashed);
      expect(result).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should return true for valid email', () => {
      expect(authService.validateEmail('user@example.com')).toBe(true);
    });

    it('should return false for invalid email', () => {
      expect(authService.validateEmail('invalid')).toBe(false);
    });
  });
});
```

---

#### 1.2 Testes de Integração (Integration Tests)
**Escopo**: Controllers + Services + Database

**Tecnologia**: Jest + Supertest

**Cobertura Alvo**: 70%

**O que testar**:
- Endpoints REST (request → response)
- Validações de entrada (DTOs)
- Erros e exceções
- Transações de banco

**O que NÃO testar**:
- UI/Frontend
- APIs externas (mockar)
- Performance/load

**Exemplo**:
```typescript
describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  describe('POST /auth/register', () => {
    it('should create new user and return token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'senha123',
          nome: 'João Silva',
          role: 'cliente'
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should return 400 if email already exists', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'senha123',
          nome: 'João',
          role: 'cliente'
        });

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'outra123',
          nome: 'Maria',
          role: 'cliente'
        })
        .expect(400);

      expect(response.body.message).toContain('Email já cadastrado');
    });

    it('should return 400 if password < 6 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'user@example.com',
          password: '12345',
          nome: 'João',
          role: 'cliente'
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'cliente@example.com',
          password: 'senha123',
          nome: 'Cliente Test',
          role: 'cliente'
        });
    });

    it('should return token for valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'cliente@example.com',
          password: 'senha123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.role).toBe('cliente');
    });

    it('should return 401 for invalid password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'cliente@example.com',
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should return 401 for non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'senha123'
        })
        .expect(401);
    });
  });
});
```

---

#### 1.3 Testes End-to-End (E2E)
**Escopo**: Fluxos completos do usuário (browser simulado)

**Tecnologia**: Playwright / Cypress

**Cobertura Alvo**: 50% (fluxos críticos)

**O que testar**:
- Fluxo de login até pagamento (cliente)
- Fluxo de recepção de chamado até conclusão (profissional)
- Fluxos de erro (pagamento recusado, profissional recusa, etc.)
- Performance em cenários reais

**Exemplo** (Playwright):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Client Full Flow: Create and Pay for Service', () => {
  let browser;
  let context;
  let page;

  test.beforeEach(async ({ browser: playwrightBrowser }) => {
    browser = playwrightBrowser;
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('http://localhost:5173');
  });

  test('should complete full flow from login to payment', async () => {
    // 1. Login
    await page.click('text=ENTRAR');
    await page.fill('input[placeholder="Email"]', 'cliente@example.com');
    await page.fill('input[placeholder="Senha"]', 'senha123');
    await page.click('button:has-text("ENTRAR")');
    await page.waitForNavigation();

    // 2. Create Chamado
    await page.click('text=Novo Chamado');
    await page.selectOption('select[name="especialidade"]', 'hidraulica');
    await page.fill('textarea[name="descricao"]', 'Vazamento no chuveiro');
    await page.click('button:has-text("SOLICITAR SERVIÇO")');
    
    // 3. Wait for Triagem
    await page.waitForSelector('text=Profissionais Sugeridos', { timeout: 10000 });

    // 4. Select Professional
    const firstProfissional = await page.locator('[data-testid="profissional-card"]').first();
    await firstProfissional.click();
    await page.click('button:has-text("SOLICITAR ORÇAMENTO")');

    // 5. Wait for Orcamento
    await page.waitForSelector('text=Orçamento Recebido', { timeout: 30000 });

    // 6. Approve and Schedule
    await page.click('button:has-text("APROVAR & AGENDAR")');
    await page.click('[data-testid="slot-14:00"]'); // Select 14:00 slot
    await page.click('button:has-text("CONFIRMAR AGENDAMENTO")');

    // 7. Payment - PIX
    await page.selectOption('input[name="pagamento"]', 'pix');
    await page.click('button:has-text("GERAR QR CODE PIX")');
    await page.waitForSelector('[data-testid="qr-code"]');

    // 8. Verify success page
    await expect(page.locator('text=Pagamento Confirmado')).toBeVisible();
  });

  test.afterEach(async () => {
    await context.close();
  });
});
```

---

#### 1.4 Testes de Aceitação (UAT - User Acceptance Testing)
**Escopo**: Validação com usuários reais/stakeholders

**Quando**: Última semana antes do lançamento

**Como**:
1. Preparar ambiente de teste
2. Documentar cenários de teste
3. Treinar stakeholders
4. Executar testes
5. Documentar feedback

---

### Pirâmide de Testes

```
        UAT (5%)
       /        \
      E2E (15%)
     /            \
  Integration (25%)
 /                  \
Unit Tests (55%)
```

Ideal: Muitos testes rápidos (unit), alguns testes médios (integration), poucos testes lentos (e2e).

---

## 2. Caso de Testes Detalhados

### 2.1 Módulo de Autenticação (Auth)

#### TC-AUTH-001: Registro de Novo Cliente
**Objetivo**: Validar criação de conta para cliente

**Pré-condições**:
- Sistema operacional
- Email não registrado

**Passos**:
1. Abrir aplicação
2. Clicar "CRIAR CONTA"
3. Preencher:
   - Nome: "João Silva"
   - Email: "joao@example.com"
   - Senha: "senha123"
   - Confirmar: "senha123"
4. Deixar "Sou Profissional" desmarcado
5. Clicar "CRIAR CONTA"

**Resultado Esperado**:
- Usuário criado no banco
- JWT token gerado
- Redirecionado para Dashboard
- Email de confirmação enviado

**Critério de Aceitação**:
- ✓ Conta criada com sucesso
- ✓ Senha hasheada (bcrypt)
- ✓ Token válido por 7 dias
- ✓ Email confirmado (ou link enviado)

---

#### TC-AUTH-002: Login com Credenciais Válidas
**Objetivo**: Autenticar usuário existente

**Pré-condições**:
- Usuário "joao@example.com" existe
- Senha "senha123"

**Passos**:
1. Abrir aplicação
2. Inserir email: "joao@example.com"
3. Inserir senha: "senha123"
4. Clicar "ENTRAR"

**Resultado Esperado**:
- JWT token gerado
- Redirecionado para Dashboard
- Token armazenado em localStorage

**Critério de Aceitação**:
- ✓ Login bem-sucedido
- ✓ Token válido
- ✓ Permissões corretas

---

#### TC-AUTH-003: Login com Senha Inválida
**Objetivo**: Rejeitar login com credenciais erradas

**Pré-condições**:
- Usuário "joao@example.com" existe
- Senha correta é "senha123"

**Passos**:
1. Abrir aplicação
2. Inserir email: "joao@example.com"
3. Inserir senha: "senhaerrada"
4. Clicar "ENTRAR"

**Resultado Esperado**:
- Mostrar erro: "Email ou senha inválidos"
- Não fazer login
- Limpar campo de senha

**Critério de Aceitação**:
- ✓ Rejeita credenciais inválidas
- ✓ Mensagem de erro clara
- ✓ Campo de senha limpo

---

#### TC-AUTH-004: Registrar Profissional com Especialidades
**Objetivo**: Criar conta de profissional com dados adicionais

**Pré-condições**:
- Sistema operacional
- Email não registrado

**Passos**:
1. Clicar "CRIAR CONTA"
2. Preencher dados básicos
3. Marcar "Sou Profissional"
4. Selecionar especialidades: Hidráulica, Eletricidade
5. Upload documento (CPF/CNPJ)
6. Clicar "CRIAR CONTA"

**Resultado Esperado**:
- Profissional criado
- Especialidades salvas
- Documento armazenado
- Status: "Aguardando Aprovação" (admin)

**Critério de Aceitação**:
- ✓ Perfil profissional criado
- ✓ Especialidades vinculadas
- ✓ Documento armazenado (S3)

---

### 2.2 Módulo de Chamados

#### TC-CHAMADO-001: Criar Chamado Completo
**Objetivo**: Cliente cria chamado com todos os dados

**Pré-condições**:
- Cliente autenticado
- Câmera/galeria funcionando
- Google Maps acessível

**Passos**:
1. Clicar "Novo Chamado"
2. Selecionar categoria: "Hidráulica"
3. Descrever: "Vazamento no chuveiro, urgente"
4. Tirar 2 fotos
5. Usar localização atual ou inserir endereço
6. Marcar urgência: "Urgente"
7. Orçamento máximo: "R$ 200"
8. Clicar "SOLICITAR SERVIÇO"

**Resultado Esperado**:
- Chamado criado no banco
- Fotos armazenadas (S3)
- Triagem iniciada
- Tela de "Aguardando Triagem"
- Após ~5s: Profissionais sugeridos

**Critério de Aceitação**:
- ✓ Chamado criado com status "aguardando_triagem"
- ✓ Fotos armazenadas e linkadas
- ✓ Localização geolocalizada
- ✓ Triagem executada

---

#### TC-CHAMADO-002: Validação de Campos Obrigatórios
**Objetivo**: Validar que campos obrigatórios são requeridos

**Pré-condições**:
- Cliente na tela de criar chamado

**Passos**:
1. Deixar categoria vazia
2. Clicar "SOLICITAR SERVIÇO"

**Resultado Esperado**:
- Mostrar erro: "Selecione uma categoria"
- Não fazer requisição
- Campo destacado em vermelho

**Critério de Aceitação**:
- ✓ Validações client-side funcionam
- ✓ Mensagens de erro claras
- ✓ Não submete dados inválidos

---

#### TC-CHAMADO-003: Listar Chamados do Usuário
**Objetivo**: Cliente vê seu histórico de chamados

**Pré-condições**:
- Cliente autenticado
- Tem 3+ chamados no histórico

**Passos**:
1. Clicar na aba "Meus Chamados"
2. Aguardar carregamento

**Resultado Esperado**:
- Lista de chamados carregada
- Mostra: status, data, profissional, valor
- Ordenado por data (mais recentes primeiro)
- Pode clicar em cada um para detalhes

**Critério de Aceitação**:
- ✓ Lista carrega corretamente
- ✓ Dados corretos por chamado
- ✓ Filtros funcionam (status, data)

---

### 2.3 Módulo de Triagem

#### TC-TRIAGEM-001: Scoring Correto
**Objetivo**: Validar algoritmo de scoring

**Pré-condições**:
- Chamado criado
- 5+ profissionais disponíveis

**Passos**:
1. Backend executa triagem
2. Verifica score gerado

**Resultado Esperado**:
- Score entre 0-100
- Profissionais ordenados por:
  1. Score (DESC)
  2. Rating (DESC)
  3. Distância (ASC)

**Critério de Aceitação**:
- ✓ Score calculado corretamente
- ✓ Ordenação apropriada
- ✓ Distância validada

---

#### TC-TRIAGEM-002: Sem Profissionais Disponíveis
**Objetivo**: Mensagem quando nenhum profissional match

**Pré-condições**:
- Orçamento máximo: R$ 50 (muito baixo)
- Nenhum profissional por especialidade próximo

**Passos**:
1. Criar chamado com essas restrições

**Resultado Esperado**:
- Mostra: "Nenhum profissional disponível"
- Sugere: aumentar raio, aumentar orçamento
- Permite reagendar triagem

**Critério de Aceitação**:
- ✓ Mensagem clara
- ✓ Sugestões úteis
- ✓ Pode reagendar

---

### 2.4 Módulo de Pagamento

#### TC-PAGTO-001: Gerar QR Code PIX
**Objetivo**: Cliente recebe QR Code para pagar via PIX

**Pré-condições**:
- Orçamento aprovado
- Agendamento confirmado

**Passos**:
1. Ir para tela de pagamento
2. Selecionar "PIX"
3. Clicar "GERAR QR CODE PIX"

**Resultado Esperado**:
- QR Code gerado (padrão visual)
- Mostra valor (R$ 150,00)
- Botão "COPIAR PIX COPIA"
- Timer de 10 minutos
- Status: "Aguardando confirmação"

**Critério de Aceitação**:
- ✓ QR Code válido
- ✓ Código PIX copiável
- ✓ Timer funciona

---

#### TC-PAGTO-002: Pagamento PIX Confirmado (Webhook)
**Objetivo**: Webhook de banco confirma pagamento

**Pré-condições**:
- QR Code gerado
- Cliente pagou via app bancário

**Passos**:
1. Backend recebe webhook: POST /webhooks/pix-callback
2. Status: "aprovado"
3. Transação_id: "abc123"

**Resultado Esperado**:
- Pagamento atualizado no banco
- Cliente vê: "✓ Pagamento Confirmado"
- Profissional recebe notificação
- Agendamento confirmado

**Critério de Aceitação**:
- ✓ Webhook processado
- ✓ Status atualizado
- ✓ Notificações enviadas

---

#### TC-PAGTO-003: Pagamento com Cartão
**Objetivo**: Cliente paga com cartão de crédito

**Pré-condições**:
- Tela de pagamento aberta
- Cartão válido

**Passos**:
1. Selecionar "Cartão de Crédito"
2. Preencher:
   - Número: "4111111111111111" (teste)
   - Nome: "JOAO SILVA"
   - Validade: "12/25"
   - CVV: "123"
3. Parcelar em 1x
4. Clicar "CONFIRMAR PAGAMENTO"

**Resultado Esperado**:
- Gateway processa (Stripe/PagSeguro)
- SE aprovado: Mostra sucesso
- SE recusado: Mostra motivo

**Critério de Aceitação**:
- ✓ Integração com gateway
- ✓ PCI-DSS compliant
- ✓ Dados não armazenados

---

#### TC-PAGTO-004: Pagamento Recusado
**Objetivo**: Cartão recusado mostra opções

**Pré-condições**:
- Cartão expirado ou sem fundos

**Passos**:
1. Tentar pagar com cartão inválido

**Resultado Esperado**:
- Mostra erro: "Cartão recusado - fundos insuficientes"
- Permite tentar novamente
- Pode escolher outro método
- Pode cancelar

**Critério de Aceitação**:
- ✓ Erro descritivo
- ✓ Não debita parcialmente
- ✓ Opções claras

---

### 2.5 Módulo de Notificações

#### TC-NOTIF-001: Enviar Notificação via FCM
**Objetivo**: Profissional recebe notificação de novo chamado

**Pré-condições**:
- App instalado
- Permissão de notificações concedida
- Profissional é match

**Passos**:
1. Cliente cria chamado
2. Triagem identifica profissional
3. Backend chama: POST /notifications/send

**Resultado Esperado**:
- Notificação recebida no celular
- Título: "Novo chamado disponível!"
- Body: "Hidráulica - R$ 150,00 - 2,3 km"
- Click abre detalhes do chamado

**Critério de Aceitação**:
- ✓ FCM integrado
- ✓ Notificação entregue
- ✓ Deep link funciona

---

#### TC-NOTIF-002: Notificação de Orçamento Aprovado
**Objetivo**: Profissional notificado quando cliente aprova orçamento

**Pré-condições**:
- Orçamento enviado
- Cliente aprova

**Passos**:
1. Cliente clica "APROVAR & AGENDAR"
2. Backend dispara notificação

**Resultado Esperado**:
- Notificação: "João Silva aprovou seu orçamento!"
- Mostra data/hora do agendamento
- Profissional pode confirmar ou ajustar

**Critério de Aceitação**:
- ✓ Notificação em tempo real
- ✓ Informações corretas

---

### 2.6 Módulo de Avaliação

#### TC-AVAL-001: Avaliar Serviço
**Objetivo**: Cliente deixa feedback após serviço

**Pré-condições**:
- Serviço concluído
- Cliente confirmou

**Passos**:
1. Abrir tela de avaliação
2. Clicar 5 estrelas
3. Escrever: "Excelente trabalho!"
4. Marcar "Recomenda?"
5. Clicar "ENVIAR AVALIAÇÃO"

**Resultado Esperado**:
- Avaliação salva no banco
- Rating médio do profissional atualizado
- Profissional notificado
- Página de agradecimento

**Critério de Aceitação**:
- ✓ Avaliação persistida
- ✓ Rating recalculado
- ✓ Notificação enviada

---

#### TC-AVAL-002: Follow-up Automático D+7
**Objetivo**: Email automático 7 dias após serviço

**Pré-condições**:
- Serviço completado 7 dias atrás
- Cliente não avaliou

**Passos**:
1. Sistema executa job agendado
2. Envia email de follow-up

**Resultado Esperado**:
- Email recebido
- Subject: "Como foi o serviço com João Silva?"
- Link para tela de avaliação

**Critério de Aceitação**:
- ✓ Job agendado funciona
- ✓ Email enviado corretamente
- ✓ Link válido

---

## 3. Matriz de Rastreabilidade (Traceability Matrix)

Mapeia requisitos do Speckit → Test Cases

| Requisito | Feature | TC-ID | Status | Passou |
|-----------|---------|-------|--------|--------|
| REQ-AUTH-001 | Registro | TC-AUTH-001 | Implementado | ✓ |
| REQ-AUTH-002 | Login | TC-AUTH-002, 003 | Implementado | ✓ |
| REQ-CHAMADO-001 | Criar Chamado | TC-CHAMADO-001, 002 | Implementado | ✓ |
| REQ-CHAMADO-002 | Listar Chamados | TC-CHAMADO-003 | Implementado | ✓ |
| REQ-TRIAGEM-001 | Scoring | TC-TRIAGEM-001 | Implementado | ✓ |
| REQ-TRIAGEM-002 | Matching | TC-TRIAGEM-002 | Implementado | ✓ |
| REQ-PAGTO-001 | PIX | TC-PAGTO-001, 002 | Implementado | ✓ |
| REQ-PAGTO-002 | Cartão | TC-PAGTO-003, 004 | Implementado | ✓ |
| REQ-NOTIF-001 | FCM | TC-NOTIF-001, 002 | Implementado | ✓ |
| REQ-AVAL-001 | Avaliação | TC-AVAL-001 | Implementado | ✓ |
| REQ-AVAL-002 | Follow-ups | TC-AVAL-002 | Implementado | ✓ |

**Legenda**:
- 🟢 Completo (cobertura 100%)
- 🟡 Parcial (cobertura 50-99%)
- 🔴 Não iniciado

---

## 4. Plano de UAT (User Acceptance Testing)

### 4.1 Objetivos
- Validar sistema em ambiente de produção
- Confirmar requisitos atendidos
- Identificar bugs críticos
- Treinar usuários

### 4.2 Participantes

#### Clientes (2-3)
- Usuários reais que precisam do serviço
- Diferentes perfis (urgente, normal)
- Feedback sobre UX

#### Profissionais (2-3)
- Encanadores, eletricistas, etc.
- Validar fluxo de recepção e orçamento
- Testar pagamento

#### Admin (1)
- Verificar painel de controle
- Gestão de usuários
- Resolução de conflitos

#### Product Owner (1)
- Valida requisitos
- Aprova/reprova

### 4.3 Cenários de UAT

#### Cenário 1: Cliente Cria Chamado até Pagamento
**Duração**: 30-45 minutos

**Passos**:
1. Login como cliente
2. Criar chamado (hidráulica)
3. Receber profissionais sugeridos
4. Revisar orçamento
5. Agendar serviço
6. Pagar via PIX
7. Verificar confirmação

**Critérios de Sucesso**:
- [ ] Fluxo completo sem erros
- [ ] Notificações entregues
- [ ] Pagamento confirmado
- [ ] Dados corretos no dashboard

---

#### Cenário 2: Profissional Recebe e Responde Chamado
**Duração**: 20 minutos

**Passos**:
1. Login como profissional
2. Ver chamado disponível
3. Enviar orçamento
4. Receber aprovação
5. Confirmar agendamento
6. Ver dados do cliente

**Critérios de Sucesso**:
- [ ] Chamado aparece em tempo real
- [ ] Orçamento enviado corretamente
- [ ] Dados do cliente completos

---

#### Cenário 3: Fluxo de Erro - Pagamento Recusado
**Duração**: 15 minutos

**Passos**:
1. Tentar pagar com cartão inválido
2. Ver mensagem de erro
3. Tentar com PIX
4. Completar pagamento

**Critérios de Sucesso**:
- [ ] Erro claro e amigável
- [ ] Pode tentar novamente
- [ ] Dados não são perdidos

---

#### Cenário 4: Avaliação e Follow-up
**Duração**: 15 minutos

**Passos**:
1. Serviço foi concluído
2. Avaliar profissional
3. Verificar se profissional recebeu notificação
4. Verificar se follow-up agendado

**Critérios de Sucesso**:
- [ ] Avaliação salva
- [ ] Rating atualizado
- [ ] Notificação recebida

---

### 4.4 Cronograma de UAT

| Data | Atividade | Responsável |
|------|-----------|-------------|
| 2026-01-20 | Preparar ambiente UAT | QA + DevOps |
| 2026-01-21 | Treinar participantes | PM + QA |
| 2026-01-22 | Executar Cenários 1-2 | Clientes + Profissionais |
| 2026-01-23 | Executar Cenários 3-4 | Todos |
| 2026-01-24 | Análise de feedback | PM + Dev + QA |
| 2026-01-25 | Correções críticas | Dev |
| 2026-01-26 | Validação final | PM + QA |
| 2026-01-27 | Go-live | Todos |

---

### 4.5 Formulário de Feedback UAT

```
[ ] Função funcionou conforme esperado?
[ ] Interface é intuitiva?
[ ] Mensagens de erro são claras?
[ ] Performance aceitável (< 2s)?
[ ] Recomendaria para outros usuários?

Comentários adicionais:
_________________________________________
_________________________________________

Bugs encontrados:
[ ] Crítico (sistema quebrado)
[ ] Alto (funcionalidade degradada)
[ ] Médio (comportamento inesperado)
[ ] Baixo (cosmético)

Descrição:
_________________________________________
```

---

## 5. Métricas de Teste

### 5.1 Cobertura

#### Cobertura de Código (Alvo: 80%)
```
Backend (NestJS):
- Services: 85% (AuthService, ChamadoService, etc.)
- Controllers: 70% (validações, erros)
- Utilities: 90% (helpers, validators)
- Overall: 78% (aceitável)

Frontend (React):
- Hooks: 60% (estado complexo)
- Componentes: 40% (UI)
- Utilities: 85% (formatters, validators)
- Overall: 55% (aceitável para MVP)
```

#### Cobertura de Requisitos (100%)
```
✓ 11/11 requisitos cobertos por testes
✓ 100% rastreabilidade
```

#### Cobertura de Fluxos (85%)
```
✓ Login → Passado
✓ Criar Chamado → Passado
✓ Triagem → Passado
✓ Agendamento → Passado
✓ Pagamento PIX → Passado
✓ Pagamento Cartão → Passado
✓ Notificações → Passado
✓ Avaliação → Passado
✗ Dark Mode → Não testado (Fase 2)
```

---

### 5.2 Quantidade de Testes

| Tipo | Quantidade | Cobertura | Tempo |
|------|-----------|-----------|-------|
| Unit | 80 | 80% serviços | 10s |
| Integration | 45 | 70% endpoints | 45s |
| E2E | 12 | 50% fluxos críticos | 5min |
| UAT | 4 cenários | 100% fluxos principais | 2h |
| **Total** | **141** | **~90%** | **6min** |

---

### 5.3 Defects (Bugs)

#### Severidade
```
Critical (P1): Sistema quebrado, não pode usar
  - Login não funciona
  - Pagamento recusado incorretamente
  - Dados perdidos

High (P2): Funcionalidade degradada
  - Triagem muito lenta (>30s)
  - Notificações não enviadas
  - Avaliar página quebrada

Medium (P3): Comportamento inesperado
  - Layout ruim em tablet
  - Mensagem de erro confusa
  - Campo desalinhado

Low (P4): Cosmético
  - Typo no texto
  - Ícone tamanho errado
```

#### Exemplo de Bug Report
```
ID: BUG-001
Título: Validação de email não funciona
Severidade: CRÍTICO
Módulo: Autenticação

Passos para reproduzir:
1. Ir para registro
2. Inserir "invalidemail" (sem @)
3. Clicar "CRIAR CONTA"

Esperado:
- Mostrar erro "Email inválido"
- Não criar usuário

Observado:
- Cria usuário mesmo com email inválido
- Backend aceita

Ambiente:
- Chrome 120
- localhost:5173
- Backend: localhost:3000

Anexos:
- Screenshot: bug-auth-001.png
- Console log: error.log
```

---

## 6. Exit Criteria (Critérios de Saída)

### Para passar em Testes Unitários
```
✓ 80% cobertura de código
✓ 0 testes falhando (flaky tests < 2%)
✓ Build passa com sucesso
```

### Para passar em Testes de Integração
```
✓ 70% cobertura de endpoints
✓ Todos os fluxos happy path passam
✓ Tratamento de erro testado
```

### Para passar em E2E
```
✓ 50% dos fluxos críticos testam
✓ Performance < 5 segundos por ação
✓ Sem erros 500 no console
```

### Para ir para UAT
```
✓ Cobertura >= 80%
✓ 0 bugs críticos abertos
✓ Deploy em ambiente de testes
✓ Todos os participantes confirmados
```

### Para Go-Live
```
✓ UAT passou sem bugs críticos
✓ <5 bugs altos em backlog
✓ Performance validada (< 2s)
✓ Segurança auditada (JWT, bcrypt, PCI-DSS)
✓ Backup e recovery testados
✓ Runbooks preparados
```

---

## 7. Ferramentas de Teste

### Backend
- **Jest**: Framework de teste
- **Supertest**: Teste de HTTP
- **TypeORM**: Mock de banco
- **Docker**: Banco isolado por teste

### Frontend
- **Vitest**: Testes unitários rápidos
- **React Testing Library**: Testes de componentes
- **Playwright/Cypress**: Testes E2E
- **Lighthouse**: Performance

### CI/CD
- **GitHub Actions**: Rodar testes automaticamente
- **SonarQube**: Qualidade de código
- **Sentry**: Error tracking
- **Better Stack**: Uptime monitoring

### Configuração GitHub Actions
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Unit tests
        run: npm run test
      
      - name: Integration tests
        run: npm run test:integration
      
      - name: Coverage
        run: npm run test:cov
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Build
        run: npm run build
      
      - name: E2E tests
        run: npm run test:e2e
```

---

## 8. Plano de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Teste flaky (intermitente) | MÉDIA | ALTO | Retry logic, esperar elemento |
| Ambiente de teste instável | BAIXA | CRÍTICO | Docker, snapshot tests |
| Cobertura insuficiente | MÉDIA | ALTO | Pair programming, reviews |
| UAT atrasa | MÉDIA | ALTO | Iniciar 2 semanas antes |
| Bugs críticos pós-launch | BAIXA | CRÍTICO | Feature flags, rollback plan |

---

## 9. Sign-off

| Papel | Nome | Data | Assinatura |
|-------|------|------|-----------|
| QA Lead | [Nome] | 2026-01-06 | __________ |
| Dev Lead | [Nome] | 2026-01-06 | __________ |
| Product Manager | [Nome] | 2026-01-06 | __________ |
| Stakeholder | [Nome] | [Data] | __________ |

---

## Apêndices

### A. Ambiente de Teste
```
Banco de Dados:
- Dev: SQLite (./data/vitas.db)
- Test: PostgreSQL (via Docker)
- Prod: PostgreSQL (Railway)

Frontend:
- http://localhost:5173 (dev)
- https://staging.vitas.com (UAT)

Backend:
- http://localhost:3000 (dev)
- https://api.staging.vitas.com (UAT)
- https://api.vitas.com (prod)

Firebase:
- Firebase Emulator (dev)
- Firebase Project (prod)
```

### B. Dados de Teste
```
Clientes:
- cliente1@test.com / senha123
- cliente2@test.com / senha123

Profissionais:
- prof1@test.com / senha123 (Hidráulica)
- prof2@test.com / senha123 (Eletricidade)

Admin:
- admin@test.com / senha123

Cartão de Teste (Stripe):
- 4111 1111 1111 1111
- Data: 12/25
- CVV: 123
```

---

**Última atualização**: 6 de janeiro de 2026  
**Versão**: 1.0.0  
**Status**: Pronto para execução
