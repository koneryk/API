import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pet } from './pets.model';
import { Breed } from './breeds.model';
import { Species } from './species.model';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { User } from '../users/users.model';

@Injectable()
export class PetsService {
  constructor(
      @InjectModel(Pet)
      private petModel: typeof Pet,
      @InjectModel(Breed)
      private breedModel: typeof Breed,
      @InjectModel(Species)
      private speciesModel: typeof Species,
  ) {}


  async createPet(createPetDto: CreatePetDto, userId: number): Promise<Pet> {
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

  async findAllPets(): Promise<Pet[]> {
    return this.petModel.findAll({
      include: [
        { model: User },
        { model: Breed, include: [{ model: Species }] },
      ],
    });
  }

  async findPetsByUser(userId: number): Promise<Pet[]> {
    return this.petModel.findAll({
      where: { user_id: userId },
      include: [{ model: Breed, include: [{ model: Species }] }],
    });
  }

  async findOnePet(id: number): Promise<Pet> {
    const pet = await this.petModel.findByPk(id, {
      include: [
        { model: User },
        { model: Breed, include: [{ model: Species }] },
      ],
    });

    if (!pet) {
      throw new HttpException('Питомец не найден', HttpStatus.NOT_FOUND);
    }

    return pet;
  }

  async updatePet(id: number, updatePetDto: UpdatePetDto): Promise<Pet> {
    const pet = await this.findOnePet(id);
    await pet.update(updatePetDto);
    return this.findOnePet(id);
  }

  async removePet(id: number): Promise<void> {
    const pet = await this.findOnePet(id);
    await pet.destroy();
  }


  async createBreed(createBreedDto: CreateBreedDto): Promise<Breed> {
    const species = await this.speciesModel.findByPk(createBreedDto.species_id);
    if (!species) {
      throw new HttpException('Вид не найден', HttpStatus.NOT_FOUND);
    }

    const breedData = {
      species_id: createBreedDto.species_id,
      name: createBreedDto.name,
      description: createBreedDto.description,
      size: createBreedDto.size,
    };
    return this.breedModel.create(breedData as any);
  }

  async findAllBreeds(): Promise<Breed[]> {
    return this.breedModel.findAll({
      include: [
        { model: Species },
        { model: Pet },
      ],
    });
  }

  async findBreedsBySpecies(speciesId: number): Promise<Breed[]> {
    const species = await this.speciesModel.findByPk(speciesId);
    if (!species) {
      throw new HttpException('Вид не найден', HttpStatus.NOT_FOUND);
    }

    return this.breedModel.findAll({
      where: { species_id: speciesId },
      include: [{ model: Species }],
    });
  }

  async findOneBreed(id: number): Promise<Breed> {
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

  async updateBreed(id: number, updateBreedDto: UpdateBreedDto): Promise<Breed> {
    const breed = await this.findOneBreed(id);
    await breed.update(updateBreedDto);
    return this.findOneBreed(id);
  }

  async removeBreed(id: number): Promise<void> {
    const breed = await this.findOneBreed(id);
    await breed.destroy();
  }


  async createSpecies(createSpeciesDto: CreateSpeciesDto): Promise<Species> {
    const speciesData = {
      name: createSpeciesDto.name,
      description: createSpeciesDto.description,
    };
    return this.speciesModel.create(speciesData as any);
  }

  async findAllSpecies(): Promise<Species[]> {
    return this.speciesModel.findAll({
      include: [{ model: Breed }],
    });
  }

  async findOneSpecies(id: number): Promise<Species> {
    const species = await this.speciesModel.findByPk(id, {
      include: [{ model: Breed }],
    });

    if (!species) {
      throw new HttpException('Вид не найден', HttpStatus.NOT_FOUND);
    }

    return species;
  }

  async updateSpecies(id: number, updateSpeciesDto: UpdateSpeciesDto): Promise<Species> {
    const species = await this.findOneSpecies(id);
    await species.update(updateSpeciesDto);
    return this.findOneSpecies(id);
  }

  async removeSpecies(id: number): Promise<void> {
    const species = await this.findOneSpecies(id);
    await species.destroy();
  }
}