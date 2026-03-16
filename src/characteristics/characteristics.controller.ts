import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Characteristic } from './characteristics.model';
import { CharacteristicsService } from './characteristics.service';
import { CreateCharacteristicDto } from './dto/create-characteristic.dto';
import { UpdateCharacteristicDto } from './dto/update-characteristic.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Характеристики товаров')
@ApiBearerAuth()
@Controller('characteristics')
export class CharacteristicsController {
  constructor(
    private readonly characteristicsService: CharacteristicsService,
  ) {}

  @ApiOperation({ summary: 'Создание новой характеристики' })
  @ApiResponse({
    status: 201,
    type: Characteristic,
    description: 'Характеристика создана',
  })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createCharacteristicDto: CreateCharacteristicDto) {
    return this.characteristicsService.create(createCharacteristicDto);
  }

  @ApiOperation({ summary: 'Получение всех характеристик' })
  @ApiResponse({
    status: 200,
    type: [Characteristic],
    description: 'Список характеристик',
  })
  @Get()
  findAll() {
    return this.characteristicsService.findAll();
  }

  @ApiOperation({ summary: 'Получение характеристики по ID' })
  @ApiResponse({
    status: 200,
    type: Characteristic,
    description: 'Характеристика найдена',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.characteristicsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление характеристики' })
  @ApiResponse({
    status: 200,
    type: Characteristic,
    description: 'Характеристика обновлена',
  })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCharacteristicDto: UpdateCharacteristicDto,
  ) {
    return this.characteristicsService.update(+id, updateCharacteristicDto);
  }

  @ApiOperation({ summary: 'Удаление характеристики' })
  @ApiResponse({ status: 200, description: 'Характеристика удалена' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.characteristicsService.remove(+id);
  }
}