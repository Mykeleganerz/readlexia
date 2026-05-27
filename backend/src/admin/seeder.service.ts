import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { seedHelpContent } from './help-content.seeder';

/**
 * Seeder Service
 * Runs on application startup to seed initial database data
 * Only seeds if data doesn't already exist (safe to run multiple times)
 */
@Injectable()
export class SeederService implements OnModuleInit {
    private readonly logger = new Logger(SeederService.name);

    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async onModuleInit() {
        try {
            this.logger.log('Starting database seeding...');

            // Run help content seeder
            await seedHelpContent(this.dataSource);

            this.logger.log('✓ Database seeding completed successfully');
        } catch (error) {
            this.logger.error('Database seeding failed:', error);
            // Don't throw - allow app to continue running even if seeding fails
        }
    }
}
