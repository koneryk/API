import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from './categories.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from '../products/products.model';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const categoryData = {
      name: createCategoryDto.name,
      parent_id: createCategoryDto.parent_id,
      description: createCategoryDto.description,
      image_url: createCategoryDto.image_url,
    };
    return this.categoryModel.create(categoryData as any);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.findAll({
      include: [
        { model: Category, as: 'parent' },
        { model: Category, as: 'children' },
        { model: Product },
      ],
    });
  }

  async findRoot(): Promise<Category[]> {
    return this.categoryModel.findAll({
      where: { parent_id: null } as any,
      include: [
        { model: Category, as: 'children' },
        { model: Product },
      ],
    });
  }

  async findChildren(parentId: number): Promise<Category[]> {
    return this.categoryModel.findAll({
      where: { parent_id: parentId } as any,
      include: [{ model: Product }],
    });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryModel.findByPk(id, {
      include: [
        { model: Category, as: 'parent' },
        { model: Category, as: 'children' },
        { model: Product },
      ],
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    await category.update(updateCategoryDto);
    return category;
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await category.destroy();
  }
}