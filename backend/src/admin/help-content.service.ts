import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpContent } from './help-content.entity';

@Injectable()
export class HelpContentService {
    private readonly logger = new Logger(HelpContentService.name);

    constructor(
        @InjectRepository(HelpContent)
        private readonly helpContentRepository: Repository<HelpContent>,
    ) { }

    async getAllHelpContent() {
        try {
            this.logger.log('Fetching all published help content');
            const content = await this.helpContentRepository.find({
                where: { isPublished: true },
                order: { order: 'ASC', createdAt: 'DESC' },
            });
            this.logger.log('Help content retrieved', { count: content.length });
            return content;
        } catch (error) {
            this.logger.error('Failed to get help content', error);
            throw new InternalServerErrorException('Failed to fetch help content');
        }
    }

    async getHelpContentById(contentId: number) {
        try {
            this.logger.log('Fetching help content by ID', { contentId });
            const content = await this.helpContentRepository.findOne({
                where: { id: contentId, isPublished: true },
            });

            if (!content) {
                return null;
            }

            return content;
        } catch (error) {
            this.logger.error('Failed to get help content', error);
            throw new InternalServerErrorException('Failed to fetch help content');
        }
    }

    async getHelpContentByCategory(category: string) {
        try {
            this.logger.log('Fetching published help content by category', { category });
            const content = await this.helpContentRepository.find({
                where: { category, isPublished: true },
                order: { order: 'ASC' },
            });
            this.logger.log('Help content retrieved', { count: content.length });
            return content;
        } catch (error) {
            this.logger.error('Failed to get help content by category', error);
            throw new InternalServerErrorException('Failed to fetch help content');
        }
    }
}
