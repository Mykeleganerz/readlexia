import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../users/user.entity';
import { Document } from '../documents/document.entity';
import { Exercise } from '../exercises/exercise.entity';

@Injectable()
export class AdminAnalyticsService {
    private readonly logger = new Logger(AdminAnalyticsService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Document)
        private readonly documentRepository: Repository<Document>,
        @InjectRepository(Exercise)
        private readonly exerciseRepository: Repository<Exercise>,
    ) { }

    async getSystemAnalytics() {
        try {
            this.logger.log('Fetching system analytics');

            // Total users count
            const totalUsers = await this.userRepository.count();

            // Active users (updated within last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const activeUsers = await this.userRepository.count({
                where: {
                    updatedAt: MoreThan(thirtyDaysAgo),
                },
            });

            // New users in last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const newUsersLast7Days = await this.userRepository.count({
                where: {
                    createdAt: MoreThan(sevenDaysAgo),
                },
            });

            // New users in last 30 days
            const newUsersLast30Days = await this.userRepository.count({
                where: {
                    createdAt: MoreThan(thirtyDaysAgo),
                },
            });

            // Total documents count
            const totalDocuments = await this.documentRepository.count();

            // New documents in last 7 days
            const newDocumentsLast7Days = await this.documentRepository.count({
                where: {
                    createdAt: MoreThan(sevenDaysAgo),
                },
            });

            // New documents in last 30 days
            const newDocumentsLast30Days = await this.documentRepository.count({
                where: {
                    createdAt: MoreThan(thirtyDaysAgo),
                },
            });

            // Total exercises count
            const totalExercises = await this.exerciseRepository.count();

            // Get all documents to calculate word count and statistics
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

            // Document categories distribution
            const categoryCounts: Record<string, number> = {};
            allDocuments.forEach((doc) => {
                const category = doc.category || 'Uncategorized';
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });

            // Average exercises per user
            let avgExercisesPerUser = 0;
            if (totalUsers > 0) {
                avgExercisesPerUser = Math.round(totalExercises / totalUsers * 100) / 100;
            }

            // Average documents per user
            let avgDocumentsPerUser = 0;
            if (totalUsers > 0) {
                avgDocumentsPerUser = Math.round(totalDocuments / totalUsers * 100) / 100;
            }

            const analytics = {
                // Core metrics (real data)
                totalUsers,
                activeUsers,
                newUsersLast7Days,
                newUsersLast30Days,
                totalDocuments,
                newDocumentsLast7Days,
                newDocumentsLast30Days,
                totalExercises,
                totalWords,
                averageDocumentLength,
                avgExercisesPerUser,
                avgDocumentsPerUser,
                categoryDistribution: categoryCounts,
            };

            this.logger.log('System analytics retrieved successfully', {
                totalUsers,
                totalDocuments,
                totalExercises,
                activeUsers,
                newUsersLast7Days,
            });
            return analytics;
        } catch (error) {
            this.logger.error('Failed to get system analytics', error);
            throw error;
        }
    }
}
