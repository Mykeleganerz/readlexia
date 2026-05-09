import { Injectable, UnauthorizedException, ConflictException, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
    try {
      const { email, password, name } = registerDto;
      this.logger.log(`Registration attempt for email: ${email}`);

      // Check if user already exists
      const existingUser = await this.usersRepository.findOne({ where: { email } });
      if (existingUser) {
        this.logger.warn(`Registration failed - email already exists: ${email}`);
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = this.usersRepository.create({
        email,
        name,
        password: hashedPassword,
      });

      await this.usersRepository.save(user);
      this.logger.log(`User registered successfully: ${email}`);

      // Generate JWT token
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);

      return {
        user,
        accessToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.logger.error(`Registration failed for ${registerDto.email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: User; accessToken: string }> {
    try {
      const { email, password } = loginDto;
      this.logger.log(`Login attempt for email: ${email}`);

      // Find user
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn(`Login failed - user not found: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      if (user.isSuspended) {
        this.logger.warn(`Login failed - account suspended: ${email}`);
        throw new UnauthorizedException('Your account has been suspended. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Login failed - invalid password: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT token
      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      this.logger.log(`Login successful for email: ${email}`);

      return {
        user,
        accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Login failed for ${loginDto.email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to login');
    }
  }

  async validateUser(userId: number): Promise<User> {
    try {
      this.logger.log(`Validating user ${userId}`);
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.warn(`User validation failed - user not found: ${userId}`);
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`User validation failed for ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to validate user');
    }
  }

  async requestPasswordReset(email: string): Promise<string> {
    try {
      this.logger.log(`Password reset request for email: ${email}`);
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if email exists for security
        this.logger.warn(`Password reset requested for non-existent email: ${email}`);
        return 'If the email exists, a reset link has been sent';
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = await bcrypt.hash(resetToken, 10);

      // Set token expiry (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Save hashed token and expiry
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = expiresAt;
      await this.usersRepository.save(user);
      this.logger.log(`Password reset token generated for email: ${email}`);

      // In production, send email with resetToken
      // For now, return the token (remove this in production!)
      return resetToken;
    } catch (error) {
      this.logger.error(`Password reset request failed for ${email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to process password reset request');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      this.logger.log('Attempting password reset with provided token');

      // Find user with valid reset token
      const users = await this.usersRepository.find({
        where: {
          passwordResetExpires: (await import('typeorm')).MoreThan(new Date()),
        },
      });

      let user: User = null;
      for (const u of users) {
        if (u.passwordResetToken) {
          const isValid = await bcrypt.compare(token, u.passwordResetToken);
          if (isValid) {
            user = u;
            break;
          }
        }
      }

      if (!user) {
        this.logger.warn('Password reset failed - invalid or expired token');
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await this.usersRepository.save(user);
      this.logger.log(`Password reset successful for user ${user.id}`);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error(`Password reset failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async getUserProfile(userId: number): Promise<User> {
    try {
      this.logger.log(`Fetching profile for user ${userId}`);
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) {
        this.logger.warn(`Profile fetch failed - user not found: ${userId}`);
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error(`Profile fetch failed for user ${userId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch user profile');
    }
  }
}
