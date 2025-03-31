import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(adminId: string, createPetDto: CreatePetDto) {
    let owner = await this.prisma.owner.findFirst({
      where: {
        phone: createPetDto.owner_phone,
        admin_id: adminId,
      },
    });

    if (!owner) {
      owner = await this.prisma.owner.create({
        data: {
          name: createPetDto.owner_name.trim(),
          phone: createPetDto.owner_phone,
          admin_id: adminId,
        },
      });
    }

    if (owner && owner.name !== createPetDto.owner_name.trim()) {
      throw new ConflictException({
        message: 'Phone already exists!',
      });
    }

    let pet = await this.prisma.pet.findFirst({
      where: {
        name: createPetDto.pet_name,
        owner_id: owner.id,
      },
    });

    if (pet) {
      throw new ConflictException({
        message: 'Pet already exists!',
      });
    }

    pet = await this.prisma.pet.create({
      data: {
        name: createPetDto.pet_name,
        breed: createPetDto.pet_breed,
        birthday_date: new Date(createPetDto.pet_birthday_date),
        species: createPetDto.pet_species,
        owner_id: owner.id,
      },
    });

    return pet;
  }

  findAll() {
    return `This action returns all pets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pet`;
  }

  update(id: number, updatePetDto: UpdatePetDto) {
    return `This action updates a #${id} pet`;
  }

  remove(id: number) {
    return `This action removes a #${id} pet`;
  }
}
