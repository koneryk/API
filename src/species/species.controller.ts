import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Species } from './species.model';
import { SpeciesService } from './species.service';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Виды животных')
@ApiBearerAuth()
@Controller('species')
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @ApiOperation({ summary: 'Создание нового вида животных' })
  @ApiResponse({ status: 201, type: Species, description: 'Вид создан' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createSpeciesDto: CreateSpeciesDto) {
    return this.speciesService.create(createSpeciesDto);
  }

  @ApiOperation({ summary: 'Получение всех видов животных' })
  @ApiResponse({ status: 200, type: [Species], description: 'Список видов' })
  @Get()
  findAll() {
    return this.speciesService.findAll();
  }

  @ApiOperation({ summary: 'Получение вида по ID' })
  @ApiResponse({ status: 200, type: Species, description: 'Вид найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.speciesService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление вида' })
  @ApiResponse({ status: 200, type: Species, description: 'Вид обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateSpeciesDto: UpdateSpeciesDto) {
    return this.speciesService.update(+id, updateSpeciesDto);
  }

  @ApiOperation({ summary: 'Удаление вида' })
  @ApiResponse({ status: 200, description: 'Вид удален' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.speciesService.remove(+id);
  }
}