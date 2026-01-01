import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationService } from './notification.service';
import { Notification, NotificationType } from './entities/notification.entity';
import { DeviceToken, DeviceType } from './entities/device-token.entity';

describe('NotificationService', () => {
  let service: NotificationService;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  const mockDeviceTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'FIREBASE_CONFIG') return null;
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: 'NotificationRepository',
          useValue: mockNotificationRepository,
        },
        {
          provide: 'DeviceTokenRepository',
          useValue: mockDeviceTokenRepository,
        },
        {
          provide: 'ConfigService',
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register device token', async () => {
    const userId = 'user-123';
    const dto = {
      token: 'fcm-token-123',
      deviceId: 'device-123',
      deviceType: DeviceType.ANDROID,
      deviceName: 'Samsung S21',
    };

    mockDeviceTokenRepository.create.mockReturnValue(dto);
    mockDeviceTokenRepository.save.mockResolvedValue(dto);

    const result = await service.registerDeviceToken(userId, dto);

    expect(mockDeviceTokenRepository.create).toHaveBeenCalled();
    expect(mockDeviceTokenRepository.save).toHaveBeenCalled();
  });
});
