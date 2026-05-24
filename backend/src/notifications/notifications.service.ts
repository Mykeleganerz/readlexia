import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async createNotification(
        userId: number,
        title: string,
        message: string,
        type: 'info' | 'warning' | 'success' | 'error' | 'ticket_update' = 'info',
        relatedTicketId?: number,
    ) {
        try {
            this.logger.log('Creating notification', { userId, title, type });
            const notification = this.notificationRepository.create({
                userId,
                title,
                message,
                type,
                relatedTicketId,
                isRead: false,
            });

            const savedNotification = await this.notificationRepository.save(notification);
            this.logger.log('Notification created', { notificationId: savedNotification.id });
            return savedNotification;
        } catch (error) {
            this.logger.error('Failed to create notification', error);
            throw error;
        }
    }

    async getUserNotifications(userId: number) {
        try {
            this.logger.log('Fetching user notifications', { userId });
            const notifications = await this.notificationRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
            });
            this.logger.log('Notifications retrieved', { userId, count: notifications.length });
            return notifications;
        } catch (error) {
            this.logger.error('Failed to get notifications', error);
            throw error;
        }
    }

    async getUnreadNotifications(userId: number) {
        try {
            this.logger.log('Fetching unread notifications', { userId });
            const notifications = await this.notificationRepository.find({
                where: { userId, isRead: false },
                order: { createdAt: 'DESC' },
            });
            this.logger.log('Unread notifications retrieved', { userId, count: notifications.length });
            return notifications;
        } catch (error) {
            this.logger.error('Failed to get unread notifications', error);
            throw error;
        }
    }

    async markAsRead(notificationId: number) {
        try {
            this.logger.log('Marking notification as read', { notificationId });
            await this.notificationRepository.update(notificationId, { isRead: true });
            this.logger.log('Notification marked as read', { notificationId });
        } catch (error) {
            this.logger.error('Failed to mark notification as read', error);
            throw error;
        }
    }

    async markAllAsRead(userId: number) {
        try {
            this.logger.log('Marking all notifications as read', { userId });
            await this.notificationRepository.update(
                { userId, isRead: false },
                { isRead: true },
            );
            this.logger.log('All notifications marked as read', { userId });
        } catch (error) {
            this.logger.error('Failed to mark all notifications as read', error);
            throw error;
        }
    }

    async deleteNotification(notificationId: number) {
        try {
            this.logger.log('Deleting notification', { notificationId });
            await this.notificationRepository.delete(notificationId);
            this.logger.log('Notification deleted', { notificationId });
        } catch (error) {
            this.logger.error('Failed to delete notification', error);
            throw error;
        }
    }

    async deleteAllNotifications(userId: number) {
        try {
            this.logger.log('Deleting all notifications', { userId });
            await this.notificationRepository.delete({ userId });
            this.logger.log('All notifications deleted', { userId });
        } catch (error) {
            this.logger.error('Failed to delete all notifications', error);
            throw error;
        }
    }
}
