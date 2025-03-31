import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const adminExists = await this.prisma.admin.findUnique({
      where: {
        email: createAdminDto.email,
      },
    });

    if (adminExists) {
      return new ConflictException({
        message: 'admin already exists',
      });
    }

    const admin = await this.prisma.admin.create({
      data: {
        first_name: createAdminDto.first_name,
        last_name: createAdminDto.last_name,
        email: createAdminDto.email,
        password_hash: await bcrypt.hash(createAdminDto.password, 10),
      },
    });

    return {
      ...admin,
      password_hash: undefined,
    };
  }

  async remove(id: string) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        id,
      },
    });

    if (!admin) {
      return new NotFoundException('admin not found');
    }

    await this.prisma.admin.delete({
      where: {
        id,
      },
    });
  }
}
