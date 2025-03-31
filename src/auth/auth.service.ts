import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        email: signInDto.email,
      },
    });

    if (!admin) {
      return new UnauthorizedException({
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      signInDto.password,
      admin.password_hash,
    );

    if (!isPasswordValid) {
      return new UnauthorizedException({
        message: 'Invalid credentials',
      });
    }

    const payload = {
      sub: admin.id,
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token: access_token,
    };
  }
}
