import { PetSpecies } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  pet_name: string;

  @IsEnum(PetSpecies)
  @IsNotEmpty()
  pet_species: keyof typeof PetSpecies | PetSpecies;

  @IsString()
  @IsNotEmpty()
  pet_breed: string;

  @IsString()
  @IsNotEmpty()
  pet_birthday_date: string;

  @IsString()
  @IsNotEmpty()
  owner_name: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('BR')
  owner_phone: string;
}
