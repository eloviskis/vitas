import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService, NotificationPayload } from './notification.service';

class SendNotificationDto {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

class SendMultipleDto {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

class SendToTopicDto {
  topic: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@ApiTags('Notificações')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('send')
  @ApiOperation({ summary: 'Enviar notificação para um dispositivo', description: 'Envia push notification para um token FCM específico' })
  @ApiResponse({ status: 200, description: 'Notificação enviada' })
  @ApiResponse({ status: 400, description: 'Token inválido ou Firebase não configurado' })
  async sendNotification(@Body() dto: SendNotificationDto) {
    const payload: NotificationPayload = {
      title: dto.title,
      body: dto.body,
      data: dto.data,
      imageUrl: dto.imageUrl,
    };

    const success = await this.notificationService.sendToDevice(
      dto.token,
      payload,
    );

    return {
      success,
      message: success ? 'Notification sent' : 'Failed to send notification',
    };
  }

  @Post('send-multiple')
  async sendMultiple(@Body() dto: SendMultipleDto) {
    const payload: NotificationPayload = {
      title: dto.title,
      body: dto.body,
      data: dto.data,
      imageUrl: dto.imageUrl,
    };

    const result = await this.notificationService.sendToMultipleDevices(
      dto.tokens,
      payload,
    );

    return {
      success: result.success > 0,
      successCount: result.success,
      failureCount: result.failure,
      total: dto.tokens.length,
    };
  }

  @Post('send-to-topic')
  async sendToTopic(@Body() dto: SendToTopicDto) {
    const payload: NotificationPayload = {
      title: dto.title,
      body: dto.body,
      data: dto.data,
      imageUrl: dto.imageUrl,
    };

    const success = await this.notificationService.sendToTopic(
      dto.topic,
      payload,
    );

    return {
      success,
      message: success
        ? `Notification sent to topic ${dto.topic}`
        : 'Failed to send notification',
    };
  }
}
