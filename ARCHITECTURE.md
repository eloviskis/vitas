# VITAS Backend Architecture Diagram

## API Endpoints Map

```
                        VITAS API (http://localhost:3000/api)
                                      |
                ______________________|_____________________________
               |                      |                            |
            CHAMADO                TRIAGEM                    AGENDAMENTO
        (Feature 013)            (Feature 006)              (Feature 007)
               |                      |                            |
    ┌──────────┴─────────┐  ┌────────┴────────┐    ┌──────────────┴──────────────┐
    |                    |  |                 |    |                             |
  POST /chamados      GET /chamados/:id     PROF  POST /chamados/:id/agendamentos
  GET /chamados       /triagem              ESSIONAL GET /chamados/:id/agendamentos
  PUT /chamados/:id       |               /slots  PUT .../confirmar
  GET /historico      GET /chamados/:id    |      PUT .../cancelar
  POST /historico     /triagem             |      PUT .../iniciar
                      PUT /triagem/:id     |      PUT .../concluir
                      /recomendacao        |
                                    POST /profissionais/:id/slots
                                    GET /profissionais/:id/slots

         CHAMADO                   PROFISSIONAL             TRIAGEM
         (Issue)                (Service Provider)       (Recommendation)
           |                           |                      |
       OneToMany                   OneToMany               ManyToOne
           ↓                           ↓                      ↓
       HISTORICO              TRIAGEM PENDENTES           CHAMADO
       (Timeline)             SLOTS                       PROFISSIONAL
                              AGENDAMENTOS
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────┐
│                      app.module.ts                          │
│  (TypeOrmModule + 4 Feature Modules)                       │
└─────────────────────────────────────────────────────────────┘
              |          |          |          |
         CHAMADO    PROFISSIONAL   TRIAGEM   AGENDAMENTO
         MODULE     MODULE         MODULE     MODULE
              |          |          |          |
    ┌─────────┴──┐   ┌───┴────┐   ┌┴─────┐  ┌┴────────┐
    │             │   │        │   │      │  │         │
   ╔═════════════╗  ╔════════╗  ╔════╗  ╔═════════╗
   ║  Chamado    ║  ║Profiss║  ║Triag║  ║ Slot    ║
   ║  Entidade   ║  ║ional  ║  ║em   ║  ║Entidade ║
   ╚═════════════╝  ║Entity ║  ║ent. ║  ╚═════════╝
                    ║       ║  ║     ║
   ╔═════════════╗  ╚════════╝  ╚════╝
   ║ChamadoHist  ║
   ║orico Ent.   ║   ╔════════╗
   ╚═════════════╝   ║Agendamentos║
        │            ║Entidade    ║
   HistoricoService  ╚════════╝
   (EXPORTED)         │
        │             └──────────┬────────────┐
        │                        │            │
        │                   SlotService    AgendamentoService
        │                   (CRUD)         (CRUD + HistoricoService injection)
        │
    INJECTED BY:
    ├─ TriagemService
    └─ AgendamentoService
```

## Data Flow - Complete User Journey

```
STEP 1: CREATE ISSUE
┌─────────────────────────────────────┐
│ POST /chamados                      │
│ {titulo, descricao, contexto}       │
└────────────┬────────────────────────┘
             │
             ↓
    ╔═════════════════════╗
    ║ ChamadoService      ║
    ║ - Validate input    ║
    ║ - Create Chamado    ║
    ║ - Inject Historico  ║
    ╚────────┬────────────╝
             │
             ↓
    ╔═════════════════════════════════╗
    ║ HistoricoService.registrarStatus║
    ║ {tipo: SISTEMA, desc: "created"}║
    ╚────────┬────────────────────────╝
             │
             ↓
    STORED: Chamado (status=ABERTO)
            ChamadoHistorico (SISTEMA event)


STEP 2: AUTOMATIC TRIAGE
┌─────────────────────────────────────────┐
│ POST /chamados/:id/triagem              │
│ {tipo: AUTOMATICA, criterios: {...}}    │
└────────┬────────────────────────────────┘
         │
         ↓
    ╔════════════════════════════╗
    ║ TriagemService             ║
    ║ - Validate Chamado exists  ║
    ║ - Inject ProfissionalSvc   ║
    ║ - Inject HistoricoService  ║
    ╚────────┬───────────────────╝
             │
             ↓
    ╔════════════════════════════════════╗
    ║ ProfissionalService                ║
    ║ - listarAtivos(contexto)           ║
    ║ - Sort by score DESC               ║
    ║ - Return top 3                     ║
    ╚────────┬─────────────────────────┘
             │
             ↓
    ╔════════════════════════════════════╗
    ║ TriagemService (continued)         ║
    ║ - Create Triagem                   ║
    ║ - Set resultado=RECOMENDADO        ║
    ║ - Set confiança=90/75/100          ║
    ╚────────┬─────────────────────────┘
             │
             ↓
    ╔════════════════════════════════════╗
    ║ HistoricoService.registrarTriagem  ║
    ║ {tipo: TRIAGEM, profissional_id}   ║
    ╚────────┬─────────────────────────┘
             │
             ↓
    STORED: Triagem (resultado=RECOMENDADO)
            ChamadoHistorico (TRIAGEM event with metadata)


STEP 3: CREATE APPOINTMENT
┌─────────────────────────────────────────────────────┐
│ POST /chamados/:id/agendamentos                     │
│ {profissionalId, slotId, dataHora}                  │
└────────┬────────────────────────────────────────────┘
         │
         ↓
    ╔════════════════════════════════════╗
    ║ AgendamentoService.agendar         ║
    ║ - Validate Chamado exists          ║
    ║ - Create Agendamento (PENDENTE)    ║
    ║ - Inject SlotService               ║
    ║ - Inject HistoricoService          ║
    ╚────────┬──────────────────────────╝
             │
             ↓
    ╔════════════════════════════════════╗
    ║ SlotService.marcarComoOcupado      ║
    ║ - Check slot.disponivel=true       ║
    ║ - Set disponivel=false             ║
    ║ - Set agendamentoId=ref            ║
    ╚────────┬──────────────────────────╝
             │
             ├─ SUCCESS: Continue
             │   ↓
             │   ╔═══════════════════════════════╗
             │   ║ HistoricoService.registrarA...║
    ║ {tipo: AGENDAMENTO, agendamento_id}
             │   ╚─────────┬─────────────────────╝
             │             │
             │             ↓
             │   STORED: Agendamento (PENDENTE)
             │           ChamadoHistorico (AGENDAMENTO event)
             │
             └─ FAIL: Rollback
                 ↓
    Agendamento deleted, slot unchanged, error returned


STEP 4: CONFIRM APPOINTMENT
┌──────────────────────────────────────────┐
│ PUT /chamados/:id/agendamentos/:id/conf. │
└────────┬─────────────────────────────────┘
         │
         ↓
    ╔════════════════════════════════════╗
    ║ AgendamentoService.confirmar       ║
    ║ - Validate status=PENDENTE         ║
    ║ - Set status=CONFIRMADO            ║
    ║ - Set confirmadoEm=now()           ║
    ║ - Inject HistoricoService          ║
    ╚────────┬──────────────────────────╝
             │
             ↓
    ╔════════════════════════════════════╗
    ║ HistoricoService.registrarAgendamento
    ║ {tipo: AGENDAMENTO, desc: "Confirmado"}
    ╚────────┬──────────────────────────╝
             │
             ↓
    STORED: Agendamento (CONFIRMADO)
            ChamadoHistorico (AGENDAMENTO event)


STEP 5: SERVICE EXECUTION
┌──────────────────────────────────────────┐
│ PUT /chamados/:id/agendamentos/:id/iniciar
└────────┬─────────────────────────────────┘
         │
         ├─ EM_ATENDIMENTO (inicioAtendimento=now())
         │
         ↓
    (Service happens...)
         │
         ↓
┌──────────────────────────────────────────┐
│ PUT /chamados/:id/agendamentos/:id/concluir
└────────┬─────────────────────────────────┘
         │
         ↓
    ╔════════════════════════════════════╗
    ║ AgendamentoService.concluirAtendimento
    ║ - Set status=CONCLUIDO             ║
    ║ - Set fimAtendimento=now()         ║
    ║ - Update Chamado.status=CONCLUIDO  ║
    ║ - Inject HistoricoService          ║
    ╚────────┬──────────────────────────╝
             │
             ↓
    ╔════════════════════════════════════╗
    ║ HistoricoService.registrarAgendamento
    ║ {tipo: AGENDAMENTO, desc: "Concluído"}
    ╚────────┬──────────────────────────╝
             │
             ↓
    STORED: Agendamento (CONCLUIDO)
            ChamadoHistorico (AGENDAMENTO event)


STEP 6: VIEW COMPLETE HISTORY
┌─────────────────────────────────┐
│ GET /chamados/:id/historico     │
└────────┬────────────────────────┘
         │
         ↓
    ╔════════════════════════════════════╗
    ║ HistoricoService.listarPorChamado  ║
    ║ - Query all ChamadoHistorico       ║
    ║ - Order by criadoEm DESC           ║
    ║ - Include metadata for each event  ║
    ╚────────┬──────────────────────────╝
             │
             ↓
    RETURNS: [
      {tipo: SISTEMA, desc: "Chamado criado", criadoEm: T0},
      {tipo: TRIAGEM, desc: "...", profissional_id: X, confiança: 90},
      {tipo: AGENDAMENTO, desc: "Criado", agendamento_id: Y},
      {tipo: AGENDAMENTO, desc: "Confirmado", confirmadoEm: T1},
      {tipo: AGENDAMENTO, desc: "Concluído", duracao: 60}
    ]
```

## Database Schema (TypeORM Entities)

```
┌─────────────────────┐
│     CHAMADOS        │
├─────────────────────┤
│ id (UUID) PK        │
│ titulo              │
│ descricao           │
│ contexto            │
│ prioridade          │
│ status ⭐           │
│ usuarioId           │
│ criadoEm            │
│ atualizadoEm        │
└──────────┬──────────┘
           │1
           │
          1:N
           │
           ↓N
┌──────────────────────────┐
│ CHAMADO_HISTORICOS       │
├──────────────────────────┤
│ id (UUID) PK             │
│ chamado_id (FK) ⭐       │
│ tipo ⭐                  │
│   - SISTEMA              │
│   - STATUS               │
│   - TRIAGEM              │
│   - AGENDAMENTO          │
│   - NOTA                 │
│ descricao                │
│ metadata (JSONB)         │
│ criadoEm ⭐              │
└──────────────────────────┘


┌─────────────────────┐         ┌──────────────────────┐
│  PROFISSIONAIS      │         │     TRIAGENS         │
├─────────────────────┤         ├──────────────────────┤
│ id (UUID) PK        │         │ id (UUID) PK         │
│ nome                │         │ chamado_id (FK) ⭐  │
│ email ⭐            │         │ tipo ⭐              │
│ telefone            │         │   - AUTOMATICA       │
│ contextos[] ⭐      │         │   - ASSISTIDA        │
│ categorias[] ⭐     │         │   - MANUAL           │
│ status              │         │ resultado ⭐         │
│ score (0-5) ⭐      │         │   - RECOMENDADO      │
│ totalServiços       │         │   - MULTIPLAS_OPCOES │
│ serviçosConcluídos  │         │   - SEM_PROFISSIONAL │
│ taxaSatisfação      │         │ profissional_id (FK) │
│ criadoEm            │         │ opcoesProfissionais  │
└──────────┬──────────┘         │ confiança (0-100) ⭐│
           │                     │ critérios (JSONB)    │
          1:N                     │ criadoEm             │
           │                     └──────────────────────┘
           │
           ├──────────────────┐
           │                  │
           ↓N                 ↓N
    ┌────────────┐     ┌──────────────┐
    │   SLOTS    │     │ AGENDAMENTOS │
    ├────────────┤     ├──────────────┤
    │ id (UUID)  │     │ id (UUID) PK │
    │ prof_id ⭐ │     │ chamado_id ⭐│
    │ dataHora ⭐│     │ profissional ⭐
    │ duracao    │     │ slot_id      │
    │ disponivel │     │ dataHora     │
    │ agend_id   │     │ duracao      │
    │ criadoEm   │     │ status ⭐    │
    └────────────┘     │ confirmadoEm │
                       │ canceladoEm  │
                       │ inicioAtend. │
                       │ fimAtend.    │
                       │ criadoEm     │
                       └──────────────┘

⭐ = Indexed or critical for queries
FK = Foreign Key relationship
```

## Service Layer Architecture

```
CONTROLLERS (HTTP)
    ↓ request payload
    ↓
[ChamadoController]  [TriagemController]  [ProfissionalController]  [AgendamentoController]
    ↓                       ↓                       ↓                         ↓
SERVICES (Business Logic)
    ↓                       ↓                       ↓                         ↓
[ChamadoService]   [TriagemService]   [ProfissionalService]   [AgendamentoService]
    ↓ inject           ↓ inject             ↓ inject                ↓ inject
[HistoricoService] [ProfessionalSvc]  [ChamadoService]       [SlotService]
                   [HistoricoService]                         [HistoricoService]

    ↓ @InjectRepository
REPOSITORIES (Data Access - TypeORM)
    ↓
[Chamado]    [ChamadoHistorico]    [Profissional]    [Triagem]    [Slot]    [Agendamento]
    ↓                                   ↓                              ↓
DATABASE (PostgreSQL)
```

---

**Last Updated**: 2026-01-03  
**Files**: 30 TypeScript files, ~3000 lines of code  
**Status**: ✅ Backend MVP Ready for Database Integration & Frontend
