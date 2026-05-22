import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateSupportTicketDto {
    @IsString({ message: 'Subject must be a string' })
    @IsNotEmpty({ message: 'Subject is required' })
    subject: string;

    @IsString({ message: 'Message must be a string' })
    @IsNotEmpty({ message: 'Message is required' })
    message: string;

    @IsEnum(['low', 'medium', 'high', 'urgent'], { message: 'Priority must be one of: low, medium, high, urgent' })
    @IsOptional()
    priority?: 'low' | 'medium' | 'high' | 'urgent';
}
