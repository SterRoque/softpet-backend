import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { PrismaService } from 'src/database/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

interface IFindAllPetsRequest {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable()
export class PetsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly prisma: PrismaService,
  ) {}

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

    await this.cacheManager.del(adminId);

    return pet;
  }

  async findAll(
    adminId: string,
    { limit = 16, page = 1, search = '' }: IFindAllPetsRequest,
  ) {
    const skip = (page - 1) * limit;

    const pets = await this.prisma.pet.findMany({
      where: {
        name: {
          mode: 'insensitive',
          contains: search,
        },
        owner: {
          name: {
            mode: 'insensitive',
            contains: search,
          },
          admin_id: adminId,
        },
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    let totalPagesCached = await this.cacheManager.get(adminId);

    if (!totalPagesCached) {
      const totalPets = await this.prisma.pet.count();
      const totalPages = Math.ceil(totalPets / limit);

      const FIVE_MINUTES = 5 * 60 * 1000;

      totalPagesCached = totalPages;

      await this.cacheManager.set(adminId, totalPages, FIVE_MINUTES);
    }

    return {
      pets,
      totalPages: totalPagesCached,
    };
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

  async remove(adminId: string, id: string) {
    let pet = await this.prisma.pet.findFirst({
      where: {
        id,
        owner: {
          admin_id: adminId,
        },
      },
    });

    if (!pet) {
      return new NotFoundException({
        message: 'pet not found',
      });
    }

    pet = await this.prisma.pet.delete({
      where: {
        id,
      },
    });

    await this.cacheManager.del(adminId);

    return pet;
  }
}
