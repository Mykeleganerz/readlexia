import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('support_tickets')
export class SupportTicket {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    subject: string;

    @Column('text')
    message: string;

    @Column({ default: 'open' })
    status: string; // 'open', 'in-progress', 'resolved', 'closed'

    @Column({ default: 'medium' })
    priority: string; // 'low', 'medium', 'high', 'urgent'

    @Column({ type: 'text', nullable: true })
    response: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
