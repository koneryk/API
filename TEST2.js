const axios = require('axios');
const colors = require('colors');

// Конфигурация
const CONFIG = {
  baseURL: 'http://localhost:5000',
  adminEmail: 'admin@example.com',
  adminPassword: 'admin123',
};

let ADMIN_TOKEN = '';

// Хранение созданных ID
const IDs = {
  categoryId: null,
  brandId: null,
  productId: null,
  characteristicId: null,
  discountId: null,
  speciesId: null,
  breedId: null,
  petId: null,
  reviewId: null,
  orderId: null,
  orderStatusId: null,
};

const log = {
  info: (msg) => console.log(`${msg}`.blue),
  success: (msg) => console.log(` ${msg}`.green),
  error: (msg) => console.log(`${msg}`.red),
  warn: (msg) => console.log(`${msg}`.yellow),
  separator: () => console.log('═'.repeat(80).gray),
};

const api = (method, url, data = null, token = null) => {
  const config = {
    method,
    url,
    baseURL: CONFIG.baseURL,
    headers: {},
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (data && (method === 'post' || method === 'put')) {
    config.data = data;
  }

  return axios(config);
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== ЗАПОЛНЕНИЕ ТАБЛИЦ ====================

async function login() {
  log.info('🔑 Логин администратора...');
  try {
    const res = await api('post', '/auth/login', {
      email: CONFIG.adminEmail,
      password: CONFIG.adminPassword,
    });
    ADMIN_TOKEN = res.data.token;
    log.success('Токен получен');
    return true;
  } catch (error) {
    log.error(`Ошибка логина: ${error.message}`);
    return false;
  }
}

async function createCategory() {
  log.info('📁 Создание категории...');
  try {
    const data = { name: `Category ${Date.now()}` };
    const res = await api('post', '/categories', data, ADMIN_TOKEN);
    IDs.categoryId = res.data.id;
    log.success(`Категория создана ID: ${IDs.categoryId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createBrand() {
  log.info('🏷️ Создание бренда...');
  try {
    const data = { name: `Brand ${Date.now()}` };
    const res = await api('post', '/brands', data, ADMIN_TOKEN);
    IDs.brandId = res.data.id;
    log.success(`Бренд создан ID: ${IDs.brandId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createProduct() {
  log.info('📦 Создание товара...');
  try {
    const data = {
      sku: `SKU-${Date.now()}`,
      name: `Product ${Date.now()}`,
      category_id: IDs.categoryId,
      brand_id: IDs.brandId,
      price: 1000,
      stock: 50,
      description: 'Test product description',
      ingredients: 'Test ingredients',
    };
    const res = await api('post', '/products', data, ADMIN_TOKEN);
    IDs.productId = res.data.id;
    log.success(`Товар создан ID: ${IDs.productId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    if (error.response) console.log(error.response.data);
    return false;
  }
}

async function createCharacteristic() {
  log.info('Создание характеристики...');
  try {
    const data = { name: `Characteristic ${Date.now()}`, type: 'STRING' };
    const res = await api('post', '/characteristics', data, ADMIN_TOKEN);
    IDs.characteristicId = res.data.id;
    log.success(`Характеристика создана ID: ${IDs.characteristicId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createProductCharacteristic() {
  log.info('🔗 Привязка характеристики к товару...');
  try {
    const data = {
      product_id: IDs.productId,
      characteristic_id: IDs.characteristicId,
      value: 'Test value 123',
    };
    const res = await api('post', '/products/characteristics', data, ADMIN_TOKEN);
    log.success(`Характеристика привязана к товару`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createDiscount() {
  log.info('🏷️ Создание скидки...');
  try {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);
    
    const data = {
      code: `DISCOUNT-${Date.now().toString().slice(-6)}`,
      name: `Discount ${Date.now()}`,
      type: 'PERCENTAGE',
      value: 15,
      min_order: 500,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      is_active: true,
    };
    const res = await api('post', '/discounts', data, ADMIN_TOKEN);
    IDs.discountId = res.data.id;
    log.success(`Скидка создана ID: ${IDs.discountId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createDiscountProduct() {
  log.info('🔗 Привязка скидки к товару...');
  try {
    const data = {
      discount_id: IDs.discountId,
      product_id: IDs.productId,
    };
    const res = await api('post', '/discount-products', data, ADMIN_TOKEN);
    log.success(`Скидка привязана к товару`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createSpecies() {
  log.info('🐾 Создание вида...');
  try {
    const data = { name: `Species ${Date.now()}` };
    const res = await api('post', '/pets/species', data, ADMIN_TOKEN);
    IDs.speciesId = res.data.id;
    log.success(`Вид создан ID: ${IDs.speciesId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createBreed() {
  log.info('🐕 Создание породы...');
  try {
    const data = {
      species_id: IDs.speciesId,
      name: `Breed ${Date.now()}`,
      description: 'Test breed description',
      size: 'medium',
    };
    const res = await api('post', '/pets/breeds', data, ADMIN_TOKEN);
    IDs.breedId = res.data.id;
    log.success(`Порода создана ID: ${IDs.breedId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createPet() {
  log.info('🐶 Создание питомца...');
  try {
    // Сначала получим пользователя
    const usersRes = await api('get', '/users', null, ADMIN_TOKEN);
    const userId = usersRes.data[0]?.id || 1;
    
    const data = {
      breed_id: IDs.breedId,
      name: `Pet ${Date.now()}`,
      birth_date: '2020-01-01',
      weight: 5.5,
      gender: 'male',
      notes: 'Test pet notes',
    };
    const res = await api('post', '/pets', data, ADMIN_TOKEN);
    IDs.petId = res.data.id;
    log.success(`Питомец создан ID: ${IDs.petId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createReview() {
  log.info('⭐ Создание отзыва...');
  try {
    // Сначала получим пользователя
    const usersRes = await api('get', '/users', null, ADMIN_TOKEN);
    const userId = usersRes.data[0]?.id || 1;
    
    const data = {
      product_id: IDs.productId,
      rating: 5,
      comment: 'Great product! Test review.',
    };
    const res = await api('post', '/reviews', data, ADMIN_TOKEN);
    IDs.reviewId = res.data.id;
    log.success(`Отзыв создан ID: ${IDs.reviewId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createOrderStatus() {
  log.info('📋 Создание статуса заказа...');
  try {
    const data = {
      status_name: 'pending',
      description: 'Заказ ожидает обработки',
    };
    const res = await api('post', '/orders/statuses', data, ADMIN_TOKEN);
    IDs.orderStatusId = res.data.id;
    log.success(`Статус заказа создан ID: ${IDs.orderStatusId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

async function createOrder() {
  log.info('📦 Создание заказа...');
  try {
    // Сначала получим пользователя
    const usersRes = await api('get', '/users', null, ADMIN_TOKEN);
    const userId = usersRes.data[0]?.id || 1;
    
    const data = {
      status_id: 1,
      total_amount: 2000,
      shipping_address: 'Test Address 123',
      payment_method: 'cash',
      items: [
        {
          product_id: IDs.productId,
          quantity: 2,
          price: 1000,
        },
      ],
    };
    const res = await api('post', '/orders', data, ADMIN_TOKEN);
    IDs.orderId = res.data.id;
    log.success(`Заказ создан ID: ${IDs.orderId}`);
    return true;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    if (error.response) console.log(error.response.data);
    return false;
  }
}

// ==================== ГЛАВНАЯ ФУНКЦИЯ ====================

async function seedDatabase() {
  console.log('╔══════════════════════════════════════════════════╗'.cyan);
  console.log('║        🌱 ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ              ║'.cyan);
  console.log('╚══════════════════════════════════════════════════╝'.cyan);
  console.log();

  // 1. Логин
  const loggedIn = await login();
  if (!loggedIn) {
    log.error('Не удалось войти в систему');
    return;
  }
  await delay(300);

  // 2. Создание категории
  await createCategory();
  await delay(200);

  // 3. Создание бренда
  await createBrand();
  await delay(200);

  // 4. Создание товара
  await createProduct();
  await delay(200);

  // 5. Создание характеристики
  await createCharacteristic();
  await delay(200);

  // 6. Привязка характеристики к товару
  await createProductCharacteristic();
  await delay(200);

  // 7. Создание скидки
  await createDiscount();
  await delay(200);

  // 8. Привязка скидки к товару
  await createDiscountProduct();
  await delay(200);

  // 9. Создание вида
  await createSpecies();
  await delay(200);

  // 10. Создание породы
  await createBreed();
  await delay(200);

  // 11. Создание питомца
  await createPet();
  await delay(200);

  // 12. Создание отзыва
  await createReview();
  await delay(200);

  // 13. Создание статуса заказа
  await createOrderStatus();
  await delay(200);

  // 14. Создание заказа
  await createOrder();
  await delay(200);

  // ИТОГ
  log.separator();
  console.log('╔══════════════════════════════════════════════════╗'.cyan);
  console.log('║                 ИТОГ                        ║'.cyan);
  console.log('╚══════════════════════════════════════════════════╝'.cyan);
  console.log();

  console.log(`  📁 Категория:     ${IDs.categoryId || '❌'}`);
  console.log(`  🏷️  Бренд:        ${IDs.brandId || '❌'}`);
  console.log(`  📦 Товар:         ${IDs.productId || '❌'}`);
  console.log(`  Характеристика: ${IDs.characteristicId || '❌'}`);
  console.log(`  🏷️  Скидка:       ${IDs.discountId || '❌'}`);
  console.log(`  🐾 Вид:           ${IDs.speciesId || '❌'}`);
  console.log(`  🐕 Порода:        ${IDs.breedId || '❌'}`);
  console.log(`  🐶 Питомец:       ${IDs.petId || '❌'}`);
  console.log(`  ⭐ Отзыв:         ${IDs.reviewId || '❌'}`);
  console.log(`  📋 Статус заказа: ${IDs.orderStatusId || '❌'}`);
  console.log(`  📦 Заказ:         ${IDs.orderId || '❌'}`);

  console.log();
  console.log(' БАЗА ДАННЫХ УСПЕШНО ЗАПОЛНЕНА!'.brightGreen);
}

// Запуск
seedDatabase().catch(error => {
  console.error('Критическая ошибка:', error);
});