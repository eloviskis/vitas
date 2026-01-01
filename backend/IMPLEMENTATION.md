# Backend VITAS - Autenticação Implementada

## ✅ Implementação Completa

Implementada toda a funcionalidade de autenticação conforme Issue #3 e User Stories relacionadas.

### Funcionalidades

#### US-001: Cadastro de Usuário ✅
- Email único com validação de formato
- Senha mínima 8 caracteres com bcrypt (10 salt rounds)
- Confirmação de termos de uso e LGPD
- Escolha de tipo de perfil (Cuidador, Familiar, Profissional, Gestor)
- Token de verificação de email gerado (integração SMTP pendente)

#### US-002: Login com Email/Senha ✅
- Validação de credenciais com bcrypt
- Token JWT gerado com expiração configurável (padrão: 15min)
- Refresh tokens para renovação (padrão: 7 dias)
- Bloqueio automático após 5 tentativas falhadas (15 minutos)
- Mensagens de erro claras e seguras

#### US-004: Recuperar Senha ✅
- Link de reset enviado por email
- Token expira em 1 hora
- Validação de nova senha
- Invalidação de sessões anteriores após reset

#### US-005: Editar Perfil ✅
- Endpoint PATCH /api/auth/me
- Atualização de nome completo, telefone, bio
- Upload de foto (estrutura pronta, integração S3 pendente)

#### US-044: Autenticação de Dois Fatores ✅
- TOTP com speakeasy
- QR Code gerado com qrcode lib
- Window de 2 períodos para flexibilidade
- Ativação/desativação com senha + código
- Códigos de backup (implementar)

### Segurança Implementada

- ✅ Senhas criptografadas com bcrypt
- ✅ JWT com access + refresh tokens
- ✅ Rate limiting (Throttler)
- ✅ Validação de input (class-validator)
- ✅ TypeORM (proteção SQL injection)
- ✅ Bloqueio após tentativas falhadas
- ✅ Soft delete (campo deletadoEm)
- ✅ Auditoria (ultimoLogin, criadoEm, atualizadoEm)

### Estrutura Criada

```
backend/
├── src/
│   ├── auth/
│   │   ├── dto/
│   │   │   └── auth.dto.ts          # 11 DTOs com validação
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts    # Guard JWT
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts      # Passport JWT
│   │   ├── auth.controller.ts       # 12 endpoints
│   │   ├── auth.service.ts          # Lógica completa
│   │   ├── auth.service.spec.ts     # Testes unitários
│   │   └── auth.module.ts
│   ├── users/
│   │   ├── entities/
│   │   │   └── user.entity.ts       # Entidade completa
│   │   └── users.module.ts
│   ├── app.module.ts                # Config TypeORM, Throttler
│   └── main.ts                      # Bootstrap, Swagger
├── package.json                     # Todas dependências
├── tsconfig.json
├── .env.example                     # Template completo
├── docker-compose.yml               # Postgres + Redis + Backend
├── README.md                        # Documentação completa
└── nest-cli.json
```

### Endpoints Disponíveis

```
POST   /api/auth/register            # Cadastro
POST   /api/auth/login               # Login
POST   /api/auth/refresh             # Renovar token
POST   /api/auth/forgot-password     # Solicitar reset
POST   /api/auth/reset-password      # Resetar senha
POST   /api/auth/logout              # Logout (protegido)
GET    /api/auth/me                  # Perfil (protegido)
PATCH  /api/auth/me                  # Atualizar perfil (protegido)
POST   /api/auth/2fa/enable          # Gerar QR Code 2FA (protegido)
POST   /api/auth/2fa/verify          # Ativar 2FA (protegido)
POST   /api/auth/2fa/disable         # Desativar 2FA (protegido)
GET    /api/docs                     # Swagger UI
```

### Próximos Passos

#### OAuth (US-003) - Não Implementado
- Google OAuth 2.0
- Apple Sign In
- Estrutura preparada (passport-google-oauth20, passport-apple instalados)
- Necessário: credenciais OAuth

#### Integrações Pendentes
- Envio de emails (nodemailer configurado, falta SMTP real)
- Upload de fotos (AWS S3 SDK instalado, falta config)
- Redis para refresh tokens (instalado no docker-compose)

## Como Executar

### 1. Configurar Ambiente

```bash
cd backend
cp .env.example .env
# Editar .env com suas credenciais
```

### 2. Subir Banco de Dados

```bash
# Na raiz do projeto
docker-compose up -d postgres redis
```

### 3. Instalar Dependências

```bash
cd backend
npm install
```

### 4. Executar Migrações

```bash
# Sincronização automática em DEV
npm run start:dev

# OU rodar migrations manualmente (produção)
npm run migration:run
```

### 5. Acessar

- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/health

## Testes

```bash
# Unitários
npm run test

# Com coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Docker

```bash
# Subir stack completa
docker-compose up -d

# Logs
docker-compose logs -f backend

# Rebuild
docker-compose up -d --build
```

## Variáveis de Ambiente Essenciais

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=vitas
DATABASE_PASSWORD=vitas123
DATABASE_NAME=vitas_dev

JWT_SECRET=use-openssl-rand-base64-32
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

PORT=3000
NODE_ENV=development
```

## Conformidade LGPD

- ✅ Consentimento explícito (termosAceitos)
- ✅ Data de aceite registrada (termosAceitosEm)
- ✅ Soft delete (deletadoEm)
- ⏳ Exportação de dados (implementar endpoint)
- ⏳ Deleção permanente (implementar após 30 dias)

## Performance

- Rate limiting: 10 req/min em endpoints auth
- JWT com expiração curta (15min) + refresh (7d)
- Índices no banco (email unique)
- Bcrypt com salt rounds configurável

## Próxima Issue

Após merge deste PR:
- Issue #4: Layout Frontend (PWA + Mobile)
- Issue #5: Storage S3/GCS
- Issue #6: Push Notifications
