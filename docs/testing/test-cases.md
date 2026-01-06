# VITAS - Test Cases Executáveis

Casos de teste detalhados prontos para execução.

---

## 1. Test Cases - Módulo de Autenticação

### ✅ TC-AUTH-001: Registro de Novo Cliente

**ID**: TC-AUTH-001  
**Título**: Registro de Novo Cliente  
**Módulo**: Autenticação  
**Prioridade**: P0 (Crítica)  
**Tipo**: Funcional  

**Pré-condições**:
- Sistema operacional e acessível
- Email "newclient@test.com" não está registrado
- Navegador com suporte a JavaScript

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Abrir http://localhost:5173 | Página de login carrega |
| 2 | Clicar em "CRIAR CONTA" | Tela de registro abre |
| 3 | Preencher Nome: "João Silva" | Campo preenchido |
| 4 | Preencher Email: "newclient@test.com" | Campo preenchido |
| 5 | Preencher Senha: "senha123" | Campo preenchido (mascarado) |
| 6 | Confirmar Senha: "senha123" | Campo preenchido (mascarado) |
| 7 | Deixar "Sou Profissional" desmarcado | Checkbox desativado |
| 8 | Clicar "CRIAR CONTA" | Form é submetido |
| 9 | Aguardar redirecionamento (3s) | Redirecionado para Dashboard |
| 10 | Verificar localStorage | Token JWT presente |

**Resultado Esperado**:
```
✓ Usuário criado no banco de dados
✓ Email validado e salvo
✓ Senha criptografada com bcrypt
✓ Token JWT gerado e válido
✓ localStorage.token === JWT de 7 dias
✓ localStorage.user.role === "cliente"
✓ Redirecionado para /dashboard
✓ Email de confirmação enviado
```

**Dados Esperados no Banco**:
```sql
SELECT * FROM users 
WHERE email = 'newclient@test.com'

-- Esperado:
-- id: uuid
-- email: newclient@test.com
-- password: $2b$10$... (bcrypt hash)
-- nome: João Silva
-- role: cliente
-- created_at: 2026-01-06T10:30:00Z
-- email_confirmed: false (ou true se auto-confirm)
```

**Critério de Aceitação**:
- [ ] Conta criada com sucesso
- [ ] Senha hasheada (não em plain text)
- [ ] Token válido e decodificável
- [ ] Redirecionamento funciona
- [ ] Email de confirmação enviado

**Automação (Jest)**: `TC-AUTH-001-register.test.ts`

---

### ✅ TC-AUTH-002: Login com Credenciais Válidas

**ID**: TC-AUTH-002  
**Título**: Login com Credenciais Válidas  
**Módulo**: Autenticação  
**Prioridade**: P0 (Crítica)  

**Pré-condições**:
- Usuário "cliente@test.com" existe no banco
- Senha do usuário: "senha123"
- Usuário não está logado

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Abrir http://localhost:5173 | Página de login |
| 2 | Preencher Email: "cliente@test.com" | Campo preenchido |
| 3 | Preencher Senha: "senha123" | Campo preenchido |
| 4 | Clicar "ENTRAR" | Form enviado |
| 5 | Aguardar resposta (2s) | Status 200 recebido |
| 6 | Verificar redirecionamento | Redirecionado para /dashboard |
| 7 | Verificar localStorage | Token presente |
| 8 | Fazer requisição GET /api/auth/test com token | Status 200, usuário retornado |

**Resultado Esperado**:
```
✓ Token JWT recebido
✓ Token decodificável
✓ Token válido por 7 dias
✓ localStorage.token === JWT
✓ Redirecionado para /dashboard
✓ GET /api/auth/test retorna usuário
✓ localStorage.user contém: id, email, nome, role
```

**Critério de Aceitação**:
- [ ] Login bem-sucedido
- [ ] Token válido
- [ ] Permissões corretas no token
- [ ] Dashboard carrega
- [ ] Dados do usuário corretos

---

### ✅ TC-AUTH-003: Login com Senha Inválida

**ID**: TC-AUTH-003  
**Título**: Login com Senha Inválida  
**Módulo**: Autenticação  
**Prioridade**: P0 (Crítica)  

**Pré-condições**:
- Usuário "cliente@test.com" existe
- Senha correta é "senha123"
- Usuário não está logado

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Abrir página de login | Página carrega |
| 2 | Preencher Email: "cliente@test.com" | Campo preenchido |
| 3 | Preencher Senha: "senhaerrada" | Campo preenchido |
| 4 | Clicar "ENTRAR" | Form enviado |
| 5 | Aguardar resposta (2s) | Status 401 recebido |
| 6 | Verificar mensagem de erro | "Email ou senha inválidos" aparece |
| 7 | Verificar localStorage | localStorage.token === null |
| 8 | Verificar campo de senha | Está vazio |

**Resultado Esperado**:
```
✓ Status 401 Unauthorized retornado
✓ Mensagem: "Email ou senha inválidos"
✓ Mensagem é visível por 5 segundos
✓ Nenhum token gerado
✓ localStorage permanece vazio
✓ Campo de senha é limpo
✓ Usuário permanece na página de login
✓ Tentativas são registradas (log)
```

**Critério de Aceitação**:
- [ ] Rejeita credenciais inválidas
- [ ] Mensagem clara e amigável
- [ ] Campo sensível é limpo
- [ ] Log de tentativa registrado
- [ ] Sem token criado

---

### ✅ TC-AUTH-004: Registro de Profissional com Especialidades

**ID**: TC-AUTH-004  
**Título**: Registro de Profissional com Especialidades  
**Módulo**: Autenticação  
**Prioridade**: P1 (Alta)  

**Pré-condições**:
- Sistema acessível
- Email "prof@test.com" não registrado
- Documento válido disponível (imagem JPG/PNG)

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Abrir página de registro | Página carrega |
| 2 | Preencher dados básicos | Campos preenchidos |
| 3 | Marcar "Sou Profissional" | Checkbox marcado |
| 4 | Selecionar especialidades | Menu abre |
| 5 | Escolher "Hidráulica" e "Eletricidade" | Ambas selecionadas |
| 6 | Upload de documento (CPF/CNPJ) | Arquivo selecionado |
| 7 | Clicar "CRIAR CONTA" | Form enviado |
| 8 | Aguardar resultado | Status 201 e redirecionamento |

**Resultado Esperado no Banco**:
```sql
-- Usuário criado:
SELECT * FROM users WHERE email = 'prof@test.com'
-- id: uuid
-- role: profissional
-- status: awaiting_approval (para admin)

-- Especialidades vinculadas:
SELECT * FROM professional_specialties 
WHERE user_id = [profissional_id]
-- specialty_id: hidraulica
-- specialty_id: eletricidade

-- Documento armazenado:
SELECT * FROM professional_documents 
WHERE user_id = [profissional_id]
-- document_type: cpf
-- document_url: s3://vitas-bucket/documents/...
-- status: pending_verification
```

**Critério de Aceitação**:
- [ ] Perfil profissional criado
- [ ] Especialidades vinculadas corretamente
- [ ] Documento armazenado em S3
- [ ] Status = "awaiting_approval"
- [ ] Email de confirmação enviado

---

## 2. Test Cases - Módulo de Chamados

### ✅ TC-CHAMADO-001: Criar Chamado Completo

**ID**: TC-CHAMADO-001  
**Título**: Criar Chamado com Todos os Dados  
**Módulo**: Chamados  
**Prioridade**: P0 (Crítica)  

**Pré-condições**:
- Cliente autenticado com token válido
- Câmera/galeria funcionando
- Google Maps carregando
- Localização do GPS disponível

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Logado como cliente | Dashboard exibe |
| 2 | Clicar "Novo Chamado" (FAB) | Modal abre |
| 3 | Selecionar categoria: "Hidráulica" | Selecionado |
| 4 | Descrever problema: "Vazamento no chuveiro" | Texto inserido |
| 5 | Tirar 2 fotos | Fotos aparecem na preview |
| 6 | Confirmar localização | Map mostra pino de localização |
| 7 | Marcar urgência: "Urgente" | Selecionado |
| 8 | Orçamento máximo: "200" | Valor inserido |
| 9 | Clicar "SOLICITAR SERVIÇO" | Form enviado |
| 10 | Aguardar "Aguardando Triagem" | Tela de carregamento |
| 11 | Aguardar ~5s | Profissionais sugeridos aparecem |

**Resultado Esperado**:
```
✓ Chamado criado com status: "aguardando_triagem"
✓ Fotos armazenadas em S3
✓ Localização geolocalizada (lat/lng)
✓ Triagem executada (algoritmo rodou)
✓ Profissionais retornados e ordenados
✓ Tela transicionou: loading → resultado
✓ Cliente vê 3-5 profissionais sugeridos
✓ Notificações enviadas para profissionais match
```

**Dados no Banco**:
```sql
-- Chamado criado:
SELECT * FROM chamados WHERE id = [chamado_id]
-- status: aguardando_triagem
-- categoria: hidraulica
-- descricao: Vazamento no chuveiro
-- localizacao: {lat: X, lng: Y}
-- orcamento_maximo: 200.00
-- urgencia: urgente
-- cliente_id: [user_id]
-- foto_urls: ['s3://...', 's3://...']

-- Triagem executada:
SELECT * FROM triagens WHERE chamado_id = [chamado_id]
-- profissionais_score: [{id, score, rating, distancia}]
-- algoritmo_versao: v1.0
-- executado_em: 2026-01-06T...
```

**Critério de Aceitação**:
- [ ] Chamado criado
- [ ] Fotos armazenadas (S3)
- [ ] Triagem executada
- [ ] Profissionais retornados
- [ ] Notificações enviadas

---

### ✅ TC-CHAMADO-002: Validação de Campos Obrigatórios

**ID**: TC-CHAMADO-002  
**Título**: Validação de Campos Obrigatórios  
**Módulo**: Chamados  
**Prioridade**: P1 (Alta)  

**Pré-condições**:
- Cliente na tela de criar chamado
- Categoria não selecionada

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Tela "Novo Chamado" aberta | Modal exibe |
| 2 | Deixar categoria vazia | Nenhuma seleção |
| 3 | Preencher descrição | Texto inserido |
| 4 | Clicar "SOLICITAR SERVIÇO" | Validação ocorre |
| 5 | Verificar campo de categoria | Está destacado em vermelho |
| 6 | Verificar mensagem de erro | "Selecione uma categoria" aparece |
| 7 | Verificar requisição HTTP | Não foi enviada (POST bloqueado) |

**Resultado Esperado**:
```
✓ Validação client-side funciona
✓ Campo inválido destacado
✓ Mensagem de erro clara
✓ POST /chamados não é executado
✓ Usuário pode corrigir e reenviar
```

**Critério de Aceitação**:
- [ ] Validações funcionam
- [ ] Mensagens claras
- [ ] Dados inválidos bloqueados

---

### ✅ TC-CHAMADO-003: Listar Chamados do Usuário

**ID**: TC-CHAMADO-003  
**Título**: Listar Chamados do Usuário  
**Módulo**: Chamados  
**Prioridade**: P1 (Alta)  

**Pré-condições**:
- Cliente autenticado
- Tem 3+ chamados no histórico
- Estados variados (em progresso, concluído, cancelado)

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Logado como cliente | Dashboard exibe |
| 2 | Navegar para "Meus Chamados" | Aba ativa |
| 3 | Aguardar carregamento | Lista populada (2s) |
| 4 | Verificar ordem | Mais recentes no topo |
| 5 | Clicar em um chamado | Detalhes abrem |
| 6 | Verificar informações | Dados corretos |
| 7 | Voltar para lista | Abas mantêm estado |

**Resultado Esperado**:
```
✓ GET /api/chamados executado (com token)
✓ Lista retorna 3+ chamados
✓ Ordenado por data DESC
✓ Cada item mostra: status, data, profissional, valor
✓ Clique abre detalhes
✓ Performance: carrega em <2s
✓ Sem erros 500 no console
```

**Critério de Aceitação**:
- [ ] Lista carrega corretamente
- [ ] Dados corretos por chamado
- [ ] Performance aceitável
- [ ] Navegação funciona

---

## 3. Test Cases - Módulo de Triagem

### ✅ TC-TRIAGEM-001: Scoring Correto

**ID**: TC-TRIAGEM-001  
**Título**: Algoritmo de Scoring Calcula Corretamente  
**Módulo**: Triagem  
**Prioridade**: P0 (Crítica)  

**Pré-condições**:
- Chamado criado
- 5+ profissionais com especialidade
- Banco de dados preenchido com históricos

**Algoritmo Esperado**:
```
score = (urgencia * 0.3) + 
        (complexidade * 0.25) + 
        (historico * 0.2) + 
        (disponibilidade * 0.15) + 
        (sazonalidade * 0.1)

Resultado: 0-100
```

**Passos de Validação**:
| # | Teste | Esperado |
|---|-------|----------|
| 1 | Urgência = 0 (normal) | Peso reduzido em 30% |
| 2 | Score com todo profissional = 100 | Score = 100 |
| 3 | Score com nenhum histórico | Peso 0 em histórico (20%) |
| 4 | Ordenação final | Descendente por score |
| 5 | Rating como tie-breaker | Se score igual, maior rating vem primeiro |
| 6 | Distância como terceiro | Se score/rating igual, menor distância |

**Critério de Aceitação**:
- [ ] Score calculado corretamente
- [ ] Fórmula validada
- [ ] Ordenação apropriada
- [ ] Tie-breakers funcionam

---

### ✅ TC-TRIAGEM-002: Sem Profissionais Disponíveis

**ID**: TC-TRIAGEM-002  
**Título**: Mensagem Quando Nenhum Profissional Match  
**Módulo**: Triagem  
**Prioridade**: P2 (Média)  

**Pré-condições**:
- Orçamento máximo = R$ 50 (muito baixo)
- Distância máxima = 1 km
- Nenhum profissional próximo

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Criar chamado com essas restrições | Form enviado |
| 2 | Triagem executada | Algoritmo roda |
| 3 | Sem matches | 0 profissionais passam no filtro |
| 4 | Verificar tela | Mostra "Nenhum profissional..." |
| 5 | Verificar sugestões | "Aumente o orçamento" ou "Aumente raio" |
| 6 | Clicar em sugestão | Reagendar triagem com parâmetros ajustados |

**Resultado Esperado**:
```
✓ Triagem retorna lista vazia
✓ Mensagem amigável exibida
✓ Sugestões úteis oferecidas
✓ Botão "REAGENDAR TRIAGEM" funciona
✓ Novo cálculo com parâmetros ajustados
```

**Critério de Aceitação**:
- [ ] Mensagem clara
- [ ] Sugestões úteis
- [ ] Ação possível (reagendar)

---

## 4. Test Cases - Módulo de Pagamento

### ✅ TC-PAGTO-001: Gerar QR Code PIX

**ID**: TC-PAGTO-001  
**Título**: Gerar QR Code PIX  
**Módulo**: Pagamento  
**Prioridade**: P0 (Crítica)  

**Pré-condições**:
- Orçamento aprovado
- Agendamento confirmado
- Tela de pagamento acessível

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Na tela de pagamento | Métodos disponíveis |
| 2 | Selecionar "PIX" | Opção ativa |
| 3 | Clicar "GERAR QR CODE PIX" | API chamada |
| 4 | Aguardar geração (2s) | QR Code exibido |
| 5 | Verificar valor mostrado | "R$ 150,00" (correto) |
| 6 | Verificar botão "COPIAR PIX COPIA" | Botão visível |
| 7 | Verificar timer | Contagem regressiva (10 min) |
| 8 | Clicar copiar | Código copiado para clipboard |

**Resultado Esperado**:
```
✓ POST /api/pagamentos/pix-qrcode chamado
✓ QR Code válido (padrão EMV Código 05.9.1)
✓ Chave PIX (Copia e Cola) válida
✓ Valor correto
✓ Timer conta de 600 para 0 segundos
✓ Após timeout: "QR Code expirado, gerar novo"
✓ Status: "aguardando_confirmacao_pix"
```

**Dados no Banco**:
```sql
-- Transação criada:
SELECT * FROM transacoes 
WHERE pagamento_id = [pagamento_id]

-- id: uuid
-- tipo: pix
-- valor: 150.00
-- status: pending
-- qr_code: "00020126580014br.gov.bcb.pix..."
-- chave_pix: "5215847a-4ac6-4e5c-b8f5-..."
-- expira_em: 2026-01-06T11:10:00Z
```

**Critério de Aceitação**:
- [ ] QR Code válido
- [ ] Código PIX copiável
- [ ] Timer funciona
- [ ] Status correto no banco

---

### ✅ TC-PAGTO-002: Pagamento PIX Confirmado (Webhook)

**ID**: TC-PAGTO-002  
**Título**: Webhook PIX Confirma Pagamento  
**Módulo**: Pagamento  
**Prioridade**: P0 (Crítica)  

**Pré-condições**:
- QR Code gerado
- Cliente pagou via app bancário (simulado)
- Webhook do banco disponível

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Cliente escaneia QR e paga em app | Banco processa |
| 2 | Webhook chama POST /webhooks/pix-callback | Servidor recebe |
| 3 | Payload: status="CONCLUIDO", id="..." | Dados válidos |
| 4 | Backend atualiza transação | Status = "completed" |
| 5 | Cliente vê "✓ Pagamento Confirmado" | Tela de sucesso |
| 6 | Profissional recebe notificação | Push notification |
| 7 | Agendamento confirmado | Status = "confirmed" |

**Resultado Esperado**:
```
✓ Webhook processado com sucesso
✓ Status atualizado para "completed"
✓ Tela exibe sucesso com checkmark
✓ Notificação enviada via FCM
✓ Agendamento marcado como confirmado
✓ Cliente vê detalhes do serviço
✓ Profissional vê cliente confirmado
```

**Dados Esperados no Banco**:
```sql
UPDATE transacoes SET 
  status = 'completed',
  confirmado_em = NOW(),
  banco_transacao_id = 'xyz123'
WHERE id = [transacao_id]

UPDATE agendamentos SET 
  status = 'confirmed'
WHERE pagamento_id = [pagamento_id]
```

**Critério de Aceitação**:
- [ ] Webhook processado
- [ ] Status atualizado
- [ ] Notificações enviadas
- [ ] Transição de estado correta

---

### ✅ TC-PAGTO-003: Pagamento com Cartão

**ID**: TC-PAGTO-003  
**Título**: Pagamento com Cartão de Crédito  
**Módulo**: Pagamento  
**Prioridade**: P1 (Alta)  

**Pré-condições**:
- Tela de pagamento aberta
- Cartão de teste disponível

**Dados de Teste**:
```
Cartão: 4111 1111 1111 1111 (Visa teste)
Nome: JOAO SILVA
Validade: 12/25
CVV: 123
```

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Selecionar "Cartão de Crédito" | Opção ativa |
| 2 | Preencher número: "4111..." | Campo preenchido |
| 3 | Preencher nome: "JOAO SILVA" | Campo preenchido |
| 4 | Preencher data: "12/25" | Campo preenchido |
| 5 | Preencher CVV: "123" | Campo preenchido |
| 6 | Selecionar parcelamento: "1x" | 1 parcela selecionada |
| 7 | Clicar "CONFIRMAR PAGAMENTO" | Form enviado |
| 8 | Aguardar resposta gateway (3s) | "Cartão aprovado" ou recusado |

**Resultado Esperado (Aprovado)**:
```
✓ Gateway retorna aprovação
✓ Transação criada no banco
✓ Tela exibe "Pagamento Confirmado"
✓ Dados do cartão NÃO são armazenados
✓ Apenas token do gateway é salvo
✓ PCI-DSS compliant (tokenização)
```

**Resultado Esperado (Recusado)**:
```
✓ Gateway retorna erro
✓ Mensagem: "Cartão recusado - fundos insuficientes"
✓ Permitir tentar novo cartão
✓ Permitir trocar para PIX
✓ Transação registrada como "declined"
```

**Critério de Aceitação**:
- [ ] Integração com gateway (Stripe/PagSeguro)
- [ ] Cartão validado
- [ ] PCI-DSS compliant (sem armazenar dados sensíveis)
- [ ] Mensagens de erro úteis

---

### ✅ TC-PAGTO-004: Pagamento Recusado

**ID**: TC-PAGTO-004  
**Título**: Tratamento de Pagamento Recusado  
**Módulo**: Pagamento  
**Prioridade**: P1 (Alta)  

**Pré-condições**:
- Tela de pagamento aberta
- Cartão sem fundos ou expirado

**Cartão Teste**:
```
Número: 4000 0000 0000 0002 (Stripe: declined)
Validade: 12/25
CVV: 123
```

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Preencher dados de cartão | Campos preenchidos |
| 2 | Clicar "CONFIRMAR PAGAMENTO" | Requisição enviada |
| 3 | Aguardar resposta (3s) | Status 402 Payment Required |
| 4 | Verificar mensagem de erro | "Cartão recusado..." |
| 5 | Verificar botões de ação | "Tentar novamente", "Usar PIX" |
| 6 | Clicar "Usar PIX" | Transição para PIX |

**Resultado Esperado**:
```
✓ Erro processado corretamente
✓ Mensagem descritiva e amigável
✓ Nenhum pagamento parcial
✓ Transação marcada como "declined"
✓ Usuário pode tentar novamente
✓ Pode trocar de método
✓ Agendamento mantém status "pendente"
```

**Critério de Aceitação**:
- [ ] Erro é claro
- [ ] Opções disponíveis
- [ ] Dados não perdidos
- [ ] Sem débitos parciais

---

## 5. Test Cases - Módulo de Notificações

### ✅ TC-NOTIF-001: Enviar Notificação via FCM

**ID**: TC-NOTIF-001  
**Título**: Profissional Recebe Notificação de Novo Chamado  
**Módulo**: Notificações  
**Prioridade**: P1 (Alta)  

**Pré-condições**:
- App instalado em dispositivo real ou emulador
- Permissão de notificações concedida
- Profissional está online
- Profissional é match para chamado

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Cliente cria chamado | POST /chamados executado |
| 2 | Triagem identifica profissional | Score > 0 |
| 3 | Backend chama FCM | POST /notifications/send |
| 4 | Aguardar 3-5 segundos | Notificação recebida no device |
| 5 | Verificar conteúdo | Título e body corretos |
| 6 | Clicar notificação | App abre e mostra detalhes |

**Resultado Esperado**:
```
✓ FCM token salvo no banco
✓ Notificação enviada via Firebase Cloud Messaging
✓ Delivery confirmado (delivery receipt)
✓ Notificação recebida no device
✓ Título: "Novo chamado disponível!"
✓ Body: "Hidráulica - R$ 150,00 - 2,3 km"
✓ Data: {chamado_id, categoria, valor, distancia}
✓ Click abre: /chamado/[id]
```

**Log Esperado no Backend**:
```
[INFO] Notificação enviada para FCM
Token: d6rXeP7pTH0:APA91...
Título: Novo chamado disponível!
Body: Hidráulica - R$ 150,00 - 2,3 km
Resultado: SUCCESS
Message ID: 1234567890
```

**Critério de Aceitação**:
- [ ] FCM integrado
- [ ] Notificação entregue
- [ ] Deep link funciona
- [ ] Conteúdo correto

---

### ✅ TC-NOTIF-002: Notificação de Orçamento Aprovado

**ID**: TC-NOTIF-002  
**Título**: Profissional Notificado - Orçamento Aprovado  
**Módulo**: Notificações  
**Prioridade**: P1 (Alta)  

**Pré-condições**:
- Orçamento foi enviado
- Cliente logado
- App do profissional instalado

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Cliente na tela de orçamento | Detalhes vistos |
| 2 | Clicar "APROVAR & AGENDAR" | POST /orcamentos/[id]/approve |
| 3 | Aguardar processamento (1s) | Status atualizado |
| 4 | Backend envia notificação | POST /notifications/send |
| 5 | Aguardar 3-5s | Profissional recebe push |
| 6 | Verificar conteúdo | Nome do cliente e data |

**Resultado Esperado**:
```
✓ Notificação enviada quando status = "aprovado"
✓ Título: "Orçamento Aprovado!"
✓ Body: "João Silva aprovou seu orçamento"
✓ Data inclui: data agendada, valor, cliente_nome
✓ Profissional pode clicar para confirmar
```

**Critério de Aceitação**:
- [ ] Notificação em tempo real
- [ ] Informações corretas
- [ ] Deep link válido

---

## 6. Test Cases - Módulo de Avaliação

### ✅ TC-AVAL-001: Avaliar Serviço

**ID**: TC-AVAL-001  
**Título**: Cliente Avalia Profissional Após Serviço  
**Módulo**: Avaliação  
**Prioridade**: P2 (Média)  

**Pré-condições**:
- Serviço foi concluído
- Cliente confirmou conclusão
- Status = "completo"

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Tela de avaliação aberta | Form exibe |
| 2 | Clicar 5 estrelas | Rating = 5 |
| 3 | Escrever comentário | "Excelente trabalho!" |
| 4 | Marcar "Recomenda?" | Checkbox marcado |
| 5 | Clicar "ENVIAR AVALIAÇÃO" | POST /avaliacoes enviado |
| 6 | Aguardar resposta | "Obrigado!" exibido |

**Resultado Esperado**:
```
✓ Avaliação salva no banco
✓ Rating salvo (1-5 estrelas)
✓ Comentário persistido
✓ Recomendação registrada
✓ Rating médio do profissional recalculado
✓ Notificação enviada ao profissional
✓ Página de agradecimento
✓ Botão para novo serviço
```

**Dados no Banco**:
```sql
INSERT INTO avaliacoes (
  chamado_id,
  cliente_id,
  profissional_id,
  rating,
  comentario,
  recomenda,
  criado_em
) VALUES (
  [chamado_id],
  [cliente_id],
  [profissional_id],
  5,
  'Excelente trabalho!',
  true,
  NOW()
)

UPDATE profissionais SET 
  rating_medio = (
    SELECT AVG(rating) 
    FROM avaliacoes 
    WHERE profissional_id = [id]
  ),
  total_avaliacoes = (
    SELECT COUNT(*) 
    FROM avaliacoes 
    WHERE profissional_id = [id]
  )
WHERE id = [profissional_id]
```

**Critério de Aceitação**:
- [ ] Avaliação persistida
- [ ] Rating recalculado
- [ ] Notificação enviada

---

### ✅ TC-AVAL-002: Follow-up Automático D+7

**ID**: TC-AVAL-002  
**Título**: Email de Follow-up 7 Dias Após Serviço  
**Módulo**: Avaliação  
**Prioridade**: P2 (Média)  

**Pré-condições**:
- Serviço completado 7 dias atrás
- Cliente não avaliou
- Job agendado ativo

**Passos**:
| # | Ação | Esperado |
|---|------|----------|
| 1 | Sistema executa job (00:00 UTC) | Busca serviços para follow-up |
| 2 | Filtra serviços D+7 | 0+ serviços encontrados |
| 3 | Envia email para clientes | POST /emails/send |
| 4 | Cliente recebe email | Inbox recebe mensagem |
| 5 | Clicar link do email | Abre tela de avaliação pré-preenchida |

**Resultado Esperado**:
```
✓ Job agendado roda diariamente
✓ Email Subject: "Como foi o serviço com João?"
✓ Email body contém: nome do profissional, valor, data
✓ Link para avaliação válido (com token)
✓ Pre-preenchimento funciona (cliente_id, profissional_id)
✓ Follow-ups D+30 e D+90 agendados
```

**Email Template Esperado**:
```
Assunto: Como foi o serviço com João Silva?

Olá João!

Esperamos que tenha gostado do serviço realizado por João Silva em 
30 de dezembro de 2025.

Sua avaliação ajuda a comunidade a encontrar os melhores profissionais!

[BOTÃO: Avaliar Agora]

Se tiver dúvidas, nosso suporte está pronto para ajudar.

Abraços,
Equipe VITAS
```

**Critério de Aceitação**:
- [ ] Job agendado funciona
- [ ] Email enviado corretamente
- [ ] Link válido
- [ ] Pre-preenchimento funciona

---

## Summary: Test Case Execution Matrix

| TC-ID | Título | Status | Automatizado | Manual |
|-------|--------|--------|--------------|--------|
| TC-AUTH-001 | Registro Cliente | ✅ Ready | ✓ Jest | ✓ |
| TC-AUTH-002 | Login Válido | ✅ Ready | ✓ Supertest | ✓ |
| TC-AUTH-003 | Login Inválido | ✅ Ready | ✓ Jest | ✓ |
| TC-AUTH-004 | Registro Profissional | ✅ Ready | ✓ Supertest | ✓ |
| TC-CHAMADO-001 | Criar Chamado | ✅ Ready | ✓ E2E | ✓ |
| TC-CHAMADO-002 | Validação Campos | ✅ Ready | ✓ Jest | ✓ |
| TC-CHAMADO-003 | Listar Chamados | ✅ Ready | ✓ Supertest | ✓ |
| TC-TRIAGEM-001 | Scoring Correto | ✅ Ready | ✓ Jest | ✓ |
| TC-TRIAGEM-002 | Sem Profissionais | ✅ Ready | ✓ E2E | ✓ |
| TC-PAGTO-001 | Gerar QR PIX | ✅ Ready | ✓ E2E | ✓ |
| TC-PAGTO-002 | Webhook PIX | ✅ Ready | ✓ Jest | ✓ |
| TC-PAGTO-003 | Pagamento Cartão | ✅ Ready | ✓ E2E | ✓ |
| TC-PAGTO-004 | Pagamento Recusado | ✅ Ready | ✓ E2E | ✓ |
| TC-NOTIF-001 | FCM Novo Chamado | ✅ Ready | ✓ Manual | ✓ |
| TC-NOTIF-002 | FCM Aprovado | ✅ Ready | ✓ Manual | ✓ |
| TC-AVAL-001 | Avaliar Serviço | ✅ Ready | ✓ E2E | ✓ |
| TC-AVAL-002 | Follow-up D+7 | ✅ Ready | ✓ Jest | ✓ |

**Total**: 17 casos de teste documentados e prontos para execução.

---

**Última atualização**: 6 de janeiro de 2026  
**Versão**: 1.0.0  
**Status**: Pronto para execução
