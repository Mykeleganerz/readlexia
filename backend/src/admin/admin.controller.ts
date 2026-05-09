import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminSupportTicketsService } from './admin-support-tickets.service';
import { AdminHelpContentService } from './admin-help-content.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
    private readonly logger = new Logger(AdminController.name);

    constructor(
        private readonly analyticsService: AdminAnalyticsService,
        private readonly supportTicketsService: AdminSupportTicketsService,
        private readonly helpContentService: AdminHelpContentService,
    ) { }

    // Analytics Endpoints
    @Get('analytics')
    async getAnalytics() {
        try {
            this.logger.log('GET /admin/analytics');
            return await this.analyticsService.getSystemAnalytics();
        } catch (error) {
            this.logger.error('Failed to get analytics', error);
            throw error;
        }
    }

    // Support Tickets Endpoints
    @Get('support-tickets')
    async getAllTickets() {
        try {
            this.logger.log('GET /admin/support-tickets');
            return await this.supportTicketsService.getAllTickets();
        } catch (error) {
            this.logger.error('Failed to get support tickets', error);
            throw error;
        }
    }

    @Get('support-tickets/:id')
    async getTicketById(@Param('id') ticketId: number) {
        try {
            this.logger.log('GET /admin/support-tickets/:id', { ticketId });
            return await this.supportTicketsService.getTicketById(ticketId);
        } catch (error) {
            this.logger.error('Failed to get ticket', error);
            throw error;
        }
    }

    @Put('support-tickets/:id')
    async updateTicket(
        @Param('id') ticketId: number,
        @Body() body: { status?: string; response?: string },
    ) {
        try {
            this.logger.log('PUT /admin/support-tickets/:id', { ticketId, body });
            if (body.status) {
                return await this.supportTicketsService.updateTicketStatus(ticketId, body.status);
            }
            if (body.response) {
                return await this.supportTicketsService.addTicketResponse(ticketId, body.response);
            }
        } catch (error) {
            this.logger.error('Failed to update ticket', error);
            throw error;
        }
    }

    @Post('support-tickets/:id/response')
    async addTicketResponse(
        @Param('id') ticketId: number,
        @Body() body: { response: string },
    ) {
        try {
            this.logger.log('POST /admin/support-tickets/:id/response', { ticketId });
            return await this.supportTicketsService.addTicketResponse(ticketId, body.response);
        } catch (error) {
            this.logger.error('Failed to add response', error);
            throw error;
        }
    }

    @Delete('support-tickets/:id')
    async deleteTicket(@Param('id') ticketId: number) {
        try {
            this.logger.log('DELETE /admin/support-tickets/:id', { ticketId });
            await this.supportTicketsService.deleteTicket(ticketId);
            return { message: 'Ticket deleted successfully' };
        } catch (error) {
            this.logger.error('Failed to delete ticket', error);
            throw error;
        }
    }

    // Help Content Endpoints
    @Get('help-content')
    async getAllHelpContent() {
        try {
            this.logger.log('GET /admin/help-content');
            return await this.helpContentService.getAllHelpContent();
        } catch (error) {
            this.logger.error('Failed to get help content', error);
            throw error;
        }
    }

    @Get('help-content/:id')
    async getHelpContentById(@Param('id') contentId: number) {
        try {
            this.logger.log('GET /admin/help-content/:id', { contentId });
            return await this.helpContentService.getHelpContentById(contentId);
        } catch (error) {
            this.logger.error('Failed to get help content', error);
            throw error;
        }
    }

    @Post('help-content')
    async createHelpContent(
        @Body() body: { title: string; content: string; category: string; order?: number },
    ) {
        try {
            this.logger.log('POST /admin/help-content', body);
            return await this.helpContentService.createHelpContent(
                body.title,
                body.content,
                body.category,
                body.order,
            );
        } catch (error) {
            this.logger.error('Failed to create help content', error);
            throw error;
        }
    }

    @Put('help-content/:id')
    async updateHelpContent(
        @Param('id') contentId: number,
        @Body() body: any,
    ) {
        try {
            this.logger.log('PUT /admin/help-content/:id', { contentId, body });
            return await this.helpContentService.updateHelpContent(contentId, body);
        } catch (error) {
            this.logger.error('Failed to update help content', error);
            throw error;
        }
    }

    @Delete('help-content/:id')
    async deleteHelpContent(@Param('id') contentId: number) {
        try {
            this.logger.log('DELETE /admin/help-content/:id', { contentId });
            await this.helpContentService.deleteHelpContent(contentId);
            return { message: 'Help content deleted successfully' };
        } catch (error) {
            this.logger.error('Failed to delete help content', error);
            throw error;
        }
    }
}
