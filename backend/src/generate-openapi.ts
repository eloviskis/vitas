import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as path from 'path';

async function generateOpenApi() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('VITAS API')
    .setDescription(`
# VITAS - Plataforma de Gestão de Chamados de Manutenção

API REST para conectar clientes que precisam de serviços de manutenção com profissionais qualificados.

## Principais funcionalidades

### 🔐 Autenticação
- Registro e login com JWT
- Roles: cliente, profissional, operador, admin

### 🛠️ Chamados
- Criar chamados com fotos/vídeos
- Triagem automática com scoring
- Matching com profissionais próximos
- Acompanhamento de status

### 📅 Agendamento
- Visualizar slots disponíveis
- Reservar horários
- Cancelar e reagendar (até 24h antes)

### 💰 Orçamentos e Pagamentos
- Profissionais enviam orçamentos
- Pagamento via PIX ou cartão
- Confirmação automática

### ⭐ Avaliações
- Clientes avaliam serviços (1-5 estrelas)
- Cálculo de rating médio do profissional
- Follow-ups automatizados (D+7, D+30, D+90)

### 🔔 Notificações
- Push notifications via Firebase FCM
- Notificações de novos chamados, orçamentos, mensagens

### 📁 Armazenamento
- Upload de fotos e vídeos (max 10MB)
- S3 em produção, filesystem em dev
- Signed URLs para segurança
    `)
    .setVersion('1.0.0')
    .setContact(
      'VITAS Support',
      'https://github.com/eloviskis/vitas',
      'support@vitas.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido via /auth/login',
      },
      'JWT'
    )
    .addServer('http://localhost:3000', 'Desenvolvimento')
    .addServer('https://api.vitas.com', 'Produção')
    .addTag('Autenticação', 'Login, registro e gestão de sessão')
    .addTag('Chamados', 'CRUD de chamados de manutenção')
    .addTag('Triagem', 'Algoritmo de scoring e matching')
    .addTag('Agendamento', 'Gestão de agenda e slots')
    .addTag('Orçamentos', 'Criação e aprovação de orçamentos')
    .addTag('Pagamentos', 'Processamento PIX e cartão')
    .addTag('Mensagens', 'Chat entre cliente e profissional')
    .addTag('Avaliações', 'Ratings e feedbacks')
    .addTag('Profissionais', 'Perfis e especialidades')
    .addTag('Notificações', 'Push notifications FCM')
    .addTag('Armazenamento', 'Upload de arquivos')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Create docs/api directory if it doesn't exist
  const docsDir = path.join(__dirname, '..', '..', 'docs', 'api');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Write OpenAPI JSON
  const outputPath = path.join(docsDir, 'openapi.json');
  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`✅ OpenAPI specification generated at: ${outputPath}`);
  console.log(`📊 Total paths: ${Object.keys(document.paths || {}).length}`);
  console.log(`📦 Total schemas: ${Object.keys(document.components?.schemas || {}).length}`);

  await app.close();
  process.exit(0);
}

generateOpenApi().catch((error) => {
  console.error('❌ Error generating OpenAPI:', error);
  process.exit(1);
});
