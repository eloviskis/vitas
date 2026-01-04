# VITAS Development Context for Claude

Auto-generated from feature plans. Last updated: 2026-01-03

## Project Overview

VITAS is a super-app for managing "practical life" by context (Casa/Home, Vida Digital/Digital Life, Família/Family, Idosos/Elderly, Transições/Transitions). Features include:
- Smart request (chamado) creation & triage
- Professional recommendation & scheduling
- Service history & post-service follow-up
- PWA + Android native app

**Current Phase**: Feature 005 (Task generation automation using Speckit)

## Tech Stack

- **Backend**: NestJS 10+ + TypeORM 0.3+ + PostgreSQL 14+
- **Frontend**: React 18+ + Vite + Capacitor
- **Testing**: Jest (backend), Vitest (frontend)
- **CI/CD**: GitHub Actions, Docker
- **Speckit**: Bash scripts for feature management

## Key Commands

```bash
# Feature workflow (Speckit)
./.specify/scripts/bash/create-new-feature.sh "description"
./.specify/scripts/bash/generate-tasks.sh [--force]
./.specify/scripts/bash/validate-tasks.sh [--ci]

# Development
backend: npm install && npm run dev
frontend: npm install && npm run dev
db: npm run typeorm:migrate
tests: npm test
```

## Active Features

1. **✓ 001**: Setup Inicial (done)
2. **✓ 002**: Checklist Kickoff (done)
3. **✓ 003**: Tasks Kickoff (done)
4. **✓ 004**: Tasks Auto (done)
5. **⏳ 005**: Automação de Geração do tasks.md (current - generate-tasks.sh + validate-tasks.sh implemented)
**5. ⏳ 013**: Timeline/Historico do Chamado (IN PROGRESS - Structure Ready)
   - Entities: Chamado, ChamadoHistorico with full relationships
   - Services: ChamadoService (CRUD + logging), HistoricoService (timeline events)
   - Controllers: ChamadoController, HistoricoController
   - Status: Ready for triagem/agendamento integration
6. **→ 014**: Triagem & Profissional Selection (pending)

## Recent Changes

**Feature 013** (2026-01-03 - COMPLETE):
- ✅ Base module structure: `app.module.ts`, `main.ts`, `chamado.module.ts`
- ✅ Chamado entity with statuses (ABERTO, TRIADO, AGENDADO, CONCLUIDO, CANCELADO)
- ✅ ChamadoHistorico entity with relationship ManyToOne to Chamado
- ✅ HistoricoService: registrarEvento, registrarStatus, registrarTriagem, registrarAgendamento, registrarNota, registrarSistema
- ✅ ChamadoService: CRUD + automatic logging via HistoricoService
- ✅ Controllers: ChamadoController, HistoricoController with full endpoints
- ✅ DTOs: CriarChamadoDto, ChamadoResponseDto, CriarHistoricoDto, HistoricoResponseDto
- Commits: feat(013): Estrutura base + Entidades completas

**Feature 005** (2026-01-03 - COMPLETE):
- ✅ generate-tasks.sh: Parses spec.md/plan.md → generates tasks.md with priorities (P1/P2/P3)
- ✅ validate-tasks.sh: Consistency checks for story coverage, IDs, phases
- ✅ Documentation: README.md + CLAUDE.md with Speckit workflow

## Code Structure

### Backend Modules

```
backend/src/
├── chamado/                    # Request/Issue management
│   ├── entities/
│   │   ├── chamado.entity.ts   (status: ABERTO, TRIADO, AGENDADO, CONCLUIDO; relations: historico, agendamentos)
│   │   └── chamado-historico.entity.ts (types: STATUS, TRIAGEM, AGENDAMENTO, NOTA, SISTEMA)
│   ├── services/
│   │   ├── chamado.service.ts
│   │   └── historico.service.ts (NEW - ready for wiring)
│   ├── controllers/
│   │   ├── chamado.controller.ts
│   │   └── historico.controller.ts (NEW - GET/POST chamados/:id/historico)
│   ├── dtos/
│   │   ├── chamado.dto.ts
│   │   └── historico.dto.ts (NEW)
│   └── chamado.module.ts (NEEDS WIRING)
├── triagem/                    # Automatic/assisted triage
│   ├── entities/
│   ├── services/triagem.service.ts
│   └── (needs HistoricoService injection for logging)
├── agendamento/                # Scheduling & slots
│   ├── entities/agendamento.entity.ts
│   ├── services/
│   │   ├── agendamento.service.ts
│   │   └── slots.service.ts
│   └── (needs HistoricoService injection for logging)
└── app.module.ts (NEEDS: ChamadoModule, TriagemModule, AgendamentoModule imported + TypeORM ChamadoHistorico registered)
```

### Frontend Routes

```
src/
├── pages/
│   ├── /chamados              # List chamados
│   ├── /chamados/new          # Create chamado
│   ├── /chamados/:id          # View chamado + timeline
│   ├── /chamados/:id/triagem  # Triage selection
│   ├── /chamados/:id/profissional (Professional selection - Issue #11)
│   ├── /chamados/:id/agendar  # Scheduling (Issue #12)
│   └── /chamados/:id/timeline # Historico view (Issue #13, part of /chamados/:id)
└── services/
    ├── chamadoService.ts
    ├── agendamentoService.ts
    └── historicoService.ts (ready)
```

## Next Steps (Immediate)

1. **Feature 013 Complete** ✅:
   - Module structure, entities, services, controllers all done
   - Ready for integration with triagem and agendamento flows
   - Timeline endpoints functional: GET/POST /api/chamados/:id/historico

2. **Next Feature (014)**: Triagem & Profissional Selection
   - Create TriagemModule with TriagemService
   - Inject HistoricoService for logging recommendations
   - Profissional selection with rating/score
   - Create frontend components for triage flow

3. **After 014**: Agendamento & Scheduling
   - Create AgendamentoModule with AgendamentoService
   - Slot management and availability
   - Calendar integration
   - Frontend scheduling UI

## Commit Convention

Format: `type(scope): subject [TASK_IDS]`
- Example: `feat(005): add validate-tasks script [T040 T041] [US3]`
- Use task IDs from tasks.md and user story labels

## Notes for Agents

- Speckit scripts are in `./.specify/scripts/bash/` - use `chmod +x` if not executable
- All feature specs in `/specs/[###-name]/` with plan.md, spec.md, tasks.md
- Each feature maps to a GitHub issue number (005 = Issue #5 equivalent in specs)
- Task IDs format: T001, T002, etc. Organized by Phase (Phase 1, 2, 3+)
- User Stories format: US1, US2, US3 with priorities P1 (MVP), P2, P3
- Always validate generated tasks with `validate-tasks.sh` before committing

