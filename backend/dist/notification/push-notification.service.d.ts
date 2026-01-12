import { OnModuleInit } from '@nestjs/common';
export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export declare class PushNotificationService implements OnModuleInit {
    private readonly logger;
    private fcmInitialized;
    onModuleInit(): void;
    private initializeFirebase;
    /**
     * Envia notificação push para um único dispositivo
     */
    sendToDevice(fcmToken: string, payload: PushNotificationPayload): Promise<boolean>;
    /**
     * Envia notificação push para múltiplos dispositivos
     */
    sendToMultipleDevices(fcmTokens: string[], payload: PushNotificationPayload): Promise<{
        successCount: number;
        failureCount: number;
    }>;
    /**
     * Envia notificação para tópico (broadcast)
     */
    sendToTopic(topic: string, payload: PushNotificationPayload): Promise<boolean>;
    /**
     * Subscreve dispositivo a um tópico
     */
    subscribeToTopic(fcmToken: string, topic: string): Promise<boolean>;
    /**
     * Remove subscrição de tópico
     */
    unsubscribeFromTopic(fcmToken: string, topic: string): Promise<boolean>;
}
