import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from './storage.service';
import { File, FileType, FileVisibility } from './entities/file.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('StorageService', () => {
  let service: StorageService;
  let repository: Repository<File>;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        AWS_REGION: 'us-east-1',
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        AWS_S3_BUCKET_NAME: 'test-bucket',
        MAX_FILE_SIZE: '10485760',
        ALLOWED_FILE_TYPES: 'image/jpeg,image/png,application/pdf',
      };
      return config[key];
    }),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(File),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    repository = module.get<Repository<File>>(getRepositoryToken(File));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPresignedUploadUrl', () => {
    it('should create presigned URL for valid file', async () => {
      const userId = 'user-123';
      const dto = {
        filename: 'test.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
      };

      const mockFile = {
        id: 'file-123',
        s3Key: 'images/user-123/test.jpg',
        ...dto,
      };

      mockRepository.create.mockReturnValue(mockFile);
      mockRepository.save.mockResolvedValue(mockFile);

      const result = await service.createPresignedUploadUrl(userId, dto);

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('fileId', 'file-123');
      expect(result).toHaveProperty('s3Key');
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          originalName: dto.filename,
          mimeType: dto.mimeType,
        }),
      );
    });

    it('should reject invalid MIME type', async () => {
      const userId = 'user-123';
      const dto = {
        filename: 'test.exe',
        mimeType: 'application/exe',
      };

      await expect(
        service.createPresignedUploadUrl(userId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject file too large', async () => {
      const userId = 'user-123';
      const dto = {
        filename: 'large.jpg',
        mimeType: 'image/jpeg',
        size: 20 * 1024 * 1024, // 20MB
      };

      await expect(
        service.createPresignedUploadUrl(userId, dto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmUpload', () => {
    it('should confirm upload for existing file', async () => {
      const fileId = 'file-123';
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        userId,
        s3Key: 'images/user-123/test.jpg',
        type: FileType.IMAGE,
      };

      mockRepository.findOne.mockResolvedValue(mockFile);
      mockRepository.save.mockResolvedValue(mockFile);

      // Mock S3 client (simplified - in real test use mock AWS SDK)
      const result = await service.confirmUpload(fileId, userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: fileId, userId },
      });
    });

    it('should throw not found for non-existent file', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.confirmUpload('file-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listUserFiles', () => {
    it('should list user files', async () => {
      const userId = 'user-123';
      const mockFiles = [
        { id: 'file-1', userId, deleted: false },
        { id: 'file-2', userId, deleted: false },
      ];

      mockRepository.find.mockResolvedValue(mockFiles);

      const result = await service.listUserFiles(userId);

      expect(result).toEqual(mockFiles);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { userId, deleted: false },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('deleteFile', () => {
    it('should soft delete file', async () => {
      const fileId = 'file-123';
      const userId = 'user-123';

      const mockFile = {
        id: fileId,
        userId,
        deleted: false,
      };

      mockRepository.findOne.mockResolvedValue(mockFile);
      mockRepository.save.mockResolvedValue({
        ...mockFile,
        deleted: true,
      });

      await service.deleteFile(fileId, userId);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted: true,
          deletedAt: expect.any(Date),
        }),
      );
    });

    it('should throw not found for non-existent file', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteFile('file-123', 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
