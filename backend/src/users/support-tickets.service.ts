import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from '../admin/support-ticket.entity';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';

@Injectable()
export class SupportTicketsService {
    private readonly logger = new Logger(SupportTicketsService.name);

    constructor(
        @InjectRepository(SupportTicket)
        private readonly ticketRepository: Repository<SupportTicket>,
    ) { }

    async createTicket(userId: number, createTicketDto: CreateSupportTicketDto) {
        try {
            if (!userId) {
                this.logger.error('Invalid userId provided', { userId });
                throw new Error('User ID is required');
            }

            this.logger.log('User creating support ticket', { userId, subject: createTicketDto.subject });

            if (!createTicketDto.subject || !createTicketDto.message) {
                throw new Error('Subject and message are required');
            }

            const ticket = this.ticketRepository.create({
                userId: Number(userId),
                subject: createTicketDto.subject.trim(),
                message: createTicketDto.message.trim(),
                priority: createTicketDto.priority || 'medium',
                status: 'open',
            });

            const savedTicket = await this.ticketRepository.save(ticket);
            this.logger.log('Support ticket created by user', { ticketId: savedTicket.id, userId });
            return savedTicket;
        } catch (error) {
            this.logger.error('Failed to create support ticket', {
                userId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new InternalServerErrorException(
                error instanceof Error ? error.message : 'Failed to create support ticket'
            );
        }
    }

    async getUserTickets(userId: number) {
        try {
            this.logger.log('Fetching user tickets', { userId });
            const tickets = await this.ticketRepository.find({
                where: { userId },
                order: { createdAt: 'DESC' },
            });

            this.logger.log('User tickets retrieved', { userId, count: tickets.length });
            return tickets;
        } catch (error) {
            this.logger.error('Failed to get user tickets', error);
            throw new InternalServerErrorException('Failed to fetch tickets');
        }
    }

    async getTicketById(ticketId: number, userId: number) {
        try {
            this.logger.log('Fetching user ticket', { ticketId, userId });
            const ticket = await this.ticketRepository.findOne({
                where: { id: ticketId, userId },
            });

            if (!ticket) {
                this.logger.warn('Ticket not found', { ticketId, userId });
                throw new NotFoundException('Ticket not found');
            }

            return ticket;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            this.logger.error('Failed to get ticket', error);
            throw new InternalServerErrorException('Failed to fetch ticket');
        }
    }
}
