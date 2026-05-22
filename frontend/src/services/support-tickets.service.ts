import apiClient from './api.service';
import { errorLogger } from '../utils/errorLogger';

export interface SupportTicket {
    id: number;
    userId: number;
    subject: string;
    message: string;
    status: 'open' | 'in-progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    response?: string;
    createdAt: string;
    updatedAt: string;
}

export const supportTicketsService = {
    async create(subject: string, message: string, priority: string = 'medium'): Promise<SupportTicket> {
        try {
            errorLogger.info('Creating support ticket', { subject });
            const response = await apiClient.post<SupportTicket>('/users/support-tickets', {
                subject,
                message,
                priority,
            });
            errorLogger.info('Support ticket created', { id: response.data.id });
            return response.data;
        } catch (error) {
            const message_err = error instanceof Error ? error.message : 'Failed to create support ticket';
            errorLogger.error(`Failed to create support ticket: ${message_err}`, { subject });
            throw error;
        }
    },

    async getAll(): Promise<SupportTicket[]> {
        try {
            errorLogger.info('Fetching user support tickets');
            const response = await apiClient.get<SupportTicket[]>('/users/support-tickets');
            errorLogger.info('Support tickets fetched', { count: response.data.length });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch support tickets';
            errorLogger.error(`Failed to fetch support tickets: ${message}`);
            throw error;
        }
    },

    async getById(id: number): Promise<SupportTicket> {
        try {
            errorLogger.info('Fetching support ticket', { id });
            const response = await apiClient.get<SupportTicket>(`/users/support-tickets/${id}`);
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch support ticket';
            errorLogger.error(`Failed to fetch support ticket ${id}: ${message}`);
            throw error;
        }
    },
};
