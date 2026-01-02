# Modelagem de Entidades Core

## Entities Implementadas

### 1. Grupo
Representa um grupo familiar ou de cuidado.

**Campos:**
- `id` (UUID): Primary key
- `nome`: Nome do grupo
- `descricao`: Descrição
- `foto`: URL da foto do grupo
- `criadoPor`: Relacionamento com User (quem criou)
- `membros`: Many-to-many com User
- `chamados`: Um-para-muitos com Chamado
- `criadoEm`, `atualizadoEm`, `deletado`: Auditoria

**Relacionamentos:**
- 1:N com Chamado (um grupo tem vários chamados)
- M:N com User (membros do grupo)

### 2. Contexto
Define o contexto de atendimento (Casa, Vida Digital, Idoso, etc).

**Tipos:**
- CASA: Contexto de atendimento em casa
- VIDA_DIGITAL: Contexto digital
- IDOSO: Contexto para atendimento a idosos
- TRANSICAO: Contexto de transição

**Campos:**
- `id`, `tipo`, `nome`, `descricao`
- `icone`, `cor`: Para UI
- `configuracao`: JSON com configurações específicas

### 3. Chamado
Representa um chamado/serviço/case.

**Status:**
- ABERTO: Recém criado
- EM_ANDAMENTO: Em execução
- PAUSADO: Temporariamente parado
- CONCLUIDO: Finalizado
- CANCELADO: Cancelado

**Prioridade:**
- BAIXA, NORMAL, ALTA, URGENTE

**Campos:**
- `id`, `titulo`, `descricao`
- `grupo`: Foreign key para Grupo
- `contexto`: Foreign key para Contexto
- `status`, `prioridade`
- `criadoPor`, `atribuidoPara`: Relacionamento com User
- `colaboradores`: Many-to-many com User
- `dataVencimento`: Data limite
- `custo`: Valor do serviço
- `notas`: Anotações internas

**Relacionamentos:**
- N:1 com Grupo
- N:1 com Contexto
- N:1 com User (criador)
- N:1 com User (atribuído a)
- M:N com User (colaboradores)
- M:N com Profissional

### 4. Profissional
Cadastro de profissionais prestadores de serviço.

**Especialidades:**
- SAUDE_MENTAL, ENFERMAGEM, FISIOTERAPIA, NUTRICAO
- FONOAUDIOLOGIA, TERAPIA_OCUPACIONAL, PEDAGOGIA, SERVICO_SOCIAL
- OUTRO

**Status:**
- ATIVO: Disponível
- INATIVO: Não está ativo
- BLOQUEADO: Bloqueado pelo admin
- PAUSADO: Pausou temporariamente

**Campos:**
- `id`, `nome`, `email`, `telefone`
- `foto`, `bio`
- `especialidade`, `conselho`, `cro_crp_crea`
- `valorHora`: Valor da hora de serviço
- `status`
- `horarios`: JSON com disponibilidade
- `descricaoServicos`: Descrição dos serviços
- `rating`: Avaliação média (0-5)
- `totalChamados`: Contagem de chamados

**Relacionamentos:**
- M:N com Chamado (um profissional pode atender vários chamados)

## Diagram ER

```
┌─────────────┐
│    User     │
│ (Existente) │
└──────┬──────┘
       │
       ├─── 1:N ──→ Grupo (criadoPor)
       ├─── M:N ──→ Grupo (membros)
       ├─── 1:N ──→ Chamado (criadoPor)
       ├─── N:1 ──→ Chamado (atribuidoPara)
       └─── M:N ──→ Chamado (colaboradores)

┌──────────────┐
│    Grupo     │
│ Familiar/    │
│ Cuidado      │
└──────┬───────┘
       │
       ├─── 1:N ──→ Chamado
       └─── M:N ──→ User (membros)

┌──────────────┐
│   Contexto   │
│ Casa,        │
│ Vida Digital │
└──────┬───────┘
       │
       └─── 1:N ──→ Chamado

┌──────────────┐
│   Chamado    │
│ Serviço/Case │
└──────┬───────┘
       │
       ├─── N:1 ──→ Grupo
       ├─── N:1 ──→ Contexto
       ├─── M:N ──→ User (colaboradores)
       └─── M:N ──→ Profissional

┌──────────────────┐
│  Profissional    │
│ Prestador de     │
│ Serviço          │
└──────────────────┘
       │
       └─── M:N ──→ Chamado
```

## Próximos Passos

1. Criar módulos (grupo.module, chamado.module, etc)
2. Criar DTOs para validação
3. Criar controllers e services
4. Testes unitários
5. Migrations TypeORM

## Dependências

- Todos usam TypeORM base entities
- Herdam padrões de User entity existente
- Suportam soft delete (deletado: boolean)
- Auditoria automática (createdAt, updatedAt)
