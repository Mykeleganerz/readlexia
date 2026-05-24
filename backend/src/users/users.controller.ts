import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { SupportTicketsService } from './support-tickets.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supportTicketsService: SupportTicketsService,
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }

  // Support Ticket Endpoints
  @Post('support-tickets')
  @UseGuards(JwtAuthGuard)
  createSupportTicket(@Req() req, @Body() createTicketDto: CreateSupportTicketDto) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.supportTicketsService.createTicket(userId, createTicketDto);
  }

  @Get('support-tickets')
  @UseGuards(JwtAuthGuard)
  getUserSupportTickets(@Req() req) {
    return this.supportTicketsService.getUserTickets(req.user.id);
  }

  @Get('support-tickets/:id')
  @UseGuards(JwtAuthGuard)
  getSupportTicket(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.supportTicketsService.getTicketById(id, req.user.id);
  }
}
