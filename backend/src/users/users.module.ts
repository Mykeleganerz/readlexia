import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { SupportTicketsService } from './support-tickets.service';
import { User } from './user.entity';
import { SupportTicket } from '../admin/support-ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, SupportTicket])],
  controllers: [UsersController],
  providers: [UsersService, SupportTicketsService],
  exports: [UsersService, SupportTicketsService],
})
export class UsersModule { }
