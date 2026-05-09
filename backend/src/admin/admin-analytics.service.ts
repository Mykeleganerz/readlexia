import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Document } from '../documents/document.entity';

@Injectable()
export class AdminAnalyticsService {
    private readonly logger = new Logger(AdminAnalyticsService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
    ) { }

    async getSystemAnalytics() {
        try {
            this.logger.log('Fetching system analytics');

            const totalUsers = await this.userRepository.count();
            const totalDocuments = await this.documentRepository.count();

            // Calculate active users (logged in within last 30 days - simplified)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const activeUsers = await this.userRepository.count({
                where: {
                    updatedAt: thirtyDaysAgo as any,
                },
            });

            // Get all documents to calculate word count
            const allDocuments = await this.documentRepository.find();

            let totalWords = 0;
            let averageDocumentLength = 0;

            if (allDocuments.length > 0) {
                // Calculate total and average words by counting space-separated words
                allDocuments.forEach((doc) => {
                    const wordCount = doc.content.trim().split(/\s+/).length;
                    totalWords += wordCount;
                });
                averageDocumentLength = Math.round(totalWords / allDocuments.length);
            }

            // For now, these are placeholder values
            const totalExercises = Math.floor(totalDocuments * 0.5); // Estimate
            const mostUsedFeature = 'Text Highlighting';
            const uptime = '99.9%';
            const avgResponseTime = 150; // ms
            const errorRate = 0.23; // percentage

            const analytics = {
                totalUsers,
                totalDocuments,
                totalExercises,
                activeUsers,
                totalWords,
                averageDocumentLength,
                mostUsedFeature,
                systemHealth: {
                    uptime,
                    avgResponseTime,
                    errorRate,
                },
            };

            this.logger.log('System analytics retrieved successfully', { analytics });
            return analytics;
        } catch (error) {
            this.logger.error('Failed to get system analytics', error);
            throw error;
        }
    }
}
