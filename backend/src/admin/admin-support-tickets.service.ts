import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from './support-ticket.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AdminSupportTicketsService {
    private readonly logger = new Logger(AdminSupportTicketsService.name);

    constructor(
        @InjectRepository(SupportTicket)
        private readonly ticketRepository: Repository<SupportTicket>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async getAllTickets() {
        try {
            this.logger.log('Fetching all support tickets');
            const tickets = await this.ticketRepository.find({
                relations: ['user'],
                order: { createdAt: 'DESC' },
            });

            // Map to include user details
            const ticketsWithUserInfo = tickets.map((ticket) => ({
                ...ticket,
                userName: ticket.user.name,
                userEmail: ticket.user.email,
            }));

            this.logger.log('Support tickets retrieved', { count: tickets.length });
            return ticketsWithUserInfo;
        } catch (error) {
            this.logger.error('Failed to get support tickets', error);
            throw error;
        }
    }

    async getTicketById(ticketId: number) {
        try {
            this.logger.log('Fetching ticket by ID', { ticketId });
            const ticket = await this.ticketRepository.findOne({
                where: { id: ticketId },
                relations: ['user'],
            });

            if (!ticket) {
                this.logger.warn('Ticket not found', { ticketId });
                return null;
            }

            return {
                ...ticket,
                userName: ticket.user.name,
                userEmail: ticket.user.email,
            };
        } catch (error) {
            this.logger.error('Failed to get ticket', error);
            throw error;
        }
    }

    async createTicket(userId: number, subject: string, message: string, priority = 'medium') {
        try {
            this.logger.log('Creating support ticket', { userId, subject });

            const ticket = this.ticketRepository.create({
                userId,
                subject,
                message,
                priority,
                status: 'open',
            });

            const savedTicket = await this.ticketRepository.save(ticket);
            this.logger.log('Support ticket created', { ticketId: savedTicket.id });
            return savedTicket;
        } catch (error) {
            this.logger.error('Failed to create support ticket', error);
            throw error;
        }
    }

    async updateTicketStatus(ticketId: number, status: string) {
        try {
            this.logger.log('Updating ticket status', { ticketId, status });

            await this.ticketRepository.update(ticketId, { status });
            const updatedTicket = await this.getTicketById(ticketId);

            this.logger.log('Ticket status updated', { ticketId, status });
            return updatedTicket;
        } catch (error) {
            this.logger.error('Failed to update ticket status', error);
            throw error;
        }
    }

    async addTicketResponse(ticketId: number, response: string) {
        try {
            this.logger.log('Adding response to ticket', { ticketId });

            await this.ticketRepository.update(ticketId, {
                response,
                status: 'in-progress',
            });

            const updatedTicket = await this.getTicketById(ticketId);
            this.logger.log('Response added to ticket', { ticketId });
            return updatedTicket;
        } catch (error) {
            this.logger.error('Failed to add response to ticket', error);
            throw error;
        }
    }

    async deleteTicket(ticketId: number) {
        try {
            this.logger.log('Deleting support ticket', { ticketId });
            await this.ticketRepository.delete(ticketId);
            this.logger.log('Support ticket deleted', { ticketId });
        } catch (error) {
            this.logger.error('Failed to delete support ticket', error);
            throw error;
        }
    }
}
