"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
let StorageService = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.useS3 = this.configService.get('STORAGE_TYPE') === 's3';
        this.bucketName = this.configService.get('S3_BUCKET_NAME') || '';
        this.localStoragePath = this.configService.get('STORAGE_LOCAL_PATH') || './uploads';
        if (this.useS3) {
            this.s3Client = new client_s3_1.S3Client({
                region: this.configService.get('AWS_REGION') || 'us-east-1',
                credentials: {
                    accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID') || '',
                    secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY') || '',
                },
            });
        }
        else {
            // Ensure local storage directory exists
            this.ensureLocalStorageDir();
        }
    }
    async ensureLocalStorageDir() {
        try {
            await fs.mkdir(this.localStoragePath, { recursive: true });
        }
        catch (error) {
            console.error('Error creating local storage directory:', error);
        }
    }
    async uploadFile(file, folder = 'general') {
        const fileKey = `${folder}/${(0, uuid_1.v4)()}${path.extname(file.originalname)}`;
        if (this.useS3) {
            return this.uploadToS3(file, fileKey);
        }
        else {
            return this.uploadToLocal(file, fileKey);
        }
    }
    async uploadToS3(file, fileKey) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: fileKey,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        await this.s3Client.send(command);
        const url = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;
        return { url, key: fileKey };
    }
    async uploadToLocal(file, fileKey) {
        const filePath = path.join(this.localStoragePath, fileKey);
        const fileDir = path.dirname(filePath);
        // Ensure directory exists
        await fs.mkdir(fileDir, { recursive: true });
        // Write file
        await fs.writeFile(filePath, file.buffer);
        const url = `/uploads/${fileKey}`;
        return { url, key: fileKey };
    }
    async getSignedUrl(fileKey, expiresIn = 3600) {
        if (this.useS3) {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        else {
            // For local storage, return direct path
            return `/uploads/${fileKey}`;
        }
    }
    async deleteFile(fileKey) {
        if (this.useS3) {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });
            await this.s3Client.send(command);
        }
        else {
            const filePath = path.join(this.localStoragePath, fileKey);
            try {
                await fs.unlink(filePath);
            }
            catch (error) {
                console.error('Error deleting local file:', error);
            }
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
