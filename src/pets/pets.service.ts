import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pet } from './pets.model';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { User } from '../users/users.model';
import { Breed } from '../breeds/breeds.model';

@Injectable()
export class PetsService {
  constructor(
    @InjectModel(Pet)
    private petModel: typeof Pet,
  ) {}

  async create(createPetDto: CreatePetDto, userId: number): Promise<Pet> {
    const petData = {
      user_id: userId,
      breed_id: createPetDto.breed_id,
      name: createPetDto.name,
      birth_date: createPetDto.birth_date,
      weight: createPetDto.weight,
      gender: createPetDto.gender,
      notes: createPetDto.notes,
    };
    return this.petModel.create(petData as any); 
  }

  async findAll(): Promise<Pet[]> {
    return this.petModel.findAll({
      include: [
        { model: User },
        { model: Breed },
      ],
    });
  }

  async findByUser(userId: number): Promise<Pet[]> {
    return this.petModel.findAll({
      where: { user_id: userId },
      include: [{ model: Breed }],
    });
  }

  async findOne(id: number): Promise<Pet> {
    const pet = await this.petModel.findByPk(id, {
      include: [
        { model: User },
        { model: Breed },
      ],
    });

    if (!pet) {
      throw new HttpException('Питомец не найден', HttpStatus.NOT_FOUND);
    }

    return pet;
  }

  async update(id: number, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOne(id);
    await pet.update(updatePetDto);
    return pet;
  }

  async remove(id: number): Promise<void> {
    const pet = await this.findOne(id);
    await pet.destroy();
  }
}