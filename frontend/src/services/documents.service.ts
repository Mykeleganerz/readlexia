import apiClient from './api.service';
import { errorLogger } from '../utils/errorLogger';

export interface Document {
  id: number;
  title: string;
  content: string;
  category: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentsListResponse {
  data: Document[];
  total: number;
  page: number;
  lastPage: number;
}

export interface DashboardStats {
  totalWords: number;
  totalDocuments: number;
  mostUsedCategory: string;
  averageDocumentLength: number;
  lastActivityDate: string | null;
}

export const documentsService = {
  async getAll(page = 1, limit = 10): Promise<DocumentsListResponse> {
    try {
      errorLogger.info('Fetching documents', { page, limit });
      const response = await apiClient.get<DocumentsListResponse>('/documents', {
        params: { page, limit },
      });
      errorLogger.info('Documents fetched', { count: response.data.data.length, total: response.data.total });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch documents';
      errorLogger.error(`Failed to fetch documents: ${message}`, { page, limit });
      throw error;
    }
  },

  async getById(id: number): Promise<Document> {
    try {
      errorLogger.info('Fetching document', { id });
      const response = await apiClient.get<Document>(`/documents/${id}`);
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch document';
      errorLogger.error(`Failed to fetch document ${id}: ${message}`);
      throw error;
    }
  },

  async create(title: string, content: string, category?: string): Promise<Document> {
    try {
      errorLogger.info('Creating document', { title, category, contentLength: content.length });
      const response = await apiClient.post<Document>('/documents', { title, content, category });
      errorLogger.info('Document created', { id: response.data.id });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create document';
      errorLogger.error(`Failed to create document: ${message}`, { title, category });
      throw error;
    }
  },

  async update(id: number, updates: { title?: string; content?: string; category?: string }): Promise<Document> {
    try {
      errorLogger.info('Updating document', { id, fields: Object.keys(updates) });
      const response = await apiClient.put<Document>(`/documents/${id}`, updates);
      errorLogger.info('Document updated', { id });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update document';
      errorLogger.error(`Failed to update document ${id}: ${message}`);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      errorLogger.info('Deleting document', { id });
      await apiClient.delete(`/documents/${id}`);
      errorLogger.info('Document deleted', { id });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete document';
      errorLogger.error(`Failed to delete document ${id}: ${message}`);
      throw error;
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      errorLogger.info('Fetching dashboard stats');
      const response = await apiClient.get<DashboardStats>('/documents/stats/dashboard');
      errorLogger.info('Dashboard stats fetched', { documents: response.data.totalDocuments, words: response.data.totalWords });
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
      errorLogger.error(`Failed to fetch dashboard stats: ${message}`);
      throw error;
    }
  },
};
