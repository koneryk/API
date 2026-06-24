import { Injectable, HttpException, HttpStatus, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CartItem } from './cart.model';
import { Product } from '../products/products.model';
import { InventoryService } from '../inventory/inventory.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export interface CartItemWithProduct {
  product_id: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
    price: number;
    stock?: number;
  };
}

export interface AvailabilityItem {
  product_id: number;
  name: string;
  requested: number;
  available: number;
  in_stock: boolean;
}

export interface TotalItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  in_stock: boolean;
  available: number;
}

export interface AvailabilityResult {
  available: boolean;
  items: AvailabilityItem[];
}

export interface TotalResult {
  total: number;
  items: TotalItem[];
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(CartItem)
    private cartModel: typeof CartItem,
    @InjectModel(Product)
    private productModel: typeof Product,
    @Inject(forwardRef(() => InventoryService))
    private inventoryService: InventoryService,
  ) {}

  async getCart(userId: CartItem["user_id"]): Promise<CartItem[]> {
    const cartItems = await this.cartModel.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: [
            'id',
            'name',
            'price',
            'is_active',
            'sku',
            'description',
          ],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    const result: CartItem[] = [];
    for (const item of cartItems) {
      const product = item.product as any;
      if (product) {
        try {
          const inventory = await this.inventoryService.getProductStock(product.id);
          product.dataValues.in_stock = inventory.quantity > 0;
          product.dataValues.available_quantity = inventory.quantity;
        } catch (error) {
          product.dataValues.in_stock = false;
          product.dataValues.available_quantity = 0;
        }
      }
      result.push(item);
    }
    return result;
  }

  async addToCart(userId: CartItem["user_id"], addToCartDto: AddToCartDto): Promise<CartItem> {
    const { product_id, quantity = 1 } = addToCartDto;

    const product = await this.productModel.findByPk(product_id);
    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    if (!product.is_active) {
      throw new HttpException('Товар недоступен', HttpStatus.BAD_REQUEST);
    }

    const availability = await this.inventoryService.checkAvailability(product_id, quantity);
    if (!availability.available) {
      throw new HttpException(
        `Недостаточно товара на складе. Доступно: ${availability.currentStock}`,
        HttpStatus.BAD_REQUEST
      );
    }

    let cartItem = await this.cartModel.findOne({
      where: {
        user_id: userId,
        product_id: product_id,
      },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + quantity;
      
      const newAvailability = await this.inventoryService.checkAvailability(product_id, newQuantity);
      if (!newAvailability.available) {
        throw new HttpException(
          `Недостаточно товара на складе. Доступно: ${availability.currentStock}, в корзине: ${cartItem.quantity}`,
          HttpStatus.BAD_REQUEST
        );
      }
      
      cartItem.quantity = newQuantity;
      await cartItem.save();
    } else {
      cartItem = await this.cartModel.create({
        user_id: userId,
        product_id: product_id,
        quantity: quantity,
      } as any);
    }

    return cartItem;
  }

  async updateQuantity(
    userId: CartItem["user_id"],
    productId: CartItem["product_id"],
    updateDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const { quantity } = updateDto;

    const cartItem = await this.cartModel.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (!cartItem) {
      throw new HttpException('Товар не найден в корзине', HttpStatus.NOT_FOUND);
    }

    const availability = await this.inventoryService.checkAvailability(productId, quantity);
    if (!availability.available) {
      throw new HttpException(
        `Недостаточно товара на складе. Доступно: ${availability.currentStock}`,
        HttpStatus.BAD_REQUEST
      );
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return cartItem;
  }

  async removeFromCart(
    userId: CartItem["user_id"],
    productId: CartItem["product_id"],
  ): Promise<void> {
    const cartItem = await this.cartModel.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (!cartItem) {
      throw new HttpException('Товар не найден в корзине', HttpStatus.NOT_FOUND);
    }

    await cartItem.destroy();
  }

  async clearCart(userId: CartItem["user_id"]): Promise<void> {
    await this.cartModel.destroy({
      where: { user_id: userId },
    });
  }

  async checkAvailability(userId: CartItem["user_id"]): Promise<AvailabilityResult> {
    const cartItems = await this.cartModel.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
        },
      ],
    });

    const result: AvailabilityResult = {
      available: true,
      items: [],
    };

    for (const item of cartItems) {
      const product = item.product as any;
      
      if (!product) {
        continue;
      }
      
      let currentStock = 0;
      try {
        const inventory = await this.inventoryService.getProductStock(product.id);
        currentStock = inventory.quantity;
      } catch (error) {
        currentStock = 0;
      }
      
      const inStock = currentStock > 0;

      if (currentStock < item.quantity) {
        result.available = false;
      }

      result.items.push({
        product_id: item.product_id,
        name: product.name || 'Товар не найден',
        requested: item.quantity,
        available: currentStock,
        in_stock: inStock,
      });
    }

    return result;
  }

  async getTotal(userId: CartItem["user_id"]): Promise<TotalResult> {
    const cartItems = await this.cartModel.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
        },
      ],
    });

    let total = 0;
    const items: TotalItem[] = [];

    for (const item of cartItems) {
      const product = item.product as any;
      
      if (!product) {
        continue;
      }
      
      let currentStock = 0;
      try {
        const inventory = await this.inventoryService.getProductStock(product.id);
        currentStock = inventory.quantity;
      } catch (error) {
        currentStock = 0;
      }
      
      const subtotal = item.quantity * product.price;
      total += subtotal;

      items.push({
        product_id: item.product_id,
        name: product.name || 'Товар не найден',
        price: product.price || 0,
        quantity: item.quantity,
        subtotal: subtotal,
        in_stock: currentStock > 0,
        available: currentStock,
      });
    }

    return { total, items };
  }

  async reserveCartItems(userId: CartItem["user_id"]): Promise<void> {
    const cartItems = await this.cartModel.findAll({
      where: { user_id: userId },
    });

    for (const item of cartItems) {
      await this.inventoryService.reduceStock(item.product_id, item.quantity);
    }
  }
}