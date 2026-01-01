# Guia de Workflow - Projeto VITAS

> **Nota**: O repositório técnico é `eloviskis/vigas`, mas o projeto é chamado **VITAS**.

## Padrão de Nomes de Branches

### Formato Recomendado
```
issue-{numero}-{descricao-curta-kebab-case}
```

### Exemplos
- `issue-1-configurar-repositorio`
- `issue-8-implementar-contexto-casa`
- `issue-15-backoffice-minimo`

### Alternativas por Tipo
- **Feature**: `feature/{numero}-{descricao}` ou `feat/{numero}-{descricao}`
- **Bugfix**: `fix/{numero}-{descricao}` ou `bugfix/{numero}-{descricao}`
- **Docs**: `docs/{numero}-{descricao}`
- **Refactor**: `refactor/{numero}-{descricao}`

## Padrão de Commits (Conventional Commits)

### Formato
```
<tipo>: <descrição curta>

[corpo opcional]

[rodapé opcional - closes #numero-da-issue]
```

### Tipos Principais
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, lint, etc (sem mudança de código)
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção (build, CI, etc)

### Exemplos
```bash
git commit -m "feat: implementar autenticação OAuth"
git commit -m "fix: corrigir validação de email no cadastro"
git commit -m "docs: atualizar README com instruções de setup"
git commit -m "test: adicionar testes unitários para triagem"
```

## Fluxo de Trabalho com Issues

### 1. Escolher uma Issue no Kanban
Acesse o projeto Kanban no GitHub e escolha uma tarefa em "To do".

### 2. Criar Branch Vinculada
```bash
cd ~/vigas
./scripts/create-branch-from-issue.sh <numero-da-issue>
```

### 3. Implementar a Tarefa
Faça as alterações necessárias no código.

### 4. Commit e Push
```bash
git add .
git commit -m "feat: descrição da mudança"
git push -u origin <nome-da-branch>
```

### 5. Criar Pull Request
```bash
./scripts/create-pr-from-issue.sh <numero-da-issue>
```
Ou use o comando direto:
```bash
gh pr create --title "Título" --body "Closes #<numero>" --assignee "@me"
```

### 6. Code Review e Merge
- Aguarde aprovação do PR (se houver revisores)
- Após aprovação, faça merge
- A automação moverá a issue para "Done" automaticamente

## Scripts Disponíveis

### create-branch-from-issue.sh
Cria uma branch vinculada a uma issue com nome padronizado.

**Uso:**
```bash
./scripts/create-branch-from-issue.sh 1
```

### create-pr-from-issue.sh
Cria um Pull Request vinculado a uma issue.

**Uso:**
```bash
./scripts/create-pr-from-issue.sh 1 ["Título customizado"]
```

## Automações Configuradas

### Kanban Automation (GitHub Actions)
- **Trigger**: Abertura de PR → adiciona label "In progress"
- **Trigger**: Fechamento de issue → adiciona label "Done"

### Template de PR
Toda nova PR já vem com checklist e campo para vincular issue.

## Boas Práticas

1. **Sempre vincule PRs às issues** usando `Closes #numero` no corpo do PR
2. **Use commits atômicos** - uma mudança lógica por commit
3. **Escreva mensagens de commit claras** seguindo Conventional Commits
4. **Mantenha PRs pequenos** - facilita revisão e reduz conflitos
5. **Atualize documentação** quando necessário
6. **Execute testes** antes de abrir PR
7. **Comente nas issues** para registrar decisões e progresso

## Exemplo de Fluxo Completo

```bash
# 1. Criar branch para issue #1
cd ~/vigas
./scripts/create-branch-from-issue.sh 1

# 2. Fazer alterações
echo "# VITAS - Projeto Super App" > README.md
git add README.md

# 3. Commit
git commit -m "docs: adicionar README inicial do projeto"

# 4. Push
git push -u origin issue-1-configurar-repositorio

# 5. Criar PR
./scripts/create-pr-from-issue.sh 1

# 6. Após aprovação e merge, a issue será movida para "Done" automaticamente
```
