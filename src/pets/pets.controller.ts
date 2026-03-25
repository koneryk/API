import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Pet } from './pets.model';
import { Breed } from './breeds.model';
import { Species } from './species.model';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CreateBreedDto } from './dto/create-breed.dto';
import { UpdateBreedDto } from './dto/update-breed.dto';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles-auth.decorator';

@ApiTags('Питомцы')
@ApiBearerAuth()
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}


  @ApiOperation({ summary: 'Добавление нового питомца' })
  @ApiResponse({ status: 201, type: Pet, description: 'Питомец добавлен' })
  @Post()
  createPet(@Body() createPetDto: CreatePetDto, @Req() req) {
    const userId = req.user.id;
    return this.petsService.createPet(createPetDto, userId);
  }

  @ApiOperation({ summary: 'Получение всех питомцев пользователя' })
  @ApiResponse({ status: 200, type: [Pet], description: 'Список питомцев' })
  @Get('my')
  findMyPets(@Req() req) {
    const userId = req.user.id;
    return this.petsService.findPetsByUser(userId);
  }

  @ApiOperation({ summary: 'Получение всех питомцев' })
  @ApiResponse({ status: 200, type: [Pet], description: 'Список всех питомцев' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get()
  findAllPets() {
    return this.petsService.findAllPets();
  }

  @ApiOperation({ summary: 'Получение питомцев по пользователю' })
  @ApiResponse({ status: 200, type: [Pet], description: 'Список питомцев' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get('user/:userId')
  findPetsByUser(@Param('userId') userId: string) {
    return this.petsService.findPetsByUser(+userId);
  }

  @ApiOperation({ summary: 'Получение питомца по ID' })
  @ApiResponse({ status: 200, type: Pet, description: 'Питомец найден' })
  @Get(':id')
  findOnePet(@Param('id') id: string) {
    return this.petsService.findOnePet(+id);
  }

  @ApiOperation({ summary: 'Обновление информации о питомце' })
  @ApiResponse({ status: 200, type: Pet, description: 'Питомец обновлен' })
  @Put(':id')
  updatePet(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.updatePet(+id, updatePetDto);
  }

  @ApiOperation({ summary: 'Удаление питомца' })
  @ApiResponse({ status: 200, description: 'Питомец удален' })
  @Delete(':id')
  removePet(@Param('id') id: string) {
    return this.petsService.removePet(+id);
  }


  @ApiOperation({ summary: 'Создание новой породы' })
  @ApiResponse({ status: 201, type: Breed, description: 'Порода создана' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('breeds')
  createBreed(@Body() createBreedDto: CreateBreedDto) {
    return this.petsService.createBreed(createBreedDto);
  }

  @ApiOperation({ summary: 'Получение всех пород' })
  @ApiResponse({ status: 200, type: [Breed], description: 'Список пород' })
  @Get('breeds')
  findAllBreeds() {
    return this.petsService.findAllBreeds();
  }

  @ApiOperation({ summary: 'Получение пород по виду животного' })
  @ApiResponse({ status: 200, type: [Breed], description: 'Породы вида' })
  @Get('breeds/by-species/:speciesId')
  findBreedsBySpecies(@Param('speciesId') speciesId: string) {
    return this.petsService.findBreedsBySpecies(+speciesId);
  }

  @ApiOperation({ summary: 'Получение породы по ID' })
  @ApiResponse({ status: 200, type: Breed, description: 'Порода найдена' })
  @Get('breeds/:id')
  findOneBreed(@Param('id') id: string) {
    return this.petsService.findOneBreed(+id);
  }

  @ApiOperation({ summary: 'Обновление породы' })
  @ApiResponse({ status: 200, type: Breed, description: 'Порода обновлена' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('breeds/:id')
  updateBreed(@Param('id') id: string, @Body() updateBreedDto: UpdateBreedDto) {
    return this.petsService.updateBreed(+id, updateBreedDto);
  }

  @ApiOperation({ summary: 'Удаление породы' })
  @ApiResponse({ status: 200, description: 'Порода удалена' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('breeds/:id')
  removeBreed(@Param('id') id: string) {
    return this.petsService.removeBreed(+id);
  }


  @ApiOperation({ summary: 'Создание нового вида животных' })
  @ApiResponse({ status: 201, type: Species, description: 'Вид создан' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Post('species')
  createSpecies(@Body() createSpeciesDto: CreateSpeciesDto) {
    return this.petsService.createSpecies(createSpeciesDto);
  }

  @ApiOperation({ summary: 'Получение всех видов животных' })
  @ApiResponse({ status: 200, type: [Species], description: 'Список видов' })
  @Get('species')
  findAllSpecies() {
    return this.petsService.findAllSpecies();
  }

  @ApiOperation({ summary: 'Получение вида по ID' })
  @ApiResponse({ status: 200, type: Species, description: 'Вид найден' })
  @Get('species/:id')
  findOneSpecies(@Param('id') id: string) {
    return this.petsService.findOneSpecies(+id);
  }

  @ApiOperation({ summary: 'Обновление вида' })
  @ApiResponse({ status: 200, type: Species, description: 'Вид обновлен' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Put('species/:id')
  updateSpecies(@Param('id') id: string, @Body() updateSpeciesDto: UpdateSpeciesDto) {
    return this.petsService.updateSpecies(+id, updateSpeciesDto);
  }

  @ApiOperation({ summary: 'Удаление вида' })
  @ApiResponse({ status: 200, description: 'Вид удален' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete('species/:id')
  removeSpecies(@Param('id') id: string) {
    return this.petsService.removeSpecies(+id);
  }
}