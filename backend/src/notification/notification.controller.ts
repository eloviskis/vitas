import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import {
  RegisterDeviceTokenDto,
  SendNotificationDto,
  BroadcastNotificationDto,
  MarkAsReadDto,
} from './dto/notification.dto';
import { Notification } from './entities/notification.entity';
import { DeviceToken } from './entities/device-token.entity';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('register-device')
  @ApiOperation({ summary: 'Registrar token de device para push' })
  @ApiResponse({ status: 201, description: 'Device registrado', type: DeviceToken })
  async registerDevice(
    @Request() req,
    @Body() dto: RegisterDeviceTokenDto,
  ): Promise<DeviceToken> {
    const userId = req.user?.id || 'mock-user-id';
    return this.notificationService.registerDeviceToken(userId, dto);
  }

  @Post('send')
  @ApiOperation({ summary: 'Enviar notificação para usuário' })
  @ApiResponse({ status: 201, description: 'Notificação enviada', type: Notification })
  async send(@Body() dto: SendNotificationDto): Promise<Notification> {
    return this.notificationService.sendNotification(dto);
  }

  @Post('broadcast')
  @ApiOperation({ summary: 'Enviar notificação em broadcast' })
  @ApiResponse({
    status: 200,
    description: 'Número de usuários que receberam',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  async broadcast(@Body() dto: BroadcastNotificationDto): Promise<{ count: number }> {
    const count = await this.notificationService.broadcastNotification(dto);
    return { count };
  }

  @Get('my-notifications')
  @ApiOperation({ summary: 'Obter minhas notificações' })
  @ApiResponse({ status: 200, description: 'Lista de notificações', type: [Notification] })
  async getMyNotifications(@Request() req): Promise<Notification[]> {
    const userId = req.user?.id || 'mock-user-id';
    return this.notificationService.getUserNotifications(userId);
  }

  @Post('mark-as-read/:notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async markAsRead(
    @Request() req,
    @Param('notificationId') notificationId: string,
  ): Promise<void> {
    const userId = req.user?.id || 'mock-user-id';
    await this.notificationService.markAsRead(notificationId, userId);
  }

  @Post('mark-all-as-read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marcar todas notificações como lidas' })
  async markAllAsRead(@Request() req): Promise<void> {
    const userId = req.user?.id || 'mock-user-id';
    await this.notificationService.markAllAsRead(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obter contagem de não-lidas' })
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const userId = req.user?.id || 'mock-user-id';
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar notificação' })
  async delete(
    @Request() req,
    @Param('notificationId') notificationId: string,
  ): Promise<void> {
    const userId = req.user?.id || 'mock-user-id';
    await this.notificationService.deleteNotification(notificationId, userId);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Listar meus devices' })
  @ApiResponse({ status: 200, description: 'Lista de devices', type: [DeviceToken] })
  async getDevices(@Request() req): Promise<DeviceToken[]> {
    const userId = req.user?.id || 'mock-user-id';
    return this.notificationService.getUserDevices(userId);
  }

  @Delete('devices/:tokenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover device token' })
  async removeDevice(
    @Request() req,
    @Param('tokenId') tokenId: string,
  ): Promise<void> {
    const userId = req.user?.id || 'mock-user-id';
    await this.notificationService.removeDeviceToken(tokenId, userId);
  }
}
