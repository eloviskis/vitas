# Contexto Casa - Implementação UI/UX

## Visão Geral

O Contexto Casa é um módulo especializado para serviços domésticos e de manutenção de propriedades. Fornece uma interface intuitiva para que usuários possam solicitar serviços profissionais para suas casas.

## Componentes Criados

### 1. Página Casa (`frontend/src/pages/Casa.tsx`)

**Funcionalidade:**
- Exibe 6 categorias de serviço doméstico: Reforma, Limpeza, Jardinagem, Manutenção, Pintura e Mudança
- Grid responsivo (1 coluna mobile, 2-3 colunas desktop)
- Cards com ícone, título e descrição
- Info cards explicativos sobre vantagens do serviço
- Opção de criar chamado personalizado

**Rotas:**
- `/contexto/casa` - Página principal do contexto

### 2. Componente CasaOptionCard (`frontend/src/components/CasaOptionCard.tsx`)

**Funcionalidade:**
- Card individual para cada tipo de serviço
- Animações ao hover: escala, sombra, mudança de cor
- Ícone emoji para cada categoria
- Seta indicadora para ação
- Barra colorida no topo com gradiente

**Props:**
```typescript
interface CasaOptionCardProps {
  option: {
    id: string;
    title: string;
    icon: string;
    description: string;
    color: string; // gradiente tailwind (ex: 'from-orange-500 to-red-500')
  };
  onSelect: () => void;
}
```

### 3. Componente CasaContextSelector (`frontend/src/components/CasaContextSelector.tsx`)

**Funcionalidade:**
- Modal reutilizável para seleção de opções
- Grid de opções com status visual
- Integração com lógica de seleção

**Props:**
```typescript
interface CasaContextSelectorProps {
  options: ContextOption[];
  selectedOption?: string;
  onSelect: (optionId: string) => void;
  onBack?: () => void;
}
```

### 4. Página Novo Chamado (`frontend/src/pages/NovoChamado.tsx`)

**Funcionalidade:**
- Formulário para criar um novo chamado
- Parâmetros de query para contexto e opção selecionada
- Campos: Título, Descrição, Prioridade
- Validação básica

**Query Parameters:**
- `contexto` - Tipo de contexto (ex: 'casa')
- `opcao` - Opção selecionada (ex: 'reforma')

## Fluxo de Usuário

1. Usuário clica em "Contexto Casa" no menu
2. Vê grid com 6 opções de serviço
3. Clica em uma opção → navega para `/chamado/novo?contexto=casa&opcao=reforma`
4. Preenche formulário de novo chamado
5. Submete e é redirecionado para `/cases`

## Estilos e Design

### Cores
- **Primária:** Azul (#2563EB / Tailwind blue-600)
- **Background:** Gradiente blue-50 to indigo-100
- **Cards:** Branco com sombra e hover effect

### Tipografia
- **Títulos:** Font Bold (900)
- **Corpo:** Font Regular (400)
- **Pequeno:** Font Small (85%)

### Animações
- Transições suaves (300ms)
- Hover: Scale (105%), Shadow, Color Change
- Arrow pulse no hover

## Integração com Backend

### Fluxo a Ser Implementado
1. **GET /contextos** - Buscar tipos de contexto
2. **GET /contextos/casa/opcoes** - Buscar opções do contexto Casa
3. **POST /chamados** - Criar novo chamado com contexto e opção

### Dados Esperados
```typescript
interface Contexto {
  id: string;
  tipo: 'CASA' | 'VIDA_DIGITAL' | 'IDOSO' | 'TRANSICAO';
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  configuracao: Record<string, any>;
}

interface CasaOpcao {
  id: string;
  label: string;
  descricao: string;
  icone: string;
  cor: string;
}

interface CriarChamadoDTO {
  titulo: string;
  descricao: string;
  grupoId: string;
  contextoId: string;
  opcao?: string;
  prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
}
```

## Responsividade

### Mobile (< 768px)
- 1 coluna no grid
- Texto ajustado
- Bottom nav ativo

### Tablet (768px - 1024px)
- 2 colunas no grid
- Espaçamento reduzido

### Desktop (> 1024px)
- 3 colunas no grid
- Espaçamento generoso

## Acessibilidade

- Botões com feedback visual claro
- Labels associadas aos inputs
- Contraste adequado de cores
- Navegação por teclado suportada

## Próximos Passos (Issue #9)

1. Integrar com API real do backend
2. Buscar contextos e opções dinamicamente
3. Validação de formulário avançada
4. Upload de anexos no formulário
5. Testes e2e do fluxo completo

## Arquivos Criados/Modificados

```
frontend/src/
├── pages/
│   ├── Casa.tsx (novo)
│   └── NovoChamado.tsx (novo)
├── components/
│   ├── CasaOptionCard.tsx (novo)
│   └── CasaContextSelector.tsx (novo)
└── App.tsx (modificado - adicionadas rotas)
```

## Testing

### Casos de Teste
- [ ] Página Casa carrega com 6 opções visíveis
- [ ] Cards respondem ao hover com animações
- [ ] Clicando em card navega para `/chamado/novo?contexto=casa&opcao=<opcao>`
- [ ] Formulário valida título obrigatório
- [ ] Seleção de prioridade funciona corretamente
- [ ] Cancelar retorna à página anterior
