#!/bin/bash
# Script para criar branch vinculada a uma issue do GitHub
# Uso: ./create-branch-from-issue.sh <numero-da-issue>

set -e

if [ -z "$1" ]; then
  echo "Erro: Informe o número da issue"
  echo "Uso: ./create-branch-from-issue.sh <numero-da-issue>"
  exit 1
fi

ISSUE_NUM=$1
REPO="eloviskis/vigas"  # Repositório técnico - Projeto VITAS

# Buscar título da issue
ISSUE_TITLE=$(gh issue view $ISSUE_NUM --repo $REPO --json title --jq '.title')

if [ -z "$ISSUE_TITLE" ]; then
  echo "Erro: Issue #$ISSUE_NUM não encontrada"
  exit 1
fi

# Criar nome da branch (formato: issue-{num}-{titulo-kebab-case})
BRANCH_NAME="issue-$ISSUE_NUM-$(echo "$ISSUE_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//' | cut -c1-50)"

echo "Criando branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

echo "✓ Branch criada e ativada: $BRANCH_NAME"
echo "✓ Vinculada à issue #$ISSUE_NUM: $ISSUE_TITLE"
echo ""
echo "Próximos passos:"
echo "1. Faça suas alterações"
echo "2. Commit: git commit -m 'feat: descrição' (ou fix:, docs:, etc)"
echo "3. Push: git push -u origin $BRANCH_NAME"
echo "4. Abra PR vinculada: gh pr create --title \"$ISSUE_TITLE\" --body \"Closes #$ISSUE_NUM\""
