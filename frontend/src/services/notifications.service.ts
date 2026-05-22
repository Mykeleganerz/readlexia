import apiClient from './api.service';
import { errorLogger } from '../utils/errorLogger';

export interface Notification {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'ticket_update';
    relatedTicketId?: number;
    isRead: boolean;
    createdAt: string;
}

export const notificationsService = {
    async getAll(): Promise<Notification[]> {
        try {
            errorLogger.info('Fetching notifications');
            const response = await apiClient.get<Notification[]>('/notifications');
            errorLogger.info('Notifications fetched', { count: response.data.length });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
            errorLogger.error(`Failed to fetch notifications: ${message}`);
            throw error;
        }
    },

    async getUnread(): Promise<Notification[]> {
        try {
            errorLogger.info('Fetching unread notifications');
            const response = await apiClient.get<Notification[]>('/notifications/unread');
            errorLogger.info('Unread notifications fetched', { count: response.data.length });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch unread notifications';
            errorLogger.error(`Failed to fetch unread notifications: ${message}`);
            throw error;
        }
    },

    async markAsRead(id: number): Promise<void> {
        try {
            errorLogger.info('Marking notification as read', { id });
            await apiClient.put(`/notifications/${id}/read`);
            errorLogger.info('Notification marked as read', { id });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to mark notification as read';
            errorLogger.error(`Failed to mark notification as read: ${message}`);
            throw error;
        }
    },

    async markAllAsRead(): Promise<void> {
        try {
            errorLogger.info('Marking all notifications as read');
            await apiClient.put('/notifications/read-all');
            errorLogger.info('All notifications marked as read');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
            errorLogger.error(`Failed to mark all notifications as read: ${message}`);
            throw error;
        }
    },

    async delete(id: number): Promise<void> {
        try {
            errorLogger.info('Deleting notification', { id });
            await apiClient.delete(`/notifications/${id}`);
            errorLogger.info('Notification deleted', { id });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete notification';
            errorLogger.error(`Failed to delete notification: ${message}`);
            throw error;
        }
    },

    async deleteAll(): Promise<void> {
        try {
            errorLogger.info('Deleting all notifications');
            await apiClient.delete('/notifications');
            errorLogger.info('All notifications deleted');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete all notifications';
            errorLogger.error(`Failed to delete all notifications: ${message}`);
            throw error;
        }
    },
};
