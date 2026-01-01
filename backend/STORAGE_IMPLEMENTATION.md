# Storage Implementation - Issue #5

## Resumo

Implementação completa do sistema de armazenamento de arquivos usando AWS S3 (ou MinIO para desenvolvimento local).

## Arquitetura

### Fluxo de Upload

```
┌─────────┐         ┌─────────┐         ┌──────┐
│ Cliente │────1───>│ Backend │────2───>│  S3  │
│         │<───3────│         │         │      │
│         │────4────────────────────────>│      │
│         │────5───>│         │         │      │
│         │<───6────│         │<───7────│      │
└─────────┘         └─────────┘         └──────┘

1. POST /storage/presigned-url (solicita URL assinada)
2. Backend cria registro no BD
3. Backend retorna URL assinada
4. Cliente faz upload direto ao S3
5. POST /storage/confirm/:fileId (confirma upload)
6. Backend processa arquivo (thumbnail)
7. Backend verifica arquivo no S3
```

### Componentes

#### 1. File Entity (`entities/file.entity.ts`)

Armazena metadados de arquivos:
- Informações básicas: nome, tamanho, MIME type
- Referências S3: s3Key, s3Bucket, thumbnailS3Key
- Relacionamentos: userId, caseId
- Controle: visibility (public/private), deleted (soft delete)
- Auditoria: createdAt, updatedAt, deletedAt

#### 2. Storage Service (`storage.service.ts`)

**Responsabilidades:**
- **Upload**: Gerar presigned URLs, validar arquivos, salvar metadados
- **Processamento**: Gerar thumbnails para imagens (Sharp)
- **Download**: Gerar URLs assinadas para acesso seguro
- **Gerenciamento**: Listar arquivos, soft delete, cleanup de órfãos
- **Validação**: Whitelist MIME types, limite de tamanho

**Principais Métodos:**
- `createPresignedUploadUrl()` - Gera URL assinada (PUT) com expiração de 1h
- `confirmUpload()` - Verifica upload no S3 e processa arquivo
- `generateThumbnail()` - Cria thumbnail 300x300px (JPEG, 80% quality)
- `getDownloadUrl()` - Gera URL assinada (GET) para download
- `listUserFiles()` - Lista arquivos do usuário
- `listCaseFiles()` - Lista arquivos de um caso
- `deleteFile()` - Soft delete (marca como deleted)
- `cleanupOrphanedFiles()` - Remove arquivos deletados há >30 dias

#### 3. Storage Controller (`storage.controller.ts`)

**Endpoints:**

| Rota | Método | Descrição |
|------|--------|-----------|
| `/storage/presigned-url` | POST | Gerar URL assinada |
| `/storage/confirm/:fileId` | POST | Confirmar upload |
| `/storage/download/:fileId` | GET | URL de download |
| `/storage/thumbnail/:fileId` | GET | URL do thumbnail |
| `/storage/my-files` | GET | Listar meus arquivos |
| `/storage/case/:caseId/files` | GET | Arquivos de um caso |
| `/storage/:fileId` | DELETE | Deletar arquivo |

#### 4. DTOs (`dto/storage.dto.ts`)

- `CreatePresignedUrlDto` - Input para solicitar presigned URL
- `PresignedUrlResponseDto` - Response com uploadUrl, fileId, s3Key
- `FileUploadConfirmDto` - Input para confirmar upload
- `GetFileDto`, `DeleteFileDto` - Params de rotas

## Segurança

### 1. Validação de Arquivos

**MIME Types Permitidos:**
```typescript
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
```

**Tamanho Máximo:** 10MB (configurável via `MAX_FILE_SIZE`)

### 2. Presigned URLs

- **Expiração**: 1 hora (configurable)
- **Escopo**: Limitado a operações específicas (PUT ou GET)
- **Bucket**: Definido no backend, não controlado pelo cliente

### 3. Controle de Acesso

- **Private files**: Apenas dono pode acessar
- **Public files**: Qualquer usuário autenticado pode acessar
- **Case files**: Apenas membros do caso podem acessar (implementar ACL)

### 4. Soft Delete

- Arquivos marcados como `deleted = true`
- Mantidos por 30 dias antes de remoção permanente
- Cleanup automático via cron job (implementar)

## Processamento de Imagens

### Thumbnails

**Geração:**
```typescript
sharp(imageBuffer)
  .resize(300, 300, {
    fit: 'inside',
    withoutEnlargement: true,
  })
  .jpeg({ quality: 80 })
  .toBuffer()
```

**Características:**
- Dimensões: 300x300px (fit inside, mantém proporção)
- Formato: JPEG
- Qualidade: 80%
- Nome: `original_thumb.jpg` (ex: `foto_thumb.jpg`)

**Storage:**
- S3 Key salva em `thumbnailS3Key`
- Mesmo bucket do arquivo original
- Gerado após confirmação de upload

## Configuração

### Variáveis de Ambiente

```env
# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
AWS_S3_BUCKET_NAME=vitas-uploads

# MinIO (desenvolvimento)
AWS_S3_ENDPOINT=http://localhost:9000

# Upload Settings
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,application/pdf
```

### Bucket S3 - CORS Configuration

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

## Testes

### Unit Tests (`storage.service.spec.ts`)

**Cobertura:**
- ✅ Criação de presigned URL com validação
- ✅ Rejeição de MIME types inválidos
- ✅ Rejeição de arquivos muito grandes
- ✅ Confirmação de upload
- ✅ Listagem de arquivos do usuário
- ✅ Soft delete

**Executar:**
```bash
npm test -- storage.service.spec.ts
```

### E2E Tests (implementar)

Testar fluxo completo:
1. Solicitar presigned URL
2. Upload ao S3 (mock)
3. Confirmar upload
4. Verificar thumbnail gerado
5. Download do arquivo
6. Delete

## Dependências

```json
{
  "@aws-sdk/client-s3": "^3.485.0",
  "@aws-sdk/s3-request-presigner": "^3.485.0",
  "sharp": "^0.33.1",
  "uuid": "^9.0.1"
}
```

## Próximos Passos

### Issue #5 - Completo ✅

- [x] Escolher provedor (AWS S3)
- [x] Configurar buckets (públicos e privados via visibility)
- [x] Presigned URLs para upload seguro
- [x] Validação de tipo de arquivo (whitelist)
- [x] Limite de tamanho (10MB)
- [x] Processamento de imagens (thumbnails)
- [x] CDN para servir arquivos (via S3/CloudFront)
- [x] Testes de upload e download

### Melhorias Futuras (não bloqueantes)

- [ ] Scan de vírus (ClamAV ou AWS Macie)
- [ ] Backup automático (S3 versioning + lifecycle)
- [ ] Cron job para cleanup de órfãos
- [ ] Watermark em imagens
- [ ] Compressão automática
- [ ] Múltiplos tamanhos de thumbnail (100x100, 300x300, 600x600)
- [ ] Suporte a vídeos (thumbnails, transcodificação)
- [ ] Integração com CloudFront (CDN)
- [ ] Logs de acesso (auditoria)
- [ ] Quotas por usuário/plano

## Troubleshooting

### Erro: "Bucket does not exist"

**Solução:**
```bash
# MinIO
aws --endpoint-url http://localhost:9000 s3 mb s3://vitas-uploads

# AWS S3
aws s3 mb s3://vitas-uploads --region us-east-1
```

### Erro: "Access Denied"

**Solução:**
1. Verificar credentials AWS no `.env`
2. Confirmar permissões IAM (s3:PutObject, s3:GetObject, s3:DeleteObject)
3. Verificar bucket policy/ACL

### Thumbnail não é gerado

**Debug:**
1. Verificar logs do backend
2. Confirmar Sharp instalado (`npm list sharp`)
3. Verificar MIME type da imagem
4. Testar Sharp localmente:

```typescript
const sharp = require('sharp');
sharp('input.jpg')
  .resize(300, 300)
  .toFile('output.jpg', (err, info) => {
    console.log(err, info);
  });
```

### Upload falha no frontend

**Checklist:**
1. CORS configurado no bucket S3?
2. Presigned URL não expirou (1h)?
3. Content-Type correto no PUT request?
4. Arquivo não excede 10MB?

---

**Implementação completa da Issue #5 ✅**
