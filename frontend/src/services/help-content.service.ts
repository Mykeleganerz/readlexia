import apiClient from './api.service';
import { errorLogger } from '../utils/errorLogger';

export interface HelpContent {
    id: number;
    title: string;
    content: string;
    category: string;
    order: number;
    videoUrl?: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export const helpContentService = {
    async getAll(): Promise<HelpContent[]> {
        try {
            errorLogger.info('Fetching all help content');
            const response = await apiClient.get<HelpContent[]>('/help-content');
            errorLogger.info('Help content fetched', { count: response.data.length });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch help content';
            errorLogger.error(`Failed to fetch help content: ${message}`);
            throw error;
        }
    },

    async getById(id: number): Promise<HelpContent | null> {
        try {
            errorLogger.info('Fetching help content by ID', { id });
            const response = await apiClient.get<HelpContent>(`/help-content/${id}`);
            return response.data;
        } catch (error) {
            if (error instanceof Error && error.message.includes('404')) {
                return null;
            }
            const message = error instanceof Error ? error.message : 'Failed to fetch help content';
            errorLogger.error(`Failed to fetch help content ${id}: ${message}`);
            throw error;
        }
    },

    async getByCategory(category: string): Promise<HelpContent[]> {
        try {
            errorLogger.info('Fetching help content by category', { category });
            const response = await apiClient.get<HelpContent[]>(`/help-content/category/${category}`);
            errorLogger.info('Help content fetched', { count: response.data.length, category });
            return response.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch help content';
            errorLogger.error(`Failed to fetch help content for category ${category}: ${message}`);
            throw error;
        }
    },
};
