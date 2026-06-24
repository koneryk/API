import { Injectable, HttpException, HttpStatus, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductInventory } from './inventory.model';
import { Product } from '../products/products.model';
import { RepositoryStock } from '../repository/repository.model';
import { Repository } from '../repository/repository.model';
import { Op } from 'sequelize';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectModel(ProductInventory)
    private inventoryModel: typeof ProductInventory,
    @InjectModel(Product)
    private productModel: typeof Product,
    @InjectModel(RepositoryStock)
    private repositoryStockModel: typeof RepositoryStock,
  ) {}

  async getProductStock(productId: ProductInventory["product_id"]): Promise<ProductInventory> {
    const inventory = await this.inventoryModel.findOne({
      where: { product_id: productId },
      include: [{ model: Product }],
    });

    if (!inventory) {
      throw new HttpException('Инвентаризация для этого товара не найдена', HttpStatus.NOT_FOUND);
    }

    return inventory;
  }

  async createInventory(productId: ProductInventory["product_id"], quantity: number = 0, minStock: number = 5): Promise<ProductInventory> {
    const product = await this.productModel.findByPk(productId);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    const existing = await this.inventoryModel.findOne({
      where: { product_id: productId },
    });

    if (existing) {
      throw new HttpException('Инвентаризация для этого товара уже существует', HttpStatus.BAD_REQUEST);
    }

    return this.inventoryModel.create({
      product_id: productId,
      quantity: quantity,
      min_stock: minStock,
      is_available: quantity > 0,
    } as any);
  }

  async updateStock(productId: RepositoryStock["product_id"], quantity: RepositoryStock["quantity"]): Promise<ProductInventory> {
    const inventory = await this.getProductStock(productId);
    
    await inventory.update({
      quantity: quantity,
      is_available: quantity > 0,
    });

    this.logger.log(`Товар ${productId}: обновлён остаток → ${quantity} шт.`);
    return inventory;
  }

  async addStock(productId: ProductInventory["product_id"], quantity: ProductInventory["quantity"]): Promise<ProductInventory> {
    const inventory = await this.getProductStock(productId);
    const newQuantity = inventory.quantity + quantity;
    
    await inventory.update({
      quantity: newQuantity,
      is_available: newQuantity > 0,
    });

    if (newQuantity > 0 && !inventory.is_available) {
      this.logger.log(`Товар ${productId} снова в наличии! (${newQuantity} шт.)`);
    }

    this.logger.log(`Товар ${productId}: добавлено ${quantity} шт. → ${newQuantity} шт.`);
    return inventory;
  }

  async reduceStock(productId: RepositoryStock["product_id"], quantity: RepositoryStock["quantity"]): Promise<ProductInventory> {
    const inventory = await this.getProductStock(productId);
    
    if (inventory.quantity < quantity) {
      throw new HttpException(
        `Недостаточно товара. Доступно: ${inventory.quantity}, запрошено: ${quantity}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const newQuantity = inventory.quantity - quantity;
    await inventory.update({
      quantity: newQuantity,
      is_available: newQuantity > 0,
    });

    if (newQuantity <= inventory.min_stock && newQuantity > 0) {
      this.logger.warn(`Низкий остаток товара ${productId}! Осталось: ${newQuantity} шт. (мин: ${inventory.min_stock})`);
    }

    if (newQuantity === 0) {
      this.logger.error(`Товар ${productId} закончился!`);
    }

    this.logger.log(`Товар ${productId}: уменьшено на ${quantity} шт. → ${newQuantity} шт.`);
    return inventory;
  }

  async checkAvailability(productId: ProductInventory['product_id'], quantity: ProductInventory["quantity"]): Promise<{
    available: boolean;
    currentStock: number;
    minStock: number;
    isAvailable: boolean;
  }> {
    const inventory = await this.inventoryModel.findOne({
      where: { product_id: productId },
    });

    if (!inventory) {
      return {
        available: false,
        currentStock: 0,
        minStock: 0,
        isAvailable: false,
      };
    }

    return {
      available: inventory.quantity >= quantity && inventory.is_available,
      currentStock: inventory.quantity,
      minStock: inventory.min_stock,
      isAvailable: inventory.is_available,
    };
  }

  async getLowStock(): Promise<ProductInventory[]> {
    return this.inventoryModel.findAll({
      where: {
        quantity: {
          [Op.lt]: this.inventoryModel.sequelize?.literal('min_stock'),
        },
      },
      include: [{ model: Product }],
      order: [['quantity', 'ASC']],
    });
  }

  async getAllInventory(): Promise<ProductInventory[]> {
    return this.inventoryModel.findAll({
      include: [{ model: Product }],
      order: [['product_id', 'ASC']],
    });
  }

  async bulkUpdateStock(updates: { productId: RepositoryStock["product_id"]; quantity: RepositoryStock["quantity"] }[]): Promise<void> {
    for (const update of updates) {
      await this.updateStock(update.productId, update.quantity);
    }
  }
  async syncInventory(productId: number): Promise<ProductInventory> {
    this.logger.log(`🔄 Синхронизация инвентаризации для товара ${productId}`);

    const stocks = await this.repositoryStockModel.findAll({
      where: { product_id: productId },
    });

    const totalQuantity = stocks.reduce((sum, s) => sum + s.quantity, 0);

    let inventory = await this.inventoryModel.findOne({
      where: { product_id: productId },
    });

    if (!inventory) {
      inventory = await this.inventoryModel.create({
        product_id: productId,
        quantity: totalQuantity,
        min_stock: 5,
        is_available: totalQuantity > 0,
      } as any);
      this.logger.log(`Создана инвентаризация для товара ${productId}: ${totalQuantity} шт.`);
    } else {
      const oldQuantity = inventory.quantity;
      await inventory.update({
        quantity: totalQuantity,
        is_available: totalQuantity > 0,
      });
      this.logger.log(`Инвентаризация обновлена: ${oldQuantity} → ${totalQuantity} шт.`);
    }

    return inventory;
  }
  async syncAllInventory(): Promise<{ synced: number; errors: number }> {
    this.logger.log('🔄 МАССОВАЯ СИНХРОНИЗАЦИЯ ИНВЕНТАРИЗАЦИИ');

    const products = await this.productModel.findAll();
    let synced = 0;
    let errors = 0;

    for (const product of products) {
      try {
        await this.syncInventory(product.id);
        synced++;
      } catch (error) {
        this.logger.error(`Ошибка синхронизации товара ${product.id}: ${error.message}`);
        errors++;
      }
    }

    this.logger.log(`Синхронизировано: ${synced} товаров, ошибок: ${errors}`);
    return { synced, errors };
  }
  async checkInventorySync(productId: ProductInventory["product_id"]): Promise<{
    isSynced: boolean;
    inventoryQuantity: number;
    repositoryTotal: number;
    difference: number;
    details: {
      repository_id: number;
      name: string;
      quantity: number;
    }[];
  }> {
    const inventory = await this.inventoryModel.findOne({
      where: { product_id: productId },
    });

    const stocks = await this.repositoryStockModel.findAll({
      where: { product_id: productId },
      include: [{ model: Repository }],
    });

    const repositoryTotal = stocks.reduce((sum, s) => sum + s.quantity, 0);
    const inventoryQuantity = inventory?.quantity || 0;

    return {
      isSynced: inventoryQuantity === repositoryTotal,
      inventoryQuantity: inventoryQuantity,
      repositoryTotal: repositoryTotal,
      difference: repositoryTotal - inventoryQuantity,
      details: stocks.map(s => ({
        repository_id: s.repository_id,
        name: s.repository?.name || 'Неизвестный склад',
        quantity: s.quantity,
      })),
    };
  }
  async checkAllInventorySync(): Promise<{
    total: number;
    synced: number;
    notSynced: number;
    details: {
      product_id: number;
      product_name: string;
      inventoryQuantity: number;
      repositoryTotal: number;
      difference: number;
      isSynced: boolean;
    }[];
  }> {
    const products = await this.productModel.findAll();
    const result = {
      total: products.length,
      synced: 0,
      notSynced: 0,
      details: [] as any[],
    };

    for (const product of products) {
      const check = await this.checkInventorySync(product.id);
      result.details.push({
        product_id: product.id,
        product_name: product.name,
        inventoryQuantity: check.inventoryQuantity,
        repositoryTotal: check.repositoryTotal,
        difference: check.difference,
        isSynced: check.isSynced,
      });

      if (check.isSynced) {
        result.synced++;
      } else {
        result.notSynced++;
      }
    }

    return result;
  }

  async getOutOfStockProducts(): Promise<ProductInventory[]> {
    return this.inventoryModel.findAll({
      where: { quantity: 0 },
      include: [{ model: Product }],
    });
  }

  async getInventoryReport(): Promise<{
    totalProducts: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
    products: {
      productId: number;
      name: string;
      quantity: number;
      minStock: number;
      status: 'in_stock' | 'low_stock' | 'out_of_stock';
    }[];
  }> {
    const allInventory = await this.inventoryModel.findAll({
      include: [{ model: Product }],
    });

    const result = {
      totalProducts: allInventory.length,
      inStock: 0,
      outOfStock: 0,
      lowStock: 0,
      products: [] as any[],
    };

    for (const inv of allInventory) {
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
      
      if (inv.quantity === 0) {
        status = 'out_of_stock';
        result.outOfStock++;
      } else if (inv.quantity <= inv.min_stock) {
        status = 'low_stock';
        result.lowStock++;
      } else {
        result.inStock++;
      }

      result.products.push({
        productId: inv.product_id,
        name: inv.product?.name || 'Неизвестный товар',
        quantity: inv.quantity,
        minStock: inv.min_stock,
        status,
      });
    }

    return result;
  }
}