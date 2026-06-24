const axios = require('axios');
const colors = require('colors');

// Конфигурация
const CONFIG = {
  baseURL: 'http://localhost:5000',
  adminEmail: 'admin@example.com',
  adminPassword: 'admin123',
};

let ADMIN_TOKEN = '';
let USER_TOKEN = '';

// Хранение данных
const DATA = {
  productId: null,
  warehouseId: null,
  orderId: null,
  initialStock: 0,
  cartItems: [],
};

const log = {
  info: (msg) => console.log(`ℹ️ ${msg}`.blue),
  success: (msg) => console.log(`${msg}`.green),
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

// ==================== АУТЕНТИФИКАЦИЯ ====================

async function login() {
  log.info('🔑 Логин администратора...');
  try {
    const res = await api('post', '/auth/login', {
      email: CONFIG.adminEmail,
      password: CONFIG.adminPassword,
    });
    ADMIN_TOKEN = res.data.token;
    log.success('Админ-токен получен');
    return true;
  } catch (error) {
    log.error(`Ошибка логина: ${error.message}`);
    return false;
  }
}

async function loginUser() {
  log.info('🔑 Логин пользователя...');
  try {
    const res = await api('post', '/auth/login', {
      email: 'user@test.com',
      password: 'test1234',
    });
    USER_TOKEN = res.data.token;
    log.success('Юзер-токен получен');
    return true;
  } catch (error) {
    log.error(`Ошибка логина пользователя: ${error.message}`);
    return false;
  }
}

// ==================== ПОЛУЧИТЬ ПЕРВЫЙ ТОВАР ====================

async function getProduct() {
  log.info('Получение первого товара...');
  try {
    const res = await api('get', '/products', null, ADMIN_TOKEN);
    if (res.data.length === 0) {
      log.error('Нет товаров! Сначала создайте товары.');
      return false;
    }
    DATA.productId = res.data[0].id;
    log.success(`Товар ID: ${DATA.productId} - ${res.data[0].name}`);
    return true;
  } catch (error) {
    log.error(`Ошибка получения товаров: ${error.message}`);
    return false;
  }
}

// ==================== ПРОВЕРКА ИНВЕНТАРИЗАЦИИ ====================

async function checkInventory(productId) {
  log.info(`🔍 Проверка инвентаризации товара ${productId}...`);
  try {
    const res = await api('get', `/inventory/product/${productId}`, null, ADMIN_TOKEN);
    DATA.initialStock = res.data.quantity;
    log.success(`Текущий остаток: ${res.data.quantity} шт.`);
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      log.warn(`Инвентаризация для товара ${productId} не найдена`);
      return null;
    }
    log.error(`Ошибка проверки инвентаризации: ${error.message}`);
    return null;
  }
}

// ==================== СОЗДАТЬ ИНВЕНТАРИЗАЦИЮ ====================

async function createInventory(productId, quantity = 100) {
  log.info(`Создание инвентаризации для товара ${productId} (${quantity} шт.)...`);
  try {
    const res = await api('post', `/inventory/product/${productId}`, 
      { quantity: quantity, minStock: 5 }, 
      ADMIN_TOKEN
    );
    log.success(`Инвентаризация создана: ${res.data.quantity} шт.`);
    return res.data;
  } catch (error) {
    if (error.response?.status === 400) {
      log.warn('Инвентаризация уже существует');
      return await checkInventory(productId);
    }
    log.error(`Ошибка создания инвентаризации: ${error.message}`);
    return null;
  }
}

// ==================== ДОБАВИТЬ ТОВАР В КОРЗИНУ ====================

async function addToCart(productId, quantity) {
  log.info(`🛒 Добавление товара ${productId} в корзину (${quantity} шт.)...`);
  try {
    const data = { product_id: productId, quantity: quantity };
    const res = await api('post', '/cart', data, USER_TOKEN);
    log.success(`Товар добавлен в корзину: ${res.data.quantity} шт.`);
    DATA.cartItems.push({ productId, quantity });
    return res.data;
  } catch (error) {
    log.error(`Ошибка добавления в корзину: ${error.message}`);
    if (error.response) console.log(error.response.data);
    return null;
  }
}

// ==================== ПОЛУЧИТЬ КОРЗИНУ ====================

async function getCart() {
  log.info('🛒 Получение корзины...');
  try {
    const res = await api('get', '/cart', null, USER_TOKEN);
    log.success(`В корзине ${res.data.length} товаров`);
    return res.data;
  } catch (error) {
    log.error(`Ошибка получения корзины: ${error.message}`);
    return null;
  }
}

// ==================== ПРОВЕРИТЬ НАЛИЧИЕ В КОРЗИНЕ ====================

async function checkCartAvailability() {
  log.info('🔍 Проверка наличия товаров в корзине...');
  try {
    const res = await api('get', '/cart/check-availability', null, USER_TOKEN);
    if (res.data.available) {
      log.success('Все товары в наличии');
    } else {
      log.warn('Некоторые товары отсутствуют на складе');
    }
    console.log('📊 Результат:');
    res.data.items.forEach((item, idx) => {
      const status = item.in_stock ? '✅' : '❌';
      console.log(`   ${idx + 1}. ${item.name} - запрошено: ${item.requested}, доступно: ${item.available} ${status}`);
    });
    return res.data;
  } catch (error) {
    log.error(`Ошибка проверки наличия: ${error.message}`);
    return null;
  }
}

// ==================== СОЗДАТЬ ЗАКАЗ ====================

async function createOrder() {
  log.info('Создание заказа...');
  try {
    // Получаем корзину
    const cart = await getCart();
    if (!cart || cart.length === 0) {
      log.warn('Корзина пуста!');
      return null;
    }

    const items = cart.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.product?.price || 1000,
    }));

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      status_id: 1,
      total_amount: total,
      shipping_address: 'г. Москва, ул. Тестовая, д.1',
      payment_method: 'card',
      items: items,
    };

    const res = await api('post', '/orders', orderData, USER_TOKEN);
    DATA.orderId = res.data.id;
    log.success(`Заказ создан ID: ${DATA.orderId}`);
    log.info(`💰 Общая сумма: ${total} руб.`);
    return res.data;
  } catch (error) {
    log.error(`Ошибка создания заказа: ${error.message}`);
    if (error.response) console.log(error.response.data);
    return null;
  }
}

// ==================== ПРОВЕРИТЬ ИНВЕНТАРИЗАЦИЮ ПОСЛЕ ЗАКАЗА ====================

async function checkInventoryAfterOrder() {
  log.info('🔍 Проверка инвентаризации после заказа...');
  try {
    const inventory = await checkInventory(DATA.productId);
    if (!inventory) return null;

    const expectedStock = DATA.initialStock - DATA.cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    log.info(`📊 Начальный остаток: ${DATA.initialStock} шт.`);
    log.info(`Заказано: ${DATA.cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт.`);
    log.info(`📊 Ожидаемый остаток: ${expectedStock} шт.`);
    log.info(`📊 Фактический остаток: ${inventory.quantity} шт.`);

    if (inventory.quantity === expectedStock) {
      log.success('Количество товара уменьшилось корректно!');
    } else {
      log.error(`Несоответствие! Ожидалось: ${expectedStock}, Фактически: ${inventory.quantity}`);
    }

    return inventory;
  } catch (error) {
    log.error(`Ошибка проверки инвентаризации: ${error.message}`);
    return null;
  }
}

// ==================== ПРОВЕРИТЬ СКЛАДЫ ====================

async function checkWarehouses() {
  log.info('🏭 Проверка складов...');
  try {
    const res = await api('get', '/repository', null, ADMIN_TOKEN);
    log.success(`Всего складов: ${res.data.length}`);
    
    console.log('\n📊 Список складов:');
    res.data.forEach((repo, idx) => {
      console.log(`   ${idx + 1}. ${repo.name} (ID: ${repo.id})`);
      if (repo.stocks && repo.stocks.length > 0) {
        console.log(`      Товаров на складе: ${repo.stocks.length}`);
        repo.stocks.forEach((stock) => {
          console.log(`         - Товар ID: ${stock.product_id}, ${stock.quantity} шт.`);
        });
      } else {
        console.log(`      Товаров на складе: 0`);
      }
    });
    return res.data;
  } catch (error) {
    log.error(`Ошибка проверки складов: ${error.message}`);
    return null;
  }
}

// ==================== ПРОВЕРКА НАЛИЧИЯ НА СКЛАДАХ ====================

async function checkWarehouseStock(productId) {
  log.info(`🔍 Проверка наличия товара ${productId} на складах...`);
  try {
    const res = await api('get', `/repository/check/${productId}/1`, null, ADMIN_TOKEN);
    log.success(`Всего на складах: ${res.data.totalStock} шт.`);
    
    if (res.data.repositories && res.data.repositories.length > 0) {
      console.log('📊 Распределение по складам:');
      res.data.repositories.forEach((repo, idx) => {
        console.log(`   ${idx + 1}. ${repo.name} - ${repo.quantity} шт.`);
      });
    }
    return res.data;
  } catch (error) {
    log.error(`Ошибка проверки складов: ${error.message}`);
    return null;
  }
}

// ==================== ОЧИСТИТЬ КОРЗИНУ ====================

async function clearCart() {
  log.info('🗑️ Очистка корзины...');
  try {
    await api('delete', '/cart', null, USER_TOKEN);
    log.success('Корзина очищена');
    return true;
  } catch (error) {
    log.error(`Ошибка очистки корзины: ${error.message}`);
    return false;
  }
}

// ==================== ГЛАВНАЯ ФУНКЦИЯ ====================

async function testWarehouseFlow() {
  console.log('╔══════════════════════════════════════════════════╗'.cyan);
  console.log('║        🏭 ТЕСТИРОВАНИЕ СКЛАДА                 ║'.cyan);
  console.log('║        ПРОВЕРКА УМЕНЬШЕНИЯ ТОВАРА           ║'.cyan);
  console.log('╚══════════════════════════════════════════════════╝'.cyan);
  console.log();

  try {
    // 1. Логин
    await login();
    await delay(300);
    await loginUser();
    await delay(300);

    // 2. Получение товара
    await getProduct();
    await delay(200);

    if (!DATA.productId) {
      log.error('Нет товара для тестирования');
      return;
    }

    // 3. Проверка инвентаризации
    let inventory = await checkInventory(DATA.productId);
    await delay(200);

    // 4. Если инвентаризации нет - создаём
    if (!inventory) {
      await createInventory(DATA.productId, 100);
      await delay(200);
      inventory = await checkInventory(DATA.productId);
    }

    // 5. Проверка складов
    await checkWarehouses();
    await delay(200);

    // 6. Проверка наличия на складах
    await checkWarehouseStock(DATA.productId);
    await delay(200);

    // 7. Очистка корзины перед тестом
    await clearCart();
    await delay(200);

    // 8. Добавление товара в корзину
    const quantity = 3;
    await addToCart(DATA.productId, quantity);
    await delay(200);

    // 9. Проверка корзины
    await getCart();
    await delay(200);

    // 10. Проверка наличия в корзине
    await checkCartAvailability();
    await delay(200);

    // 11. Создание заказа
    await createOrder();
    await delay(200);

    // 12. Проверка инвентаризации после заказа
    await checkInventoryAfterOrder();
    await delay(200);

    // 13. Проверка наличия на складах после заказа
    await checkWarehouseStock(DATA.productId);
    await delay(200);

    // 14. Очистка корзины
    await clearCart();

    // ИТОГ
    log.separator();
    console.log('╔══════════════════════════════════════════════════╗'.cyan);
    console.log('║                 📊 ИТОГ                        ║'.cyan);
    console.log('╚══════════════════════════════════════════════════╝'.cyan);
    console.log();

    console.log(`  Товар ID:          ${DATA.productId}`);
    console.log(`  📊 Начальный остаток: ${DATA.initialStock} шт.`);
    console.log(`  🛒 Заказано:          ${DATA.cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт.`);
    console.log(`  📊 Остаток после:     ${DATA.initialStock - DATA.cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт.`);
    console.log(`  Заказ ID:          ${DATA.orderId || '❌'}`);

    console.log();
    console.log('ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!'.brightGreen);
    console.log();
    console.log('📝 Проверьте:'.yellow);
    console.log('   - Инвентаризация уменьшилась на количество заказанных товаров'.gray);
    console.log('   - Остатки на складах обновились'.gray);
    console.log('   - Заказ создан успешно'.gray);

  } catch (error) {
    console.error('Критическая ошибка:', error.message);
  }
}

// Запуск
testWarehouseFlow();