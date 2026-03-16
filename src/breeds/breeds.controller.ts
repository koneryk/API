import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Breed } from './breeds.model';
import { BreedsService } from './breeds.service';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Породы')
@ApiBearerAuth()
@Controller('breeds')
export class BreedsController {
  constructor(private readonly breedsService: BreedsService) {}

  @ApiOperation({ summary: 'Создание новой породы' })
  @ApiResponse({ status: 201, type: Breed, description: 'Порода создана' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createBreedDto: CreateBreedDto) {
    return this.breedsService.create(createBreedDto);
  }

  @ApiOperation({ summary: 'Получение всех пород' })
  @ApiResponse({ status: 200, type: [Breed], description: 'Список пород' })
  @Get()
  findAll() {
    return this.breedsService.findAll();
  }

  @ApiOperation({ summary: 'Получение пород по виду животного' })
  @ApiResponse({ status: 200, type: [Breed], description: 'Породы вида' })
  @Get('by-species/:speciesId')
  findBySpecies(@Param('speciesId') speciesId: string) {
    return this.breedsService.findBySpecies(+speciesId);
  }

  @ApiOperation({ summary: 'Получение породы по ID' })
  @ApiResponse({ status: 200, type: Breed, description: 'Порода найдена' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.breedsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление породы' })
  @ApiResponse({ status: 200, type: Breed, description: 'Порода обновлена' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateBreedDto: UpdateBreedDto) {
    return this.breedsService.update(+id, updateBreedDto);
  }

  @ApiOperation({ summary: 'Удаление породы' })
  @ApiResponse({ status: 200, description: 'Порода удалена' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.breedsService.remove(+id);
  }
}