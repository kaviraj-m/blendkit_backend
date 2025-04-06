import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findOne(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Ensure consistent role format - use the role object directly
      // The RolesGuard will handle whether it's a string or an object with name property
      return {
        id: payload.sub,
        userId: payload.sub, // Keep for backward compatibility
        email: payload.email,
        role: user.role
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
} 