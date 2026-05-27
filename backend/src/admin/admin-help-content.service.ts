import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpContent } from './help-content.entity';

@Injectable()
export class AdminHelpContentService {
    private readonly logger = new Logger(AdminHelpContentService.name);

    constructor(
        @InjectRepository(HelpContent)
        private readonly helpContentRepository: Repository<HelpContent>,
    ) { }

    async getAllHelpContent() {
        try {
            this.logger.log('Fetching all help content');
            const content = await this.helpContentRepository.find({
                order: { order: 'ASC' },
            });
            this.logger.log('Help content retrieved', { count: content.length });
            return content;
        } catch (error) {
            this.logger.error('Failed to get help content', error);
            throw error;
        }
    }

    async getHelpContentById(contentId: number) {
        try {
            this.logger.log('Fetching help content by ID', { contentId });
            const content = await this.helpContentRepository.findOne({
                where: { id: contentId },
            });

            if (!content) {
                this.logger.warn('Help content not found', { contentId });
                return null;
            }

            return content;
        } catch (error) {
            this.logger.error('Failed to get help content', error);
            throw error;
        }
    }

    async getHelpContentByCategory(category: string) {
        try {
            this.logger.log('Fetching help content by category', { category });
            const content = await this.helpContentRepository.find({
                where: { category },
                order: { order: 'ASC' },
            });
            this.logger.log('Help content retrieved', { count: content.length });
            return content;
        } catch (error) {
            this.logger.error('Failed to get help content by category', error);
            throw error;
        }
    }

    async getPublishedHelpContent() {
        try {
            this.logger.log('Fetching published help content');
            const content = await this.helpContentRepository.find({
                where: { isPublished: true },
                order: { order: 'ASC', createdAt: 'DESC' },
            });
            this.logger.log('Published help content retrieved', { count: content.length });
            return content;
        } catch (error) {
            this.logger.error('Failed to get published help content', error);
            throw error;
        }
    }

    async createHelpContent(title: string, content: string, category: string, order = 0, videoUrl?: string, isPublished = false) {
        try {
            this.logger.log('Creating help content', { title, category });

            const helpContent = this.helpContentRepository.create({
                title,
                content,
                category,
                order,
                videoUrl: videoUrl || null,
                isPublished,
            });

            const savedContent = await this.helpContentRepository.save(helpContent);
            this.logger.log('Help content created', { contentId: savedContent.id });
            return savedContent;
        } catch (error) {
            this.logger.error('Failed to create help content', error);
            throw error;
        }
    }

    async updateHelpContent(contentId: number, updates: any) {
        try {
            this.logger.log('Updating help content', { contentId });

            await this.helpContentRepository.update(contentId, updates);
            const updatedContent = await this.getHelpContentById(contentId);

            this.logger.log('Help content updated', { contentId });
            return updatedContent;
        } catch (error) {
            this.logger.error('Failed to update help content', error);
            throw error;
        }
    }

    async deleteHelpContent(contentId: number) {
        try {
            this.logger.log('Deleting help content', { contentId });
            await this.helpContentRepository.delete(contentId);
            this.logger.log('Help content deleted', { contentId });
        } catch (error) {
            this.logger.error('Failed to delete help content', error);
            throw error;
        }
    }
}
