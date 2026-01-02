# Fluxo de Abertura de Chamado - Documentação

## Visão Geral

Este documento descreve o fluxo completo de criação de um chamado (serviço/case) no VITAS, desde a seleção do contexto até a submissão com anexos.

## Arquitetura do Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Seleção de Contexto (Casa, Vida Digital, etc)           │
│    Página: /contexto/casa                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Seleção de Opção (Reforma, Limpeza, Jardinagem, etc)    │
│    Componente: CasaOptionCard                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Preenchimento de Formulário                              │
│    Página: /chamado/novo?contexto=casa&opcao=reforma       │
│    - Título (10-200 chars)                                  │
│    - Descrição (20-2000 chars)                              │
│    - Prioridade (BAIXA, NORMAL, ALTA, URGENTE)             │
│    - Anexos (Fotos, PDFs, Docs)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Validação de Dados                                       │
│    - Campos obrigatórios                                    │
│    - Limites de caracteres                                  │
│    - Tipos de arquivo permitidos                            │
│    - Tamanho máximo de arquivo (10MB)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Submissão                                                │
│    POST /api/chamados                                       │
│    - Cria chamado no banco de dados                         │
│    - Retorna ID do chamado criado                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Upload de Anexos                                         │
│    POST /api/chamados/{chamadoId}/anexos                    │
│    - Upload múltiplo de arquivos                            │
│    - Gera thumbnails para imagens                           │
│    - Presigned URLs para armazenamento                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Redirecionamento                                         │
│    Página: /cases                                           │
│    - Mostra sucesso                                         │
│    - Chamado visível na lista                               │
│    - Notificação de profissionais                           │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Principais

### 1. FormNovoChamado (`frontend/src/components/FormNovoChamado.tsx`)

**Responsabilidades:**
- Renderizar formulário com todos os campos
- Validação de entrada em tempo real
- Gerenciar estado local do formulário
- Lidar com upload de anexos
- Exibir mensagens de erro

**Props:**
```typescript
interface FormNovoChamadoProps {
  contexto?: string;        // Contexto selecionado (ex: 'casa')
  opcao?: string;           // Opção selecionada (ex: 'reforma')
  onSubmit?: (data: NovoChamadoData) => Promise<void>;
  isLoading?: boolean;      // Estado de carregamento
}
```

**Estados:**
- `formData`: Campos do formulário
- `anexos`: Lista de arquivos selecionados
- `errors`: Dicionário de erros por campo
- `submitting`: Estado de submissão

### 2. Página NovoChamado (`frontend/src/pages/NovoChamado.tsx`)

**Responsabilidades:**
- Renderizar layout completo da página
- Gerenciar query parameters (contexto, opcao)
- Chamar serviço de API
- Redirecionar após sucesso
- Exibir dicas de melhor prática

**Estados:**
- `isLoading`: Requisição em progresso
- `error`: Erro geral da página

### 3. Serviço chamadoService (`frontend/src/lib/chamadoService.ts`)

**Responsabilidades:**
- Criar novo chamado (POST /chamados)
- Upload de anexos (POST /chamados/{id}/anexos)
- CRUD completo de chamados

**Métodos principais:**
- `criarChamado(data)` - Cria novo chamado
- `uploadAnexo(chamadoId, arquivo)` - Upload single
- `uploadMultiplosAnexos(chamadoId, arquivos)` - Upload múltiplo
- `buscarChamado(chamadoId)` - Busca por ID
- `listarChamados(filtros)` - Lista com filtros

## Validações

### Campos Obrigatórios
- **Título**: Mínimo 10 chars, máximo 200 chars
- **Descrição**: Mínimo 20 chars, máximo 2000 chars
- **Prioridade**: Um dos valores: BAIXA, NORMAL, ALTA, URGENTE

### Validação de Anexos
- **Tipos permitidos**:
  - Imagens: JPG, PNG, GIF
  - Documentos: PDF, DOC, DOCX
- **Tamanho máximo**: 10MB por arquivo
- **Quantidade**: Sem limite (teoricamente)
- **Validação**: Client-side + server-side

## Fluxo de Dados

### Request: Criar Chamado
```json
POST /api/chamados
{
  "titulo": "Reforma do banheiro",
  "descricao": "Preciso reformar o banheiro da casa...",
  "prioridade": "NORMAL",
  "contextoId": "uuid-contexto-casa",
  "grupoId": "uuid-grupo",
  "opcao": "reforma"
}
```

### Response: Chamado Criado
```json
200 OK
{
  "id": "uuid-chamado",
  "titulo": "Reforma do banheiro",
  "descricao": "Preciso reformar o banheiro da casa...",
  "status": "ABERTO",
  "prioridade": "NORMAL",
  "contextoId": "uuid-contexto-casa",
  "grupoId": "uuid-grupo",
  "criadoEm": "2024-01-01T10:00:00Z",
  "atualizadoEm": "2024-01-01T10:00:00Z"
}
```

### Request: Upload Anexo
```
POST /api/chamados/uuid-chamado/anexos
Content-Type: multipart/form-data

file: <binary-data>
```

### Response: Anexo Criado
```json
200 OK
{
  "id": "uuid-anexo",
  "nomeOriginal": "foto.jpg",
  "url": "https://s3.amazonaws.com/...",
  "tamanho": 2048576,
  "tipo": "image/jpeg",
  "criadoEm": "2024-01-01T10:00:00Z"
}
```

## Query Parameters

- `contexto` - Tipo de contexto (casa, vida_digital, idoso, transicao)
- `opcao` - Opção específica do contexto (reforma, limpeza, etc)

**Exemplo:**
```
/chamado/novo?contexto=casa&opcao=reforma
```

## Estados e Transições

```
Inicial
   ↓
Preenchendo Formulário
   ↓
Adicionando Anexos
   ↓
Validando
   ├─ Se inválido → Mostrando erros (volta ao preenchimento)
   └─ Se válido ↓
   ↓
Enviando Chamado
   ├─ Se erro → Mostrando erro (volta ao preenchimento)
   └─ Se sucesso ↓
   ↓
Enviando Anexos
   ├─ Se erro → Mostrando aviso
   └─ Se sucesso ↓
   ↓
Redirecionando para /cases
   ↓
Fim
```

## Mensagens de Erro

### Validação de Formulário
- "Título é obrigatório"
- "Título deve ter pelo menos 10 caracteres"
- "Descrição deve ter pelo menos 20 caracteres"

### Validação de Arquivos
- "Arquivo é muito grande (máx 10MB)"
- "Tipo de arquivo não é permitido"

### Erros de API
- "Erro ao criar chamado. Tente novamente."
- (Mensagem específica do servidor)

## Melhorias Futuras

1. **Drag & Drop** - Arrastar arquivos para upload
2. **Cropping de imagens** - Editar fotos antes de enviar
3. **Preview em tempo real** - Mostrar como ficará
4. **Autosalvar rascunho** - Salvar progressivamente
5. **Integração com câmera** - Capturar foto direto da câmera
6. **Localização** - Adicionar mapa e endereço
7. **Agendamento** - Definir data/horário preferido
8. **Orçamento estimado** - Mostrar estimativa baseado nos dados

## Testing

### Casos de Teste
- [ ] Formulário valida título obrigatório
- [ ] Formulário valida descrição mínimo 20 chars
- [ ] Upload de arquivo maior que 10MB mostra erro
- [ ] Upload de tipo de arquivo inválido mostra erro
- [ ] Remover anexo funciona corretamente
- [ ] Submissão com sucesso redireciona para /cases
- [ ] Submissão com erro mostra mensagem
- [ ] Query params contexto e opcao são usados corretamente

## Integração com Backend

### Endpoints Necessários

**Criar Chamado**
```
POST /api/chamados
Content-Type: application/json
Authorization: Bearer <token>

{
  "titulo": string,
  "descricao": string,
  "prioridade": "BAIXA" | "NORMAL" | "ALTA" | "URGENTE",
  "contextoId": string (UUID),
  "grupoId": string (UUID),
  "opcao"?: string
}

Response: 201 Created
{
  "id": string,
  "titulo": string,
  "descricao": string,
  "status": "ABERTO",
  "prioridade": string,
  "contextoId": string,
  "grupoId": string,
  "criadoEm": string (ISO 8601),
  "atualizadoEm": string (ISO 8601)
}
```

**Upload Anexos**
```
POST /api/chamados/{chamadoId}/anexos
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <binary>

Response: 200 OK
{
  "id": string,
  "nomeOriginal": string,
  "url": string (presigned URL),
  "tamanho": number,
  "tipo": string,
  "criadoEm": string
}
```

## Performance

- Validação ocorre no client-side antes de submeter
- Upload de anexos ocorre após criação do chamado
- Múltiplos anexos são enviados em paralelo (Promise.all)
- Loading states impedem submissão duplicada

## Segurança

- Validação de tipos de arquivo (whitelist)
- Tamanho máximo de arquivo (10MB)
- Tokens JWT em headers
- Sanitização de entrada no servidor
- Rate limiting na API
