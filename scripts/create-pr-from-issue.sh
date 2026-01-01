#!/bin/bash
# Script para criar Pull Request vinculada a uma issue
# Uso: ./create-pr-from-issue.sh <numero-da-issue> [titulo-customizado]

set -e

if [ -z "$1" ]; then
  echo "Erro: Informe o número da issue"
  echo "Uso: ./create-pr-from-issue.sh <numero-da-issue> [titulo-customizado]"
  exit 1
fi

ISSUE_NUM=$1
REPO="eloviskis/vigas"  # Repositório técnico - Projeto VITAS

# Buscar título da issue se não foi fornecido
if [ -z "$2" ]; then
  ISSUE_TITLE=$(gh issue view $ISSUE_NUM --repo $REPO --json title --jq '.title')
  PR_TITLE="$ISSUE_TITLE"
else
  PR_TITLE="$2"
fi

if [ -z "$ISSUE_TITLE" ]; then
  echo "Erro: Issue #$ISSUE_NUM não encontrada"
  exit 1
fi

# Criar PR vinculada à issue
echo "Criando Pull Request vinculada à issue #$ISSUE_NUM..."
gh pr create --repo $REPO --title "$PR_TITLE" --body "Closes #$ISSUE_NUM" --assignee "@me"

echo "✓ Pull Request criada com sucesso!"
echo "✓ Vinculada à issue #$ISSUE_NUM"
echo "A automação do Kanban adicionará a label 'In progress' automaticamente."
