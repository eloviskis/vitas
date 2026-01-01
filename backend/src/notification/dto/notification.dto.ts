import { IsString, IsEnum, IsJSON, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/notification.entity';
import { DeviceType } from '../entities/device-token.entity';

export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'Token do device (FCM, Web Push)' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'ID único do device' })
  @IsString()
  deviceId: string;

  @ApiProperty({ enum: DeviceType, description: 'Tipo de device' })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiPropertyOptional({ description: 'Nome do device (ex: iPhone 13)' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class SendNotificationDto {
  @ApiProperty({ description: 'ID do usuário' })
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: NotificationType, description: 'Tipo de notificação' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Título da notificação' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Dados contextuais (JSON)' })
  @IsOptional()
  data?: Record<string, any>;
}

export class BroadcastNotificationDto {
  @ApiProperty({ enum: NotificationType, description: 'Tipo de notificação' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ description: 'Título da notificação' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Mensagem da notificação' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ description: 'Dados contextuais (JSON)' })
  @IsOptional()
  data?: Record<string, any>;
}

export class MarkAsReadDto {
  @ApiProperty({ description: 'ID da notificação' })
  @IsUUID()
  notificationId: string;
}
