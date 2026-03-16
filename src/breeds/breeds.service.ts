import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Breed } from './breeds.model';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { Species } from '../species/species.model';
import { Pet } from '../pets/pets.model';

@Injectable()
export class BreedsService {
  constructor(
    @InjectModel(Breed)
    private breedModel: typeof Breed,
  ) {}

  async create(createBreedDto: CreateBreedDto): Promise<Breed> {
    const breedData = {
      species_id: createBreedDto.species_id,
      name: createBreedDto.name,
      description: createBreedDto.description,
      size: createBreedDto.size,
    };
    return this.breedModel.create(breedData as any); 
  }

  async findAll(): Promise<Breed[]> {
    return this.breedModel.findAll({
      include: [
        { model: Species },
        { model: Pet },
      ],
    });
  }

  async findBySpecies(speciesId: number): Promise<Breed[]> {
    return this.breedModel.findAll({
      where: { species_id: speciesId },
      include: [{ model: Species }],
    });
  }

  async findOne(id: number): Promise<Breed> {
    const breed = await this.breedModel.findByPk(id, {
      include: [
        { model: Species },
        { model: Pet },
      ],
    });

    if (!breed) {
      throw new HttpException('Порода не найдена', HttpStatus.NOT_FOUND);
    }

    return breed;
  }

  async update(id: number, updateBreedDto: UpdateBreedDto): Promise<Breed> {
    const breed = await this.findOne(id);
    await breed.update(updateBreedDto);
    return breed;
  }

  async remove(id: number): Promise<void> {
    const breed = await this.findOne(id);
    await breed.destroy();
  }
}