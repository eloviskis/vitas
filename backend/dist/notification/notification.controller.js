"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notification_service_1 = require("./notification.service");
class SendNotificationDto {
}
class SendMultipleDto {
}
class SendToTopicDto {
}
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async sendNotification(dto) {
        const payload = {
            title: dto.title,
            body: dto.body,
            data: dto.data,
            imageUrl: dto.imageUrl,
        };
        const success = await this.notificationService.sendToDevice(dto.token, payload);
        return {
            success,
            message: success ? 'Notification sent' : 'Failed to send notification',
        };
    }
    async sendMultiple(dto) {
        const payload = {
            title: dto.title,
            body: dto.body,
            data: dto.data,
            imageUrl: dto.imageUrl,
        };
        const result = await this.notificationService.sendToMultipleDevices(dto.tokens, payload);
        return {
            success: result.success > 0,
            successCount: result.success,
            failureCount: result.failure,
            total: dto.tokens.length,
        };
    }
    async sendToTopic(dto) {
        const payload = {
            title: dto.title,
            body: dto.body,
            data: dto.data,
            imageUrl: dto.imageUrl,
        };
        const success = await this.notificationService.sendToTopic(dto.topic, payload);
        return {
            success,
            message: success
                ? `Notification sent to topic ${dto.topic}`
                : 'Failed to send notification',
        };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar notificação para um dispositivo', description: 'Envia push notification para um token FCM específico' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Notificação enviada' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Token inválido ou Firebase não configurado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendNotification", null);
__decorate([
    (0, common_1.Post)('send-multiple'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendMultipleDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendMultiple", null);
__decorate([
    (0, common_1.Post)('send-to-topic'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SendToTopicDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "sendToTopic", null);
exports.NotificationController = NotificationController = __decorate([
    (0, swagger_1.ApiTags)('Notificações'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
