import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminSupportTicketsService } from './admin-support-tickets.service';
import { AdminHelpContentService } from './admin-help-content.service';
import { SupportTicket } from './support-ticket.entity';
import { HelpContent } from './help-content.entity';
import { User } from '../users/user.entity';
import { Document } from '../documents/document.entity';

@Module({
    imports: [TypeOrmModule.forFeature([SupportTicket, HelpContent, User, Document])],
    controllers: [AdminController],
    providers: [
        AdminAnalyticsService,
        AdminSupportTicketsService,
        AdminHelpContentService,
    ],
    exports: [
        AdminAnalyticsService,
        AdminSupportTicketsService,
        AdminHelpContentService,
    ],
})
export class AdminModule { }
