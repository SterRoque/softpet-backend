import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { IsPublic } from 'src/auth/decorators/is-public.decorator';
import { Admin } from '@prisma/client';
import { CurrentAdmin } from 'src/auth/decorators/current-admin.decorator';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Post()
  @IsPublic()
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  getMe(@CurrentAdmin() admin: Admin) {
    return admin;
  }

  @Delete()
  remove(@CurrentAdmin() admin: Admin) {
    return this.adminsService.remove(admin.id);
  }
}
