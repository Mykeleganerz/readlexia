import { Controller, Get, Post, Put, Delete, Param, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    getUserNotifications(@Req() req) {
        return this.notificationsService.getUserNotifications(req.user.id);
    }

    @Get('unread')
    getUnreadNotifications(@Req() req) {
        return this.notificationsService.getUnreadNotifications(req.user.id);
    }

    @Put(':id/read')
    markAsRead(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.markAsRead(id);
    }

    @Put('read-all')
    markAllAsRead(@Req() req) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    @Delete(':id')
    deleteNotification(@Param('id', ParseIntPipe) id: number) {
        return this.notificationsService.deleteNotification(id);
    }

    @Delete()
    deleteAllNotifications(@Req() req) {
        return this.notificationsService.deleteAllNotifications(req.user.id);
    }
}
