# VITAS Backend

Backend API do sistema VITAS (Gestão de Cuidados), desenvolvido com NestJS, TypeScript e PostgreSQL.

## 🚀 Tecnologias

- **NestJS 10** - Framework Node.js progressivo
- **TypeScript 5** - Tipagem estática
- **PostgreSQL 15** - Banco de dados relacional
- **TypeORM** - ORM para gerenciamento de dados
- **AWS S3** - Armazenamento de arquivos
- **Sharp** - Processamento de imagens
- **JWT** - Autenticação
- **Swagger** - Documentação automática da API

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- npm ou yarn
- Conta AWS (ou MinIO para desenvolvimento local)

## 🔧 Instalação

### 1. Clone e instale dependências

```bash
cd backend
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=vitas
DB_PASSWORD=sua-senha-segura
DB_DATABASE=vitas_db

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_S3_BUCKET_NAME=vitas-uploads

# JWT
JWT_SECRET=sua-chave-secreta-super-segura
JWT_REFRESH_SECRET=sua-chave-refresh-super-segura
```

### 3. Configurar Banco de Dados

#### Opção A: PostgreSQL local

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql@15                       # macOS

# Criar banco
sudo -u postgres psql
CREATE DATABASE vitas_db;
CREATE USER vitas WITH ENCRYPTED PASSWORD 'vitas_dev_password';
GRANT ALL PRIVILEGES ON DATABASE vitas_db TO vitas;
\q
```

#### Opção B: Docker Compose

```bash
# Criar docker-compose.yml (ou usar o existente)
docker-compose up -d postgres

# Verificar
docker-compose ps
```

### 4. Configurar Storage (AWS S3)

#### Opção A: AWS S3 (Produção)

1. Crie bucket no S3: https://s3.console.aws.amazon.com/
2. Configure CORS no bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. Crie usuário IAM com permissões S3
4. Gere Access Key e Secret Key
5. Atualize `.env` com as credenciais

#### Opção B: MinIO (Desenvolvimento Local)

```bash
# Via Docker
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  quay.io/minio/minio server /data --console-address ":9001"

# Acessar console: http://localhost:9001
# Criar bucket: vitas-uploads
```

Configurar `.env` para MinIO:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_BUCKET_NAME=vitas-uploads
AWS_S3_ENDPOINT=http://localhost:9000
```

## 🏃 Executar

### Desenvolvimento

```bash
npm run start:dev
```

A API estará disponível em:
- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs

### Produção

```bash
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Storage (Upload de Arquivos)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/storage/presigned-url` | Gerar URL assinada para upload |
| `POST` | `/api/storage/confirm/:fileId` | Confirmar upload e processar |
| `GET` | `/api/storage/download/:fileId` | Obter URL de download |
| `GET` | `/api/storage/thumbnail/:fileId` | Obter URL do thumbnail |
| `GET` | `/api/storage/my-files` | Listar meus arquivos |
| `GET` | `/api/storage/case/:caseId/files` | Listar arquivos de um caso |
| `DELETE` | `/api/storage/:fileId` | Deletar arquivo |

### Fluxo de Upload

1. **Cliente solicita URL assinada**:
```bash
POST /api/storage/presigned-url
Content-Type: application/json
Authorization: Bearer {token}

{
  "filename": "foto.jpg",
  "mimeType": "image/jpeg",
  "size": 524288,
  "caseId": "uuid-do-caso",
  "description": "Foto do paciente"
}

# Resposta:
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileId": "uuid-do-arquivo",
  "s3Key": "images/user-id/timestamp-foto.jpg"
}
```

2. **Cliente faz upload direto ao S3**:
```bash
PUT {uploadUrl}
Content-Type: image/jpeg
Body: [binary data]
```

3. **Cliente confirma upload**:
```bash
POST /api/storage/confirm/{fileId}
Authorization: Bearer {token}

# Resposta:
{
  "id": "uuid",
  "originalName": "foto.jpg",
  "s3Key": "images/...",
  "thumbnailS3Key": "images/..._thumb.jpg",
  "size": 524288,
  "mimeType": "image/jpeg",
  "type": "image",
  ...
}
```

## 🎨 Tipos de Arquivos Suportados

| Tipo | MIME Types | Tamanho Máximo |
|------|-----------|----------------|
| **Imagens** | `image/jpeg`, `image/png`, `image/jpg` | 10MB |
| **Documentos** | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | 10MB |

Thumbnails são gerados automaticamente para imagens (300x300px, JPEG).

## 🔒 Segurança

- **Autenticação**: JWT Bearer tokens (implementar guard real)
- **Validação**: Class-validator em todos os DTOs
- **Rate Limiting**: 10 requisições por minuto (Throttler)
- **Presigned URLs**: Expiram em 1 hora
- **Whitelist MIME types**: Apenas tipos permitidos
- **Tamanho máximo**: 10MB por arquivo
- **Soft delete**: Arquivos não são removidos imediatamente
- **Cleanup job**: Arquivos deletados são removidos após 30 dias

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

Exemplo de teste:

```bash
npm test -- storage.service.spec.ts
```

## 🗂️ Estrutura do Projeto

```
backend/
├── src/
│   ├── storage/
│   │   ├── dto/
│   │   │   └── storage.dto.ts
│   │   ├── entities/
│   │   │   └── file.entity.ts
│   │   ├── storage.controller.ts
│   │   ├── storage.service.ts
│   │   ├── storage.service.spec.ts
│   │   └── storage.module.ts
│   ├── app.module.ts
│   └── main.ts
├── test/
├── .env.example
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## 📊 Schema do Banco

### Tabela `files`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Primary key |
| `originalName` | VARCHAR | Nome original do arquivo |
| `filename` | VARCHAR | Nome do arquivo |
| `mimeType` | VARCHAR | Tipo MIME |
| `size` | INTEGER | Tamanho em bytes |
| `type` | ENUM | image, document, other |
| `visibility` | ENUM | public, private |
| `s3Key` | VARCHAR | Chave no S3 |
| `s3Bucket` | VARCHAR | Nome do bucket |
| `thumbnailS3Key` | VARCHAR | Chave do thumbnail (nullable) |
| `description` | TEXT | Descrição (nullable) |
| `userId` | UUID | ID do usuário dono |
| `caseId` | UUID | ID do caso relacionado (nullable) |
| `deleted` | BOOLEAN | Soft delete flag |
| `createdAt` | TIMESTAMP | Data de criação |
| `updatedAt` | TIMESTAMP | Data de atualização |
| `deletedAt` | TIMESTAMP | Data de deleção (nullable) |

## 🔧 Troubleshooting

### Erro: "Cannot connect to database"

Verifique se o PostgreSQL está rodando:

```bash
# Linux
sudo systemctl status postgresql

# macOS
brew services list

# Docker
docker-compose ps
```

### Erro: "AWS credentials not found"

Certifique-se de que as variáveis `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão definidas no `.env`.

### Erro: "Bucket does not exist"

Crie o bucket manualmente no console AWS S3 ou MinIO.

### Upload falha no frontend

1. Verifique CORS no bucket S3
2. Confirme que a presigned URL não expirou (1 hora)
3. Verifique Content-Type no request PUT

## 📝 Scripts Disponíveis

```bash
npm run start          # Iniciar em modo produção
npm run start:dev      # Iniciar em modo desenvolvimento (watch)
npm run start:debug    # Iniciar em modo debug
npm run build          # Build para produção
npm run lint           # Executar ESLint
npm run format         # Formatar código com Prettier
npm run test           # Executar testes
npm run test:watch     # Executar testes em watch mode
npm run test:cov       # Gerar relatório de cobertura
```

## 🌐 Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `NODE_ENV` | Ambiente (development/production) | `development` |
| `PORT` | Porta do servidor | `3000` |
| `DB_HOST` | Host do PostgreSQL | `localhost` |
| `DB_PORT` | Porta do PostgreSQL | `5432` |
| `DB_USERNAME` | Usuário do banco | `vitas` |
| `DB_PASSWORD` | Senha do banco | - |
| `DB_DATABASE` | Nome do banco | `vitas_db` |
| `JWT_SECRET` | Secret para JWT | - |
| `AWS_REGION` | Região AWS | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | - |
| `AWS_S3_BUCKET_NAME` | Nome do bucket | `vitas-uploads` |
| `AWS_S3_ENDPOINT` | Endpoint S3 (MinIO) | - |
| `MAX_FILE_SIZE` | Tamanho máximo (bytes) | `10485760` (10MB) |
| `ALLOWED_FILE_TYPES` | MIME types permitidos | ver `.env.example` |
| `CORS_ORIGIN` | Origin permitido | `http://localhost:5173` |

## 📄 Licença

Propriedade de VITAS - Todos os direitos reservados.

## 👥 Equipe

Desenvolvido pela equipe VITAS.

---

**VITAS** - Sistema de Gestão de Cuidados
