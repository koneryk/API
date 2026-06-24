import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Repository, RepositoryStock } from './repository.model';
import { Product } from '../products/products.model';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import { CreateRepositoryStockDto } from './dto/create-repository-stock.dto';
import { UpdateRepositoryStockDto } from './dto/update-repository-stock.dto';
import { MoveStockDto } from './dto/move-stock.dto';
import { Op } from 'sequelize';

type RepositoryResponse = {
  repository_id: number;
  name: string;
  quantity: number;
};

type CheckStockResponse = {
  available: boolean;
  totalStock: number;
  repositories: RepositoryResponse[];
};

type MoveStockResponse = {
  from: RepositoryStock;
  to: RepositoryStock;
};

@Injectable()
export class RepositoryService {
  constructor(
    @InjectModel(Repository)
    private repositoryModel: typeof Repository,
    @InjectModel(RepositoryStock)
    private repositoryStockModel: typeof RepositoryStock,
    @InjectModel(Product)
    private productModel: typeof Product,
  ) {}

  private validateId(id: Repository['id'] | string): Repository['id'] {
    const num = Number(id);
    if (isNaN(num) || num <= 0) {
      throw new HttpException(
        `Некорректный ID: должен быть положительным числом`,
        HttpStatus.BAD_REQUEST
      );
    }
    return num;
  }

  private validateNumber(value: RepositoryStock['quantity'] | string): RepositoryStock['quantity'] {
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      throw new HttpException(
        `Количество должно быть неотрицательным числом`,
        HttpStatus.BAD_REQUEST
      );
    }
    return num;
  }

  async createRepository(createDto: CreateRepositoryDto): Promise<Repository> {
    return this.repositoryModel.create(createDto as any);
  }

  async findAllRepositories(): Promise<Repository[]> {
    return this.repositoryModel.findAll({
      include: [{ model: RepositoryStock }],
    });
  }

  async findOneRepository(id: Repository['id'] | string): Promise<Repository> {
    const validId = this.validateId(id);
    
    const repository = await this.repositoryModel.findByPk(validId, {
      include: [{ model: RepositoryStock }],
    });
    
    if (!repository) {
      throw new HttpException('Склад не найден', HttpStatus.NOT_FOUND);
    }
    return repository;
  }

  async updateRepository(
    id: Repository['id'] | string,
    updateDto: UpdateRepositoryDto
  ): Promise<Repository> {
    const validId = this.validateId(id);
    const repository = await this.findOneRepository(validId);
    await repository.update(updateDto);
    return repository;
  }

  async removeRepository(id: Repository['id'] | string): Promise<void> {
    const validId = this.validateId(id);
    const repository = await this.findOneRepository(validId);
    await repository.destroy();
  }

  async createStock(createDto: CreateRepositoryStockDto): Promise<RepositoryStock> {
    const repositoryId = this.validateId(createDto.repository_id);
    const productId = this.validateId(createDto.product_id);
    const quantity = this.validateNumber(createDto.quantity);

    const repository = await this.repositoryModel.findByPk(repositoryId);
    if (!repository) {
      throw new HttpException('Склад не найден', HttpStatus.NOT_FOUND);
    }

    const product = await this.productModel.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const existing = await this.repositoryStockModel.findOne({
      where: {
        repository_id: repositoryId,
        product_id: productId,
      },
    });

    if (existing) {
      throw new HttpException('Остаток для этого товара на складе уже существует', HttpStatus.BAD_REQUEST);
    }

    const stockData: Partial<RepositoryStock> = {
      repository_id: repositoryId,
      product_id: productId,
      quantity: quantity,
      min_stock: createDto.min_stock || 5,
      location: createDto.location || undefined,
    };

    return this.repositoryStockModel.create(stockData as any);
  }

  async findAllStocks(): Promise<RepositoryStock[]> {
    return this.repositoryStockModel.findAll({
      include: [
        { model: Repository },
        { model: Product },
      ],
    });
  }

  async findStocksByRepository(
    repositoryId: RepositoryStock['repository_id'] | string
  ): Promise<RepositoryStock[]> {
    const validId = this.validateId(repositoryId);
    
    return this.repositoryStockModel.findAll({
      where: { repository_id: validId },
      include: [{ model: Product }],
    });
  }

  async findStocksByProduct(
    productId: RepositoryStock['product_id'] | string
  ): Promise<RepositoryStock[]> {
    const validId = this.validateId(productId);
    
    return this.repositoryStockModel.findAll({
      where: { product_id: validId },
      include: [{ model: Repository }],
    });
  }

  async findOneStock(id: RepositoryStock['id'] | string): Promise<RepositoryStock> {
    const validId = this.validateId(id);
    
    const stock = await this.repositoryStockModel.findByPk(validId, {
      include: [
        { model: Repository },
        { model: Product },
      ],
    });
    
    if (!stock) {
      throw new HttpException('Остаток не найден', HttpStatus.NOT_FOUND);
    }
    return stock;
  }

  async updateStock(
    id: RepositoryStock['id'] | string,
    updateDto: UpdateRepositoryStockDto
  ): Promise<RepositoryStock> {
    const validId = this.validateId(id);
    const stock = await this.findOneStock(validId);
    
    if (updateDto.quantity !== undefined) {
      updateDto.quantity = this.validateNumber(updateDto.quantity);
    }
    
    await stock.update(updateDto);
    return stock;
  }

  async removeStock(id: RepositoryStock['id'] | string): Promise<void> {
    const validId = this.validateId(id);
    const stock = await this.findOneStock(validId);
    await stock.destroy();
  }

  async moveStock(moveDto: MoveStockDto): Promise<MoveStockResponse> {
    const fromRepositoryId = this.validateId(moveDto.from_repository_id);
    const toRepositoryId = this.validateId(moveDto.to_repository_id);
    const productId = this.validateId(moveDto.product_id);
    const quantity = this.validateNumber(moveDto.quantity);

    if (quantity <= 0) {
      throw new HttpException('Количество для перемещения должно быть больше 0', HttpStatus.BAD_REQUEST);
    }

    const fromRepository = await this.repositoryModel.findByPk(fromRepositoryId);
    if (!fromRepository) {
      throw new HttpException('Склад-источник не найден', HttpStatus.NOT_FOUND);
    }

    const toRepository = await this.repositoryModel.findByPk(toRepositoryId);
    if (!toRepository) {
      throw new HttpException('Склад-назначение не найден', HttpStatus.NOT_FOUND);
    }

    const product = await this.productModel.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const fromStock = await this.repositoryStockModel.findOne({
      where: {
        repository_id: fromRepositoryId,
        product_id: productId,
      },
    });

    if (!fromStock) {
      throw new HttpException('Товар не найден на складе-источнике', HttpStatus.NOT_FOUND);
    }

    if (fromStock.quantity < quantity) {
      throw new HttpException(
        `Недостаточно товара на складе-источнике. Доступно: ${fromStock.quantity}`,
        HttpStatus.BAD_REQUEST
      );
    }

    let toStock = await this.repositoryStockModel.findOne({
      where: {
        repository_id: toRepositoryId,
        product_id: productId,
      },
    });

    if (!toStock) {
      toStock = await this.repositoryStockModel.create({
        repository_id: toRepositoryId,
        product_id: productId,
        quantity: 0,
        min_stock: fromStock.min_stock || 5,
      } as any);
    }

    await fromStock.update({ quantity: fromStock.quantity - quantity });
    await toStock.update({ quantity: toStock.quantity + quantity });

    return { from: fromStock, to: toStock };
  }

  async checkStock(
    productId: RepositoryStock['product_id'],
    quantity: RepositoryStock['quantity']
  ): Promise<CheckStockResponse> {
    const validProductId = this.validateId(productId);
    const validQuantity = this.validateNumber(quantity);

    const stocks = await this.repositoryStockModel.findAll({
      where: { product_id: validProductId },
      include: [{ model: Repository }],
    });

    const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);

    return {
      available: totalStock >= validQuantity,
      totalStock: totalStock,
      repositories: stocks.map((s): RepositoryResponse => ({
        repository_id: s.repository_id,
        name: s.repository?.name || 'Неизвестный склад',
        quantity: s.quantity,
      })),
    };
  }

  async getLowStock(threshold?: RepositoryStock['min_stock']): Promise<RepositoryStock[]> {
    const validThreshold = threshold !== undefined 
      ? this.validateNumber(threshold)
      : 5;

    const where: any = {
      quantity: {
        [Op.lt]: validThreshold,
      },
    };

    return this.repositoryStockModel.findAll({
      where,
      include: [
        { model: Repository },
        { model: Product },
      ],
      order: [['quantity', 'ASC']],
    });
  }

  async reserveStock(
    productId: RepositoryStock['product_id'] | string,
    quantity: RepositoryStock['quantity'] | string,
    repositoryId?: RepositoryStock['repository_id'] | string
  ): Promise<void> {
    const validProductId = this.validateId(productId);
    const validQuantity = this.validateNumber(quantity);
    
    let validRepositoryId: number | undefined;
    if (repositoryId !== undefined) {
      validRepositoryId = this.validateId(repositoryId);
    }

    const where: any = {
      product_id: validProductId,
      quantity: { [Op.gt]: 0 },
    };
    
    if (validRepositoryId) {
      where.repository_id = validRepositoryId;
    }

    const stocks = await this.repositoryStockModel.findAll({
      where,
      order: [['quantity', 'DESC']],
    });

    let remaining = validQuantity;
    for (const stock of stocks) {
      if (remaining <= 0) break;
      const deduct = Math.min(stock.quantity, remaining);
      await stock.update({ quantity: stock.quantity - deduct });
      remaining -= deduct;
    }

    if (remaining > 0) {
      throw new HttpException(
        `Недостаточно товара на складе. Не хватает: ${remaining}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }
}