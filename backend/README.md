# Backend - VITAS API

## Descrição
API REST do projeto VITAS construída com NestJS + TypeScript + PostgreSQL.

## Stack Tecnológica
- **Framework**: NestJS 10
- **Linguagem**: TypeScript 5
- **Banco de Dados**: PostgreSQL 15
- **ORM**: TypeORM
- **Autenticação**: JWT + Passport
- **Validação**: class-validator
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest

## Funcionalidades Implementadas

### Autenticação (Issue #3)
- ✅ Cadastro com email/senha
- ✅ Login com JWT (access + refresh tokens)
- ✅ OAuth (Google, Apple)
- ✅ Recuperação de senha
- ✅ Gerenciamento de perfil
- ✅ 2FA (TOTP)
- ✅ Rate limiting
- ✅ Auditoria de logins

## Pré-requisitos
- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

## Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

## Variáveis de Ambiente

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=vitas
DATABASE_PASSWORD=vitas123
DATABASE_NAME=vitas_dev

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-aqui
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# OAuth Google
GOOGLE_CLIENT_ID=seu-google-client-id
GOOGLE_CLIENT_SECRET=seu-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# OAuth Apple
APPLE_CLIENT_ID=seu-apple-client-id
APPLE_TEAM_ID=seu-apple-team-id
APPLE_KEY_ID=seu-apple-key-id
APPLE_PRIVATE_KEY_PATH=./certs/apple-private-key.p8
APPLE_CALLBACK_URL=http://localhost:3000/auth/apple/callback

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
EMAIL_FROM=noreply@vitas.com

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:8080

# Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_S3_BUCKET=vitas-uploads
```

## Executar Aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Debug
npm run start:debug
```

## Executar com Docker

```bash
# Subir PostgreSQL
docker-compose up -d postgres

# Subir toda a stack
docker-compose up -d
```

## Migrações

```bash
# Gerar migração
npm run migration:generate -- -n NomeDaMigracao

# Executar migrações
npm run migration:run

# Reverter última migração
npm run migration:revert
```

## Testes

```bash
# Unitários
npm run test

# E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## Documentação API

Após iniciar o servidor, acesse:
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs-json

## Estrutura do Projeto

```
backend/
├── src/
│   ├── auth/              # Módulo de autenticação
│   │   ├── dto/           # Data Transfer Objects
│   │   ├── entities/      # Entidades TypeORM
│   │   ├── guards/        # Guards de autenticação
│   │   ├── strategies/    # Passport strategies
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── users/             # Módulo de usuários
│   ├── config/            # Configurações
│   ├── common/            # Utilitários compartilhados
│   ├── database/          # Configuração do banco
│   ├── app.module.ts
│   └── main.ts
├── test/                  # Testes E2E
├── package.json
├── tsconfig.json
└── README.md
```

## Endpoints Principais

### Autenticação
- `POST /auth/register` - Cadastro
- `POST /auth/login` - Login
- `POST /auth/refresh` - Renovar token
- `POST /auth/forgot-password` - Solicitar reset de senha
- `POST /auth/reset-password` - Resetar senha
- `GET /auth/google` - OAuth Google
- `GET /auth/apple` - OAuth Apple
- `POST /auth/logout` - Logout

### Perfil
- `GET /users/me` - Perfil atual
- `PATCH /users/me` - Atualizar perfil
- `POST /users/me/avatar` - Upload de foto
- `POST /users/me/2fa/enable` - Ativar 2FA
- `POST /users/me/2fa/verify` - Verificar 2FA
- `POST /users/me/2fa/disable` - Desativar 2FA

## Segurança

- Senhas criptografadas com bcrypt (salt rounds: 10)
- JWT com tokens de curta duração (15min) + refresh tokens (7 dias)
- Rate limiting (10 requisições/minuto para auth endpoints)
- CORS configurado
- Helmet para headers de segurança
- Validação de input com class-validator
- SQL injection prevention (TypeORM)
- XSS protection

## LGPD

- Consentimento no cadastro
- Exportação de dados pessoais
- Deleção de conta
- Auditoria de acessos
- Logs de ações sensíveis

## Monitoramento

- Logs estruturados (JSON)
- Health check: `GET /health`
- Métricas de performance
- Rastreamento de erros

## Licença
UNLICENSED - Proprietary
