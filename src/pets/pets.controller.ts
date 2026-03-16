import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Pet } from './pets.model';
import { PetsService } from './pets.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
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
  create(@Body() createPetDto: CreatePetDto, @Req() req) {
    const userId = req.user.id;
    return this.petsService.create(createPetDto, userId);
  }

  @ApiOperation({ summary: 'Получение всех питомцев пользователя' })
  @ApiResponse({ status: 200, type: [Pet], description: 'Список питомцев' })
  @Get('my')
  findMyPets(@Req() req) {
    const userId = req.user.id;
    return this.petsService.findByUser(userId);
  }

  @ApiOperation({ summary: 'Получение питомцев по пользователю' })
  @ApiResponse({ status: 200, type: [Pet], description: 'Список питомцев' })
  @Roles('ADMIN', 'MANAGER')
  @UseGuards(RolesGuard)
  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.petsService.findByUser(+userId);
  }

  @ApiOperation({ summary: 'Получение питомца по ID' })
  @ApiResponse({ status: 200, type: Pet, description: 'Питомец найден' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.petsService.findOne(+id);
  }

  @ApiOperation({ summary: 'Обновление информации о питомце' })
  @ApiResponse({ status: 200, type: Pet, description: 'Питомец обновлен' })
  @Put(':id')
  update(@Param('id') id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(+id, updatePetDto);
  }

  @ApiOperation({ summary: 'Удаление питомца' })
  @ApiResponse({ status: 200, description: 'Питомец удален' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.petsService.remove(+id);
  }
}