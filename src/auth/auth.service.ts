import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: any) {
    try {
      const userData = await this.validateUser(user.email, user.password);
      
      if (!userData) {
        throw new UnauthorizedException('Invalid credentials');
      }
      
      const payload = { 
        email: userData.email, 
        sub: userData.id,
        role: userData.role
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        }
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
