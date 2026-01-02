# Modelo de Entidades - Projeto VITAS

## Visão Geral

Este documento descreve o modelo de dados do sistema VITAS, incluindo todas as entidades principais, seus relacionamentos e regras de negócio.

## Entidades Principais

### 1. Usuário
Representa todos os usuários do sistema (clientes, profissionais, operadores, admins).

**Campos:**
- `id`: UUID (PK)
- `email`: String único (login)
- `senha_hash`: String (bcrypt)
- `nome`: String
- `telefone`: String (opcional)
- `foto_url`: String (URL no S3/GCS)
- `tipo`: Enum (cliente, profissional, operador, admin)
- `status`: Enum (ativo, inativo, bloqueado, pendente_verificacao)
- `email_verificado`: Boolean
- `telefone_verificado`: Boolean
- `ultimo_acesso`: Timestamp
- `criado_em`, `atualizado_em`: Timestamps

**Índices:**
- email (único)
- tipo
- status

### 2. Grupo/Família
Representa grupos de usuários que compartilham contextos (ex: família, organização).

**Campos:**
- `id`: UUID (PK)
- `nome`: String
- `descricao`: Text
- `admin_id`: UUID (FK → Usuario)
- `ativo`: Boolean
- `criado_em`, `atualizado_em`: Timestamps

**Relacionamentos:**
- 1:N com GrupoMembro
- 1:N com Contexto

### 3. GrupoMembro
Tabela intermediária N:N entre Grupo e Usuario, com permissões.

**Campos:**
- `id`: UUID (PK)
- `grupo_id`: UUID (FK → Grupo)
- `usuario_id`: UUID (FK → Usuario)
- `papel`: String (admin, membro, visualizador)
- `permissoes`: JSONB (ex: {"pode_criar_chamado": true})
- `adicionado_em`: Timestamp

**Constraint:**
- UNIQUE(grupo_id, usuario_id)

### 4. Contexto
Representa um contexto de vida (casa, vida digital, filhos, pais/idosos, transições).

**Campos:**
- `id`: UUID (PK)
- `grupo_id`: UUID (FK → Grupo)
- `tipo`: Enum (casa, vida_digital, filhos, pais_idosos, transicoes)
- `nome`: String (ex: "Casa da Praia", "Notebook Pessoal")
- `descricao`: Text
- `metadados`: JSONB (configurações específicas do tipo)
- `ativo`: Boolean
- `criado_em`, `atualizado_em`: Timestamps

**Relacionamentos:**
- N:1 com Grupo
- 1:N com Caso

### 5. Caso (Chamado)
Representa um problema/necessidade reportado pelo usuário.

**Campos:**
- `id`: UUID (PK)
- `contexto_id`: UUID (FK → Contexto)
- `usuario_id`: UUID (FK → Usuario)
- `titulo`: String
- `descricao`: Text
- `tipo_problema`: String (ex: "encanamento", "eletrica")
- `urgencia`: Enum (baixa, media, alta, critica)
- `status`: Enum (novo, triagem, proposta, agendado, em_execucao, concluido, cancelado, reaberto)
- `orcamento_maximo`: Decimal
- `disponibilidade`: JSONB (dias e horários)
- `triagem_automatica`: Boolean
- `tags`: Array de Strings
- `criado_em`, `atualizado_em`: Timestamps

**Relacionamentos:**
- N:1 com Contexto
- N:1 com Usuario
- 1:N com OrdemServico
- 1:N com Anexo

### 6. Profissional
Dados específicos de profissionais prestadores de serviço.

**Campos:**
- `id`: UUID (PK)
- `usuario_id`: UUID (FK → Usuario, UNIQUE)
- `especialidades`: Array de Strings
- `regioes_atendimento`: JSONB (cidades/bairros)
- `disponibilidade`: JSONB (dias/horários)
- `preco_base`: Decimal
- `score`: Decimal (0.00 a 5.00)
- `total_servicos`: Integer
- `verificado`: Boolean
- `documentos_verificados`: Boolean
- `ativo`: Boolean
- `criado_em`, `atualizado_em`: Timestamps

**Relacionamentos:**
- 1:1 com Usuario
- 1:N com OrdemServico

### 7. OrdemServico
Representa um serviço agendado/executado.

**Campos:**
- `id`: UUID (PK)
- `caso_id`: UUID (FK → Caso)
- `profissional_id`: UUID (FK → Profissional)
- `data_agendada`: Timestamp
- `data_iniciada`: Timestamp
- `data_concluida`: Timestamp
- `status`: Enum (agendada, em_andamento, concluida, cancelada)
- `valor_acordado`: Decimal
- `valor_final`: Decimal
- `avaliacao_nota`: Integer (1-5)
- `avaliacao_comentario`: Text
- `avaliado_em`: Timestamp
- `garantia_ate`: Date
- `notas_internas`: Text
- `criado_em`, `atualizado_em`: Timestamps

**Relacionamentos:**
- N:1 com Caso
- N:1 com Profissional
- 1:N com FollowUp
- 1:N com Anexo

### 8. FollowUp
Follow-ups automáticos pós-serviço (D+7, D+30, D+90).

**Campos:**
- `id`: UUID (PK)
- `os_id`: UUID (FK → OrdemServico)
- `tipo`: Enum (d_7, d_30, d_90)
- `data_prevista`: Date
- `data_enviada`: Timestamp
- `respondido`: Boolean
- `data_resposta`: Timestamp
- `satisfeito`: Boolean
- `problema_persistiu`: Boolean
- `comentario`: Text
- `reabriu_caso`: Boolean
- `caso_reaberto_id`: UUID (FK → Caso)
- `criado_em`: Timestamp

**Relacionamentos:**
- N:1 com OrdemServico
- 0:1 com Caso (se reabrir)

### 9. Anexo
Anexos polimórficos (fotos, documentos, notas).

**Campos:**
- `id`: UUID (PK)
- `entidade_tipo`: String (caso, ordem_servico, followup)
- `entidade_id`: UUID
- `tipo`: Enum (foto, documento, nota, orcamento)
- `url`: String (URL no S3/GCS)
- `nome_arquivo`: String
- `tamanho_bytes`: BigInt
- `mime_type`: String
- `metadata`: JSONB
- `criado_por`: UUID (FK → Usuario)
- `criado_em`: Timestamp

**Índices:**
- (entidade_tipo, entidade_id)

### 10. Auditoria
Log de ações importantes no sistema (LGPD, rastreabilidade).

**Campos:**
- `id`: UUID (PK)
- `usuario_id`: UUID (FK → Usuario)
- `acao`: String (ex: criar_caso, concluir_os)
- `entidade_tipo`: String
- `entidade_id`: UUID
- `dados_anteriores`: JSONB
- `dados_novos`: JSONB
- `ip_origem`: String
- `user_agent`: String
- `criado_em`: Timestamp

## Regras de Negócio

### Ciclo de Vida de um Caso

1. **Novo**: Caso criado pelo usuário
2. **Triagem**: Sistema ou operador classifica e sugere profissional
3. **Proposta**: Profissional aceita e envia proposta
4. **Agendado**: Data/hora confirmada, OS criada
5. **Em Execução**: Profissional iniciou o serviço
6. **Concluído**: Serviço finalizado
7. **Reaberto**: Follow-up identificou problema persistente

### Follow-ups Automáticos

- **D+7**: Verifica se o serviço funcionou
- **D+30**: Confirma se não houve reincidência
- **D+90**: Valida durabilidade/qualidade

Se qualquer follow-up indicar problema:
- Caso é reaberto automaticamente
- Vinculado à garantia (se aplicável)
- Profissional é notificado

### Score de Profissionais

Calculado com base em:
- Avaliações (nota média)
- Durabilidade (follow-ups positivos)
- Taxa de reincidência (quanto menor, melhor)
- Tempo de resposta
- Cancelamentos

### Permissões em Grupo

Papéis:
- **Admin**: Gerencia grupo, adiciona/remove membros, define permissões
- **Membro**: Cria casos, visualiza histórico do grupo
- **Visualizador**: Apenas consulta

Permissões granulares (JSONB):
```json
{
  "pode_criar_chamado": true,
  "pode_aprovar_orcamento": false,
  "pode_avaliar_servico": true,
  "limite_orcamento": 500.00
}
```

## Triggers e Automações

### Triggers SQL

- **atualizar_timestamp**: Atualiza `atualizado_em` em UPDATE
- Aplicado em: usuarios, grupos, contextos, casos, profissionais, ordens_servico

### Automações da Aplicação

- Criar follow-ups ao concluir OS
- Atualizar score do profissional após avaliação
- Reabrir caso se follow-up negativo
- Notificar profissional quando caso entra em triagem
- Enviar lembrete de follow-up pendente

## Índices e Performance

### Índices Principais

- `usuarios(email)`: Login
- `casos(status, criado_em DESC)`: Listagem de casos
- `ordens_servico(data_agendada)`: Agenda do profissional
- `profissionais(score DESC)`: Ranking de profissionais
- `anexos(entidade_tipo, entidade_id)`: Busca de anexos

### Índices GIN (Arrays/JSONB)

- `profissionais(especialidades)`: Busca por especialidade

## Migrations

O schema será gerenciado via migrations:
- **001_initial_schema.sql**: Schema completo
- **002_add_indexes.sql**: Índices adicionais
- **003_add_triggers.sql**: Triggers e funções
- Futuras migrations para evolução do schema

## Considerações de LGPD

- **Auditoria**: Toda ação sensível é registrada
- **Consentimento**: Registrado em `usuarios.metadados`
- **Exportação**: Query para gerar JSON com todos os dados do usuário
- **Exclusão**: Hard delete ou anonymização (remover PII)

## Próximos Passos

1. Implementar schema no PostgreSQL
2. Criar seeds para desenvolvimento
3. Implementar models/entities no backend
4. Criar repositórios/DAOs
5. Implementar validações
