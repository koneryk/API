import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Species } from './species.model';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { Breed } from '../breeds/breeds.model';

@Injectable()
export class SpeciesService {
  constructor(
    @InjectModel(Species)
    private speciesModel: typeof Species,
  ) {}

  async create(createSpeciesDto: CreateSpeciesDto): Promise<Species> {
    const speciesData = {
      name: createSpeciesDto.name,
      description: createSpeciesDto.description,
    };
    return this.speciesModel.create(speciesData as any); 
  }

  async findAll(): Promise<Species[]> {
    return this.speciesModel.findAll({
      include: [{ model: Breed }],
    });
  }

  async findOne(id: number): Promise<Species> {
    const species = await this.speciesModel.findByPk(id, {
      include: [{ model: Breed }],
    });

    if (!species) {
      throw new HttpException('Вид не найден', HttpStatus.NOT_FOUND);
    }

    return species;
  }

  async update(id: number, updateSpeciesDto: UpdateSpeciesDto): Promise<Species> {
    const species = await this.findOne(id);
    await species.update(updateSpeciesDto);
    return species;
  }

  async remove(id: number): Promise<void> {
    const species = await this.findOne(id);
    await species.destroy();
  }
}