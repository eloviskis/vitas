# User Stories - VITAS

## Visão Geral

Este documento mapeia todas as funcionalidades do VITAS através de User Stories organizadas por personas e epics. Cada story segue o formato:

**Como** [persona] **quero** [ação/funcionalidade] **para** [benefício/objetivo]

---

## Personas

### 👤 Cuidador
Profissional de saúde ou assistente social responsável pelo cuidado direto

### 👨‍👩‍👧 Familiar  
Membro da família envolvido no cuidado e acompanhamento

### 👨‍⚕️ Profissional de Saúde
Médico, enfermeiro, psicólogo ou outro especialista

### 🏢 Gestor
Coordenador de equipe ou administrador da organização

### 👴 Idoso/Assistido
Pessoa em situação de vulnerabilidade sendo assistida

---

## Epic 1: Autenticação e Perfil

### US-001: Cadastro de Usuário
**Como** usuário novo  
**Quero** me cadastrar no sistema com email e senha  
**Para** ter acesso às funcionalidades do VITAS

**Critérios de Aceitação:**
- [ ] Email único, validação de formato
- [ ] Senha mínima 8 caracteres, com requisitos de segurança
- [ ] Confirmação de email obrigatória
- [ ] Termos de uso e LGPD aceitos
- [ ] Escolha de tipo de perfil (Cuidador, Familiar, Profissional)

**Issue Técnica:** #3

---

### US-002: Login com Email/Senha
**Como** usuário cadastrado  
**Quero** fazer login com email e senha  
**Para** acessar minha conta e dados

**Critérios de Aceitação:**
- [ ] Validação de credenciais
- [ ] Token JWT gerado com expiração
- [ ] Opção "Lembrar-me" (refresh token)
- [ ] Bloqueio após 5 tentativas falhadas
- [ ] Mensagens de erro claras

**Issue Técnica:** #3

---

### US-003: Login com OAuth (Google/Apple)
**Como** usuário  
**Quero** fazer login com conta Google ou Apple  
**Para** ter acesso rápido sem criar nova senha

**Critérios de Aceitação:**
- [ ] OAuth 2.0 com Google
- [ ] Sign in with Apple (iOS)
- [ ] Criação automática de conta na primeira vez
- [ ] Vinculação de email
- [ ] Sincronização de dados de perfil

**Issue Técnica:** #3

---

### US-004: Recuperar Senha
**Como** usuário que esqueceu a senha  
**Quero** receber email para redefinir minha senha  
**Para** recuperar acesso à minha conta

**Critérios de Aceitação:**
- [ ] Link de redefinição enviado por email
- [ ] Token expira em 1 hora
- [ ] Validação de nova senha (requisitos)
- [ ] Confirmação por email após alteração
- [ ] Invalidação de sessões anteriores

**Issue Técnica:** #3

---

### US-005: Editar Perfil
**Como** usuário  
**Quero** editar meu perfil (nome, foto, telefone)  
**Para** manter meus dados atualizados

**Critérios de Aceitação:**
- [ ] Upload de foto de perfil
- [ ] Edição de nome completo
- [ ] Telefone com validação
- [ ] Bio/descrição opcional
- [ ] Notificação de alterações salvas

**Issue Técnica:** #3

---

## Epic 2: Gerenciamento de Grupos e Contextos

### US-006: Criar Grupo (Casa)
**Como** cuidador ou familiar  
**Quero** criar um grupo representando minha casa  
**Para** organizar os contextos e casos da residência

**Critérios de Aceitação:**
- [ ] Nome do grupo obrigatório
- [ ] Descrição opcional
- [ ] Endereço opcional
- [ ] Foto de capa opcional
- [ ] Criador é automaticamente admin

**Issue Técnica:** #8

---

### US-007: Convidar Membros para Grupo
**Como** administrador de grupo  
**Quero** convidar outros usuários por email  
**Para** incluí-los no gerenciamento da casa

**Critérios de Aceitação:**
- [ ] Convite enviado por email
- [ ] Link de aceitação com token
- [ ] Definir papel (admin, membro, visualizador)
- [ ] Notificação de convite aceito
- [ ] Expiração de convite em 7 dias

**Issue Técnica:** #8

---

### US-008: Gerenciar Permissões de Membros
**Como** administrador de grupo  
**Quero** alterar permissões de membros  
**Para** controlar quem pode editar ou visualizar dados

**Critérios de Aceitação:**
- [ ] Papéis: Admin, Editor, Visualizador
- [ ] Admin pode adicionar/remover membros
- [ ] Editor pode criar/editar contextos e casos
- [ ] Visualizador apenas leitura
- [ ] Log de alterações de permissões

**Issue Técnica:** #8

---

### US-009: Criar Contexto (Ex: Saúde, Financeiro)
**Como** membro de grupo  
**Quero** criar contextos específicos (Saúde, Financeiro, Jurídico)  
**Para** organizar diferentes aspectos do cuidado

**Critérios de Aceitação:**
- [ ] Nome e tipo de contexto
- [ ] Descrição opcional
- [ ] Cor/ícone para identificação visual
- [ ] Vinculado ao grupo
- [ ] Membros do grupo têm acesso automático

**Issue Técnica:** #9

---

### US-010: Arquivar/Desarquivar Contexto
**Como** membro de grupo  
**Quero** arquivar contextos inativos  
**Para** manter a interface limpa sem perder histórico

**Critérios de Aceitação:**
- [ ] Botão arquivar/desarquivar
- [ ] Contextos arquivados não aparecem na lista principal
- [ ] Filtro para ver arquivados
- [ ] Casos vinculados mantidos
- [ ] Notificação de arquivamento

**Issue Técnica:** #9

---

## Epic 3: Gerenciamento de Casos

### US-011: Criar Caso com Checklist
**Como** cuidador  
**Quero** criar um caso com checklist de tarefas  
**Para** gerenciar necessidades específicas (ex: comprar remédios)

**Critérios de Aceitação:**
- [ ] Título e descrição obrigatórios
- [ ] Tipo de caso: checklist, acompanhamento, urgente
- [ ] Adicionar itens ao checklist
- [ ] Marcar itens como concluídos
- [ ] Progresso visual (% completo)

**Issue Técnica:** #10

---

### US-012: Atribuir Caso a Membro
**Como** cuidador  
**Quero** atribuir um caso a um membro específico  
**Para** delegar responsabilidades

**Critérios de Aceitação:**
- [ ] Selecionar membro do grupo
- [ ] Membro recebe notificação
- [ ] Filtro de casos "atribuídos a mim"
- [ ] Histórico de atribuições
- [ ] Reatribuir caso

**Issue Técnica:** #10

---

### US-013: Definir Prioridade e Prazo
**Como** cuidador  
**Quero** definir prioridade e prazo para casos  
**Para** organizar tarefas por urgência

**Critérios de Aceitação:**
- [ ] Prioridade: Baixa, Média, Alta, Urgente
- [ ] Data de vencimento opcional
- [ ] Cores visuais por prioridade
- [ ] Notificação 1 dia antes do vencimento
- [ ] Ordenação por prazo

**Issue Técnica:** #10

---

### US-014: Adicionar Anexos ao Caso
**Como** cuidador  
**Quero** anexar documentos, fotos ou PDFs ao caso  
**Para** manter tudo relacionado em um só lugar

**Critérios de Aceitação:**
- [ ] Upload de imagens (JPG, PNG)
- [ ] Upload de documentos (PDF, DOC)
- [ ] Limite 10MB por arquivo
- [ ] Galeria de anexos
- [ ] Download de arquivos

**Issue Técnica:** #10, #5

---

### US-015: Criar Ordem de Serviço
**Como** cuidador  
**Quero** criar ordem de serviço para profissionais  
**Para** solicitar atendimento especializado (fisioterapia, consulta médica)

**Critérios de Aceitação:**
- [ ] Título e descrição
- [ ] Selecionar profissional
- [ ] Data/hora desejada
- [ ] Status: Pendente, Confirmada, Concluída, Cancelada
- [ ] Notificação ao profissional

**Issue Técnica:** #11

---

### US-016: Confirmar ou Recusar Ordem de Serviço
**Como** profissional de saúde  
**Quero** confirmar ou recusar ordens de serviço  
**Para** gerenciar minha agenda

**Critérios de Aceitação:**
- [ ] Botão confirmar/recusar
- [ ] Campo de observações
- [ ] Notificação ao solicitante
- [ ] Sugerir nova data se recusar
- [ ] Histórico de confirmações

**Issue Técnica:** #11

---

### US-017: Registrar Follow-up
**Como** cuidador ou profissional  
**Quero** registrar follow-ups em casos  
**Para** documentar evolução e observações

**Critérios de Aceitação:**
- [ ] Data/hora automática
- [ ] Texto livre para observações
- [ ] Anexar fotos/documentos
- [ ] Timeline de follow-ups
- [ ] Notificar membros do grupo

**Issue Técnica:** #12

---

### US-018: Filtrar e Buscar Casos
**Como** usuário  
**Quero** filtrar casos por status, prioridade, responsável  
**Para** encontrar rapidamente o que preciso

**Critérios de Aceitação:**
- [ ] Filtro por status (Aberto, Em andamento, Concluído)
- [ ] Filtro por prioridade
- [ ] Filtro por responsável
- [ ] Busca por texto (título/descrição)
- [ ] Salvar filtros favoritos

**Issue Técnica:** #10

---

### US-019: Marcar Caso como Concluído
**Como** cuidador  
**Quero** marcar caso como concluído  
**Para** indicar que a tarefa foi finalizada

**Critérios de Aceitação:**
- [ ] Botão "Marcar como concluído"
- [ ] Data de conclusão registrada
- [ ] Notificação para membros
- [ ] Reabrir caso se necessário
- [ ] Filtro de casos concluídos

**Issue Técnica:** #10

---

## Epic 4: Comunicação e Notificações

### US-020: Receber Notificações Push
**Como** usuário  
**Quero** receber notificações push no celular  
**Para** ser alertado sobre atualizações importantes

**Critérios de Aceitação:**
- [ ] Notificação de novo caso atribuído
- [ ] Notificação de prazo próximo
- [ ] Notificação de follow-up adicionado
- [ ] Notificação de ordem de serviço
- [ ] Configurar preferências de notificações

**Issue Técnica:** #6

---

### US-021: Comentar em Casos
**Como** membro de grupo  
**Quero** comentar em casos  
**Para** comunicar com a equipe sobre o andamento

**Critérios de Aceitação:**
- [ ] Campo de comentário em cada caso
- [ ] Mencionar @usuário
- [ ] Notificação para mencionados
- [ ] Editar/deletar próprio comentário
- [ ] Timeline de comentários

**Issue Técnica:** #12

---

### US-022: Configurar Notificações
**Como** usuário  
**Quero** configurar quais notificações receber  
**Para** não ser incomodado desnecessariamente

**Critérios de Aceitação:**
- [ ] Ativar/desativar por tipo
- [ ] Horário de silêncio
- [ ] Email vs Push
- [ ] Resumo diário opcional
- [ ] Notificações de grupo específico

**Issue Técnica:** #6

---

## Epic 5: Profissionais e Serviços

### US-023: Cadastrar como Profissional
**Como** profissional de saúde  
**Quero** me cadastrar com credenciais profissionais  
**Para** oferecer serviços através do VITAS

**Critérios de Aceitação:**
- [ ] Registro profissional (CRM, COREN, etc)
- [ ] Especialidade(s)
- [ ] Área de atuação geográfica
- [ ] Disponibilidade (dias/horários)
- [ ] Verificação de credenciais

**Issue Técnica:** #13

---

### US-024: Buscar Profissionais
**Como** cuidador  
**Quero** buscar profissionais por especialidade e localização  
**Para** encontrar atendimento adequado

**Critérios de Aceitação:**
- [ ] Filtro por especialidade
- [ ] Filtro por distância
- [ ] Filtro por disponibilidade
- [ ] Avaliações e comentários
- [ ] Perfil detalhado do profissional

**Issue Técnica:** #13

---

### US-025: Avaliar Profissional
**Como** usuário que recebeu atendimento  
**Quero** avaliar o profissional  
**Para** ajudar outros usuários na escolha

**Critérios de Aceitação:**
- [ ] Nota de 1 a 5 estrelas
- [ ] Comentário opcional
- [ ] Apenas quem foi atendido pode avaliar
- [ ] Editar avaliação por 7 dias
- [ ] Média de avaliações no perfil

**Issue Técnica:** #13

---

### US-026: Gerenciar Agenda de Atendimentos
**Como** profissional  
**Quero** visualizar minha agenda de atendimentos  
**Para** gerenciar meus compromissos

**Critérios de Aceitação:**
- [ ] Calendário mensal/semanal/diário
- [ ] Ordens de serviço confirmadas
- [ ] Marcar indisponibilidade
- [ ] Exportar para Google Calendar
- [ ] Notificações de próximos atendimentos

**Issue Técnica:** #11

---

## Epic 6: Idosos e Monitoramento (Fase 3)

### US-027: Cadastrar Idoso/Assistido
**Como** cuidador  
**Quero** cadastrar dados do idoso  
**Para** centralizar informações de saúde e cuidado

**Critérios de Aceitação:**
- [ ] Dados pessoais (nome, data nascimento, CPF)
- [ ] Condições de saúde
- [ ] Medicamentos em uso
- [ ] Alergias
- [ ] Contatos de emergência

**Issue Técnica:** #14

---

### US-028: Registrar Medicação
**Como** cuidador  
**Quero** registrar medicamentos e horários  
**Para** garantir administração correta

**Critérios de Aceitação:**
- [ ] Nome do medicamento
- [ ] Dosagem e frequência
- [ ] Horários de administração
- [ ] Lembretes automáticos
- [ ] Histórico de administrações

**Issue Técnica:** #15

---

### US-029: Monitorar Sinais Vitais
**Como** cuidador  
**Quero** registrar sinais vitais (pressão, glicemia)  
**Para** acompanhar evolução de saúde

**Critérios de Aceitação:**
- [ ] Pressão arterial
- [ ] Glicemia
- [ ] Temperatura
- [ ] Peso
- [ ] Gráficos de evolução

**Issue Técnica:** #16

---

### US-030: Alertas de Emergência
**Como** cuidador  
**Quero** receber alertas quando valores estiverem fora do normal  
**Para** agir rapidamente em emergências

**Critérios de Aceitação:**
- [ ] Configurar faixas normais
- [ ] Alerta automático se fora da faixa
- [ ] Notificação push urgente
- [ ] Sugerir ação (ligar 192, médico)
- [ ] Histórico de alertas

**Issue Técnica:** #16

---

## Epic 7: Vida Digital (Fase 2)

### US-031: Digitalizar Documentos
**Como** familiar  
**Quero** digitalizar documentos importantes  
**Para** ter backup digital seguro

**Critérios de Aceitação:**
- [ ] Escanear via câmera
- [ ] OCR para texto
- [ ] Categorização (RG, CPF, escrituras, etc)
- [ ] Pastas organizadas
- [ ] Compartilhar com membros do grupo

**Issue Técnica:** #17

---

### US-032: Armazenar Senhas com Segurança
**Como** familiar  
**Quero** armazenar senhas de forma segura  
**Para** não perder acesso a serviços importantes

**Critérios de Aceitação:**
- [ ] Criptografia forte
- [ ] Senha mestra
- [ ] Categorias (banco, email, etc)
- [ ] Compartilhamento seguro
- [ ] Gerador de senhas

**Issue Técnica:** #18

---

### US-033: Registrar Instruções Finais
**Como** pessoa planejando herança  
**Quero** registrar desejos e instruções  
**Para** facilitar para família no futuro

**Critérios de Aceitação:**
- [ ] Testamento digital
- [ ] Contatos importantes
- [ ] Instruções de funeral
- [ ] Distribuição de bens
- [ ] Acesso controlado por tempo/evento

**Issue Técnica:** #19

---

## Epic 8: Pagamentos (Fase 3)

### US-034: Processar Pagamento de Serviço
**Como** usuário  
**Quero** pagar profissionais pelo app  
**Para** facilitar transações

**Critérios de Aceitação:**
- [ ] Integração com Stripe/PagSeguro
- [ ] Cartão de crédito/débito
- [ ] PIX
- [ ] Histórico de pagamentos
- [ ] Recibo digital

**Issue Técnica:** #20

---

### US-035: Receber Pagamentos
**Como** profissional  
**Quero** receber pagamentos via app  
**Para** simplificar cobrança

**Critérios de Aceitação:**
- [ ] Configurar conta bancária
- [ ] Definir preços de serviços
- [ ] Emitir recibo
- [ ] Transferência automática
- [ ] Relatório de recebimentos

**Issue Técnica:** #20

---

## Epic 9: Mobile e Offline

### US-036: Usar App Offline
**Como** usuário em área sem internet  
**Quero** usar funcionalidades básicas offline  
**Para** não depender de conexão

**Critérios de Aceitação:**
- [ ] Visualizar casos salvos
- [ ] Adicionar follow-ups offline
- [ ] Marcar checklist offline
- [ ] Sincronização automática quando online
- [ ] Indicador visual de status offline

**Issue Técnica:** #4

---

### US-037: Instalar como PWA
**Como** usuário  
**Quero** instalar o app na tela inicial  
**Para** acessar rapidamente como app nativo

**Critérios de Aceitação:**
- [ ] Manifest.json configurado
- [ ] Service Worker para cache
- [ ] Ícone na tela inicial
- [ ] Splash screen
- [ ] Funciona sem navegador visível

**Issue Técnica:** #4

---

### US-038: Sincronizar em Tempo Real
**Como** membro de grupo  
**Quero** ver atualizações em tempo real  
**Para** sempre ter dados atualizados

**Critérios de Aceitação:**
- [ ] WebSocket ou Server-Sent Events
- [ ] Atualização automática de lista de casos
- [ ] Indicador "usuário está digitando"
- [ ] Conflitos de edição detectados
- [ ] Reconexão automática

**Issue Técnica:** #21

---

## Epic 10: Administração e Analytics

### US-039: Dashboard de Métricas
**Como** gestor  
**Quero** visualizar métricas do sistema  
**Para** acompanhar uso e performance

**Critérios de Aceitação:**
- [ ] Total de usuários ativos
- [ ] Casos criados/concluídos
- [ ] Tempo médio de conclusão
- [ ] Ordens de serviço por status
- [ ] Gráficos de tendência

**Issue Técnica:** #22

---

### US-040: Exportar Relatórios
**Como** gestor  
**Quero** exportar relatórios em Excel/PDF  
**Para** análise externa

**Critérios de Aceitação:**
- [ ] Filtro por período
- [ ] Filtro por grupo/contexto
- [ ] Formato Excel (.xlsx)
- [ ] Formato PDF
- [ ] Agendamento de relatórios

**Issue Técnica:** #22

---

### US-041: Auditoria de Ações
**Como** gestor  
**Quero** visualizar log de auditoria  
**Para** rastrear alterações e responsabilidades

**Critérios de Aceitação:**
- [ ] Registro de todas ações (CRUD)
- [ ] Usuário, data/hora, ação
- [ ] Valores antes/depois
- [ ] Filtro por usuário/data
- [ ] Exportar logs

**Issue Técnica:** #23

---

## Epic 11: Segurança e LGPD

### US-042: Exportar Meus Dados (LGPD)
**Como** usuário  
**Quero** exportar todos meus dados  
**Para** exercer direito de portabilidade (LGPD)

**Critérios de Aceitação:**
- [ ] Arquivo JSON com todos dados
- [ ] Incluir anexos (zip)
- [ ] Download seguro
- [ ] Confirmação de identidade
- [ ] Log de exportações

**Issue Técnica:** #24

---

### US-043: Deletar Minha Conta
**Como** usuário  
**Quero** deletar permanentemente minha conta  
**Para** exercer direito de esquecimento (LGPD)

**Critérios de Aceitação:**
- [ ] Confirmação dupla
- [ ] Aviso sobre dados compartilhados
- [ ] Período de 30 dias para arrependimento
- [ ] Remoção completa de dados pessoais
- [ ] Email de confirmação

**Issue Técnica:** #24

---

### US-044: Autenticação de Dois Fatores
**Como** usuário  
**Quero** ativar 2FA  
**Para** aumentar segurança da minha conta

**Critérios de Aceitação:**
- [ ] TOTP via app (Google Authenticator)
- [ ] Códigos de backup
- [ ] SMS como alternativa
- [ ] Obrigatório para admins
- [ ] Recuperação de conta

**Issue Técnica:** #3

---

## Epic 12: Onboarding e Ajuda

### US-045: Tutorial Inicial
**Como** novo usuário  
**Quero** ver tutorial interativo  
**Para** entender como usar o app

**Critérios de Aceitação:**
- [ ] Tour guiado das principais telas
- [ ] Dicas contextuais
- [ ] Vídeos explicativos opcionais
- [ ] Pular ou rever tutorial
- [ ] Checklist de primeiros passos

**Issue Técnica:** #25

---

### US-046: Centro de Ajuda
**Como** usuário  
**Quero** acessar FAQ e documentação  
**Para** resolver dúvidas sozinho

**Critérios de Aceitação:**
- [ ] Busca por palavra-chave
- [ ] Categorias organizadas
- [ ] Artigos ilustrados
- [ ] Vídeos tutoriais
- [ ] "Isso foi útil?" para feedback

**Issue Técnica:** #25

---

### US-047: Suporte via Chat
**Como** usuário com dúvida  
**Quero** falar com suporte via chat  
**Para** obter ajuda personalizada

**Critérios de Aceitação:**
- [ ] Widget de chat na interface
- [ ] Horário de atendimento exibido
- [ ] Histórico de conversas
- [ ] Anexar screenshots
- [ ] Ticket criado automaticamente

**Issue Técnica:** #26

---

## Mapeamento Issues Técnicas → User Stories

| Issue | User Stories Relacionadas |
|-------|---------------------------|
| #3 - Autenticação | US-001, US-002, US-003, US-004, US-005, US-044 |
| #4 - Layout Frontend | US-036, US-037 |
| #5 - Storage | US-014, US-031 |
| #6 - Notificações | US-020, US-022 |
| #7 - Modelo Database | Todas (infraestrutura) |
| #8 - Grupos | US-006, US-007, US-008 |
| #9 - Contextos | US-009, US-010 |
| #10 - Casos | US-011, US-012, US-013, US-014, US-018, US-019 |
| #11 - Ordens Serviço | US-015, US-016, US-026 |
| #12 - Follow-ups | US-017, US-021 |
| #13 - Profissionais | US-023, US-024, US-025 |
| #14 - Idosos | US-027 |
| #15 - Medicação | US-028 |
| #16 - Sinais Vitais | US-029, US-030 |
| #17 - Documentos | US-031 |
| #18 - Senhas | US-032 |
| #19 - Testamento | US-033 |
| #20 - Pagamentos | US-034, US-035 |
| #21 - Sync Real-time | US-038 |
| #22 - Analytics | US-039, US-040 |
| #23 - Auditoria | US-041 |
| #24 - LGPD | US-042, US-043 |
| #25 - Onboarding | US-045, US-046 |
| #26 - Suporte | US-047 |

---

## Priorização (MoSCoW)

### Must Have (MVP - Fase 0 e 1)
- US-001 a US-005 (Autenticação)
- US-006 a US-010 (Grupos e Contextos)
- US-011 a US-019 (Casos básicos)
- US-020 a US-022 (Notificações)
- US-036, US-037 (Mobile/PWA)

### Should Have (Fase 1-2)
- US-015, US-016 (Ordens de Serviço)
- US-017 (Follow-ups)
- US-023 a US-026 (Profissionais)
- US-031 (Documentos digitais)
- US-038 (Sync real-time)
- US-045, US-046 (Onboarding)

### Could Have (Fase 2-3)
- US-027 a US-030 (Monitoramento idosos)
- US-032, US-033 (Senhas e testamento)
- US-039 a US-041 (Analytics e auditoria)
- US-044 (2FA)
- US-047 (Suporte chat)

### Won't Have (Fase 3+)
- US-034, US-035 (Pagamentos - depende de regulação)

---

## Métricas de Sucesso

Para cada User Story, mediremos:

- **Adoção**: % de usuários que usam a funcionalidade
- **Satisfação**: Net Promoter Score (NPS) específico
- **Engajamento**: Frequência de uso
- **Performance**: Tempo de carregamento, taxa de erro
- **Conversão**: % de usuários que completam o fluxo

---

## Changelog

| Data | Versão | Mudanças |
|------|--------|----------|
| 2026-01-01 | 1.0 | Documento inicial com 47 user stories organizadas em 12 epics |

