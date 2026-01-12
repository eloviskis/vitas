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
var PushNotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationService = void 0;
const common_1 = require("@nestjs/common");
const admin = __importStar(require("firebase-admin"));
let PushNotificationService = PushNotificationService_1 = class PushNotificationService {
    constructor() {
        this.logger = new common_1.Logger(PushNotificationService_1.name);
        this.fcmInitialized = false;
    }
    onModuleInit() {
        this.initializeFirebase();
    }
    initializeFirebase() {
        try {
            // Verifica se já foi inicializado
            if (admin.apps.length > 0) {
                this.fcmInitialized = true;
                this.logger.log('Firebase Admin already initialized');
                return;
            }
            const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
            if (!serviceAccountPath) {
                this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH not configured. Push notifications will be disabled.');
                return;
            }
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            this.fcmInitialized = true;
            this.logger.log('Firebase Admin initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase Admin:', error);
        }
    }
    /**
     * Envia notificação push para um único dispositivo
     */
    async sendToDevice(fcmToken, payload) {
        if (!this.fcmInitialized) {
            this.logger.warn('FCM not initialized. Skipping notification.');
            return false;
        }
        try {
            const message = {
                token: fcmToken,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data || {},
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
                webpush: {
                    notification: {
                        icon: '/logo-192.png',
                        badge: '/logo-192.png',
                    },
                },
            };
            const response = await admin.messaging().send(message);
            this.logger.log(`Notification sent successfully: ${response}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send notification to ${fcmToken}:`, error);
            return false;
        }
    }
    /**
     * Envia notificação push para múltiplos dispositivos
     */
    async sendToMultipleDevices(fcmTokens, payload) {
        if (!this.fcmInitialized) {
            this.logger.warn('FCM not initialized. Skipping notifications.');
            return { successCount: 0, failureCount: fcmTokens.length };
        }
        try {
            const message = {
                tokens: fcmTokens,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data || {},
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
            };
            const response = await admin.messaging().sendEachForMulticast(message);
            this.logger.log(`Batch notification sent: ${response.successCount} success, ${response.failureCount} failures`);
            return {
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (error) {
            this.logger.error('Failed to send batch notifications:', error);
            return { successCount: 0, failureCount: fcmTokens.length };
        }
    }
    /**
     * Envia notificação para tópico (broadcast)
     */
    async sendToTopic(topic, payload) {
        if (!this.fcmInitialized) {
            this.logger.warn('FCM not initialized. Skipping notification.');
            return false;
        }
        try {
            const message = {
                topic,
                notification: {
                    title: payload.title,
                    body: payload.body,
                    imageUrl: payload.imageUrl,
                },
                data: payload.data || {},
            };
            const response = await admin.messaging().send(message);
            this.logger.log(`Topic notification sent successfully: ${response}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to send topic notification to ${topic}:`, error);
            return false;
        }
    }
    /**
     * Subscreve dispositivo a um tópico
     */
    async subscribeToTopic(fcmToken, topic) {
        if (!this.fcmInitialized) {
            return false;
        }
        try {
            await admin.messaging().subscribeToTopic([fcmToken], topic);
            this.logger.log(`Device subscribed to topic: ${topic}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
            return false;
        }
    }
    /**
     * Remove subscrição de tópico
     */
    async unsubscribeFromTopic(fcmToken, topic) {
        if (!this.fcmInitialized) {
            return false;
        }
        try {
            await admin.messaging().unsubscribeFromTopic([fcmToken], topic);
            this.logger.log(`Device unsubscribed from topic: ${topic}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
            return false;
        }
    }
};
exports.PushNotificationService = PushNotificationService;
exports.PushNotificationService = PushNotificationService = PushNotificationService_1 = __decorate([
    (0, common_1.Injectable)()
], PushNotificationService);
