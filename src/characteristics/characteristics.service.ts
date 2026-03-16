import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Characteristic } from './characteristics.model';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';
import { ProductCharacteristic } from '../product-characteristics/product-characteristics.model';

@Injectable()
export class CharacteristicsService {
  constructor(
    @InjectModel(Characteristic)
    private characteristicModel: typeof Characteristic,
  ) {}

  async create(createCharacteristicDto: CreateCharacteristicDto): Promise<Characteristic> {
    const characteristicData = {
      name: createCharacteristicDto.name,
      type: createCharacteristicDto.type,
    };
    return this.characteristicModel.create(characteristicData as any); 
  }

  async findAll(): Promise<Characteristic[]> {
    return this.characteristicModel.findAll({
      include: [{ model: ProductCharacteristic }],
    });
  }

  async findOne(id: number): Promise<Characteristic> {
    const characteristic = await this.characteristicModel.findByPk(id, {
      include: [{ model: ProductCharacteristic }],
    });

    if (!characteristic) {
      throw new HttpException('Характеристика не найдена', HttpStatus.NOT_FOUND);
    }

    return characteristic;
  }

  async update(id: number, updateCharacteristicDto: UpdateCharacteristicDto): Promise<Characteristic> {
    const characteristic = await this.findOne(id);
    await characteristic.update(updateCharacteristicDto);
    return characteristic;
  }

  async remove(id: number): Promise<void> {
    const characteristic = await this.findOne(id);
    await characteristic.destroy();
  }
}