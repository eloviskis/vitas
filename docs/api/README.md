# VITAS API Documentation

Documentação completa da API REST do VITAS.

## 📄 OpenAPI Specification

A especificação completa da API está disponível em:
- **Arquivo**: [openapi.json](openapi.json)
- **Swagger UI**: http://localhost:3000/api/docs (em desenvolvimento)
- **Versão**: 1.0.0

## 🔐 Autenticação

Todos os endpoints (exceto `/auth/login` e `/auth/register`) requerem autenticação via JWT.

### Como autenticar:

1. **Fazer login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@example.com", "password": "senha123"}'
```

2. **Resposta**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "cliente@example.com",
    "role": "cliente"
  }
}
```

3. **Usar o token**:
```bash
curl -X GET http://localhost:3000/api/chamados \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📚 Endpoints Principais

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Criar nova conta | Não |
| POST | `/auth/login` | Autenticar usuário | Não |
| POST | `/auth/logout` | Encerrar sessão | Sim |

### Chamados (`/api/chamados`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/chamados` | Listar todos | Sim |
| GET | `/chamados/:id` | Obter por ID | Sim |
| POST | `/chamados` | Criar chamado | Sim |
| PUT | `/chamados/:id` | Atualizar | Sim |
| DELETE | `/chamados/:id` | Deletar | Sim |

### Triagem (`/api/triagem`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/triagem/executar` | Executar triagem | Sim |
| GET | `/triagem/profissionais/:chamadoId` | Profissionais sugeridos | Sim |

### Agendamento (`/api/agendamentos`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/agendamentos/slots` | Listar slots disponíveis | Sim |
| POST | `/agendamentos` | Reservar slot | Sim |
| PATCH | `/agendamentos/:id/cancelar` | Cancelar | Sim |

### Orçamentos (`/api/orcamentos`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/orcamentos/:chamadoId` | Orçamentos do chamado | Sim |
| POST | `/orcamentos` | Criar orçamento | Sim |
| PATCH | `/orcamentos/:id/aprovar` | Aprovar | Sim |

### Pagamentos (`/api/pagamentos`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/pagamentos/pix` | Gerar PIX | Sim |
| POST | `/pagamentos/cartao` | Processar cartão | Sim |
| GET | `/pagamentos/:id/status` | Verificar status | Sim |

### Armazenamento (`/api/storage`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/storage/upload` | Upload arquivo (max 10MB) | Não |

### Notificações (`/api/notifications`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/notifications/send` | Enviar para dispositivo | Sim |
| POST | `/notifications/send-multiple` | Enviar em lote | Sim |
| POST | `/notifications/send-to-topic` | Broadcast por tópico | Sim |

## 🏗️ Modelos de Dados

### User
```typescript
{
  id: number;
  email: string;
  nome: string;
  role: 'cliente' | 'profissional' | 'operador' | 'admin';
  ativo: boolean;
}
```

### Chamado
```typescript
{
  id: string; // UUID
  usuarioId: string;
  contexto: string; // hidraulica, eletrica, etc.
  descricao: string;
  status: 'aguardando_triagem' | 'triagem_concluida' | ...;
  observacoes?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

### Triagem
```typescript
{
  id: string;
  chamadoId: string;
  score: number; // 0-100
  urgencia: string;
  complexidade: string;
  profissionaisSugeridos: Profissional[];
}
```

### Agendamento
```typescript
{
  id: string;
  chamadoId: string;
  profissionalId: string;
  dataHora: Date;
  duracao: number; // minutos
  status: 'confirmado' | 'cancelado' | 'concluido';
}
```

## 📝 Exemplos de Uso

### Criar Chamado
```bash
curl -X POST http://localhost:3000/api/chamados \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contexto": "hidraulica",
    "descricao": "Vazamento no banheiro, urgente",
    "observacoes": "Apartamento no 5º andar"
  }'
```

### Upload de Foto
```bash
curl -X POST http://localhost:3000/api/storage/upload \
  -F "file=@foto.jpg" \
  -F "folder=chamados"
```

### Enviar Notificação
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "FCM_TOKEN",
    "title": "Novo chamado próximo!",
    "body": "Você tem um chamado de hidráulica a 2km",
    "data": {
      "chamadoId": "uuid",
      "action": "open_chamado"
    }
  }'
```

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Token inválido ou expirado |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 500 | Internal Server Error - Erro no servidor |

## 🔍 Rate Limiting

- **Limite**: 100 requisições por minuto por IP
- **Header**: `X-RateLimit-Remaining`
- **Reset**: Header `X-RateLimit-Reset`

## 📊 Versionamento

A API usa versionamento semântico (SemVer):
- **v1.0.0**: Versão atual (estável)
- **Breaking changes**: Incremento de major version (v2.0.0)
- **Novas features**: Incremento de minor version (v1.1.0)
- **Bugfixes**: Incremento de patch version (v1.0.1)

## 🛠️ Ferramentas

- **Postman Collection**: [Importar](./postman_collection.json)
- **Insomnia Workspace**: [Importar](./insomnia_workspace.json)
- **Swagger Editor**: https://editor.swagger.io

## 📞 Suporte

- **GitHub**: https://github.com/eloviskis/vitas/issues
- **Email**: support@vitas.com
- **Docs**: https://github.com/eloviskis/vitas/tree/main/docs

## 📅 Última Atualização

**Data**: 6 de janeiro de 2026  
**Versão da API**: 1.0.0  
**Changelog**: [Ver mudanças](../../CHANGELOG.md)
