import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CurrentAdmin } from 'src/auth/decorators/current-admin.decorator';
import { Admin } from '@prisma/client';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  create(@CurrentAdmin() admin: Admin, @Body() createPetDto: CreatePetDto) {
    return this.petsService.create(admin.id, createPetDto);
  }

  @Get()
  findAll(
    @CurrentAdmin() admin: Admin,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.petsService.findAll(admin.id, {
      page: +page,
      limit: +limit,
      search,
    });
  }

  @Patch(':id')
  update(
    @CurrentAdmin() admin: Admin,
    @Param('id') id: string,
    @Body() updatePetDto: UpdatePetDto,
  ) {
    return this.petsService.update(admin.id, id, updatePetDto);
  }

  @Delete(':id')
  remove(@CurrentAdmin() admin: Admin, @Param('id') id: string) {
    return this.petsService.remove(admin.id, id);
  }
}
