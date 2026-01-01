import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as admin from 'firebase-admin';
import { Notification, NotificationType, NotificationStatus } from './entities/notification.entity';
import { DeviceToken, DeviceType } from './entities/device-token.entity';
import {
  SendNotificationDto,
  BroadcastNotificationDto,
  RegisterDeviceTokenDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseApp: admin.app.App;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(DeviceToken)
    private readonly deviceTokenRepository: Repository<DeviceToken>,
    private readonly configService: ConfigService,
  ) {
    this.initializeFirebase();
  }

  /**
   * Inicializa Firebase Admin SDK
   */
  private initializeFirebase(): void {
    try {
      const firebaseConfig = this.configService.get('FIREBASE_CONFIG');
      
      if (!firebaseConfig) {
        this.logger.warn(
          'FIREBASE_CONFIG não configurado. Push Notifications via FCM desabilitado.',
        );
        return;
      }

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(firebaseConfig)),
      });

      this.logger.log('Firebase Admin SDK inicializado');
    } catch (error) {
      this.logger.error(`Erro ao inicializar Firebase: ${error.message}`);
    }
  }

  /**
   * Registra token de device para receber notificações
   */
  async registerDeviceToken(
    userId: string,
    dto: RegisterDeviceTokenDto,
  ): Promise<DeviceToken> {
    this.logger.log(`Registering device token for user ${userId}`);

    // Remover tokens antigos do mesmo device
    await this.deviceTokenRepository.delete({
      userId,
      deviceId: dto.deviceId,
    });

    const deviceToken = this.deviceTokenRepository.create({
      userId,
      token: dto.token,
      deviceId: dto.deviceId,
      deviceType: dto.deviceType,
      deviceName: dto.deviceName,
      lastUsedAt: new Date(),
    });

    return this.deviceTokenRepository.save(deviceToken);
  }

  /**
   * Enviar notificação para usuário específico
   */
  async sendNotification(dto: SendNotificationDto): Promise<Notification> {
    this.logger.log(
      `Sending ${dto.type} notification to user ${dto.userId}`,
    );

    // Criar registro no BD
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data ? JSON.stringify(dto.data) : null,
      status: NotificationStatus.PENDING,
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // Enviar via push
    await this.sendPushNotification(dto.userId, savedNotification);

    return savedNotification;
  }

  /**
   * Enviar notificação para todos os usuários (broadcast)
   */
  async broadcastNotification(dto: BroadcastNotificationDto): Promise<number> {
    this.logger.log(`Broadcasting ${dto.type} notification to all users`);

    const allUsers = await this.deviceTokenRepository
      .createQueryBuilder('dt')
      .select('DISTINCT dt.userId')
      .getRawMany();

    let sentCount = 0;

    for (const { dt_userId } of allUsers) {
      try {
        await this.sendNotification({
          userId: dt_userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          data: dto.data,
        });
        sentCount++;
      } catch (error) {
        this.logger.error(`Failed to send broadcast to user ${dt_userId}: ${error.message}`);
      }
    }

    this.logger.log(`Broadcast sent to ${sentCount} users`);
    return sentCount;
  }

  /**
   * Enviar notificação push via FCM/Web Push
   */
  private async sendPushNotification(
    userId: string,
    notification: Notification,
  ): Promise<void> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: { userId, isActive: true },
    });

    if (deviceTokens.length === 0) {
      this.logger.warn(`No active device tokens for user ${userId}`);
      return;
    }

    const tokens = deviceTokens.map((dt) => dt.token);

    try {
      // Enviar via FCM (Android, iOS, Web)
      const message = {
        notification: {
          title: notification.title,
          body: notification.message,
        },
        data: notification.data
          ? JSON.parse(notification.data)
          : { notificationId: notification.id },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.message,
            icon: '/vitas-logo.png',
            badge: '/vitas-badge.png',
          },
          data: {
            notificationId: notification.id,
            type: notification.type,
          },
        },
      };

      // Enviar multicast (vários devices)
      const response = await admin.messaging().sendMulticast(message, tokens);

      this.logger.log(
        `Sent ${response.successCount} notifications, ${response.failureCount} failed`,
      );

      // Atualizar status
      if (response.successCount > 0) {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
        await this.notificationRepository.save(notification);
      }

      // Remover tokens inválidos
      if (response.failureCount > 0) {
        const failedTokens = response.responses
          .map((resp, idx) => (resp.success ? null : tokens[idx]))
          .filter(Boolean);

        if (failedTokens.length > 0) {
          await this.deviceTokenRepository.delete({
            token: In(failedTokens),
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error sending push notification: ${error.message}`);
      notification.status = NotificationStatus.FAILED;
      notification.failureReason = error.message;
      await this.notificationRepository.save(notification);
    }
  }

  /**
   * Listar notificações do usuário
   */
  async getUserNotifications(
    userId: string,
    limit = 50,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new BadRequestException('Notificação não encontrada');
    }

    notification.status = NotificationStatus.READ;
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);
  }

  /**
   * Marcar todas as notificações como lidas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository.update(
      { userId, status: NotificationStatus.SENT },
      { status: NotificationStatus.READ, readAt: new Date() },
    );

    return result.affected || 0;
  }

  /**
   * Obter contagem de notificações não lidas
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, status: NotificationStatus.SENT },
    });
  }

  /**
   * Deletar notificação
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });

    if (!result.affected) {
      throw new BadRequestException('Notificação não encontrada');
    }
  }

  /**
   * Listar device tokens do usuário
   */
  async getUserDevices(userId: string): Promise<DeviceToken[]> {
    return this.deviceTokenRepository.find({
      where: { userId },
      order: { lastUsedAt: 'DESC' },
    });
  }

  /**
   * Remover device token
   */
  async removeDeviceToken(tokenId: string, userId: string): Promise<void> {
    const result = await this.deviceTokenRepository.delete({
      id: tokenId,
      userId,
    });

    if (!result.affected) {
      throw new BadRequestException('Device token não encontrado');
    }
  }
}
