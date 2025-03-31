import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findAll(adminId: string) {
    const pets = await this.prisma.pet.findMany({
      where: {
        owner: {
          admin_id: adminId,
        },
      },

      include: {
        owner: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });
    return pets;
  }

  async update(adminId: string, id: string, updatePetDto: UpdatePetDto) {
    let pet = await this.prisma.pet.findFirst({
      where: {
        id,
        owner: {
          admin_id: adminId,
        },
      },
    });

    if (!pet?.owner_id) {
      return new NotFoundException({
        message: 'pet not found',
      });
    }

    await this.prisma.owner.update({
      where: {
        id: pet.owner_id,
      },
      data: {
        name: updatePetDto.owner_name || undefined,
        phone: updatePetDto.owner_phone || undefined,
      },
    });

    pet = await this.prisma.pet.update({
      where: {
        id,
      },
      data: {
        name: updatePetDto.pet_name,
        breed: updatePetDto.pet_breed,
        species: updatePetDto.pet_species,
        birthday_date: updatePetDto.pet_birthday_date,
      },
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    return pet;
  }

  remove(id: number) {
    return `This action removes a #${id} pet`;
  }
}
