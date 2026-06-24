const axios = require('axios');
const colors = require('colors');

const CONFIG = {
  baseURL: 'http://localhost:5000',
  adminEmail: 'admin@example.com',
  adminPassword: 'admin123',
  userEmail: 'user@test.com',
  userPassword: 'test1234',
};

let ADMIN_TOKEN = '';
let USER_TOKEN = '';

const DATA = {
  productId: null,
  initialStock: 0,
  orderId: null,
  orderQuantity: 0,
};

const log = {
  info: (msg) => console.log(`[INFO] ${msg}`.blue),
  success: (msg) => console.log(`[OK] ${msg}`.green),
  error: (msg) => console.log(`[ERROR] ${msg}`.red),
  warn: (msg) => console.log(`[WARN] ${msg}`.yellow),
  separator: () => console.log('='.repeat(70).gray),
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

async function loginAdmin() {
  log.info('Логин администратора...');
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
  log.info('Логин пользователя...');
  try {
    const res = await api('post', '/auth/login', {
      email: CONFIG.userEmail,
      password: CONFIG.userPassword,
    });
    USER_TOKEN = res.data.token;
    log.success('Юзер-токен получен');
    return true;
  } catch (error) {
    log.error(`Ошибка логина пользователя: ${error.message}`);
    return false;
  }
}

// ==================== ПОЛУЧИТЬ ТОВАР ====================

async function getProduct() {
  log.info('Получение первого товара...');
  try {
    const res = await api('get', '/products', null, ADMIN_TOKEN);
    if (res.data.length === 0) {
      log.error('Нет товаров');
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

// ==================== ПОЛУЧИТЬ ТЕКУЩИЙ ОСТАТОК ====================

async function getCurrentStock() {
  log.info(`Получение остатка товара ${DATA.productId}...`);
  try {
    const res = await api('get', `/inventory/product/${DATA.productId}`, null, ADMIN_TOKEN);
    DATA.initialStock = res.data.quantity;
    log.success(`Текущий остаток: ${DATA.initialStock} шт.`);
    return res.data;
  } catch (error) {
    if (error.response?.status === 404) {
      log.warn('Инвентаризация не найдена');
      return null;
    }
    log.error(`Ошибка: ${error.message}`);
    return null;
  }
}

// ==================== СОЗДАТЬ ИНВЕНТАРИЗАЦИЮ ====================

async function createInventory() {
  log.info(`Создание инвентаризации для товара ${DATA.productId}...`);
  try {
    const quantity = 50;
    const res = await api('post', `/inventory/product/${DATA.productId}`, 
      { quantity: quantity, minStock: 5 }, 
      ADMIN_TOKEN
    );
    DATA.initialStock = quantity;
    log.success(`Инвентаризация создана: ${quantity} шт.`);
    return res.data;
  } catch (error) {
    if (error.response?.status === 400) {
      log.warn('Инвентаризация уже существует');
      return await getCurrentStock();
    }
    log.error(`Ошибка: ${error.message}`);
    return null;
  }
}

// ==================== ПРОВЕРИТЬ НАЛИЧИЕ ТОВАРА ====================

async function checkAvailability() {
  log.info(`Проверка наличия товара ${DATA.productId}...`);
  try {
    const quantity = 5;
    const res = await api('get', `/inventory/check/${DATA.productId}?quantity=${quantity}`, null, ADMIN_TOKEN);
    log.success(`Доступно: ${res.data.currentStock} шт., запрошено: ${quantity} шт.`);
    log.success(`В наличии: ${res.data.available ? 'Да' : 'Нет'}`);
    return res.data;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return null;
  }
}

// ==================== ОЧИСТИТЬ КОРЗИНУ ====================

async function clearCart() {
  log.info('Очистка корзины...');
  try {
    await api('delete', '/cart', null, USER_TOKEN);
    log.success('Корзина очищена');
    return true;
  } catch (error) {
    log.warn(`Ошибка очистки корзины: ${error.message}`);
    return false;
  }
}

// ==================== ДОБАВИТЬ ТОВАР В КОРЗИНУ ====================

async function addToCart(quantity) {
  log.info(`Добавление товара ${DATA.productId} в корзину (${quantity} шт.)...`);
  try {
    const data = { product_id: DATA.productId, quantity: quantity };
    const res = await api('post', '/cart', data, USER_TOKEN);
    log.success(`Товар добавлен в корзину: ${res.data.quantity} шт.`);
    DATA.orderQuantity = quantity;
    return res.data;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    if (error.response) console.log(error.response.data);
    return null;
  }
}

// ==================== ПОЛУЧИТЬ КОРЗИНУ ====================

async function getCart() {
  log.info('Получение корзины...');
  try {
    const res = await api('get', '/cart', null, USER_TOKEN);
    log.success(`В корзине ${res.data.length} товаров`);
    return res.data;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return null;
  }
}

// ==================== СОЗДАТЬ ЗАКАЗ ====================

async function createOrder() {
  log.info('Создание заказа...');
  try {
    const cart = await getCart();
    if (!cart || cart.length === 0) {
      log.warn('Корзина пуста');
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
    log.info(`Сумма: ${total} руб.`);
    return res.data;
  } catch (error) {
    log.error(`Ошибка создания заказа: ${error.message}`);
    if (error.response) console.log(error.response.data);
    return null;
  }
}

// ==================== ПРОВЕРИТЬ ИЗМЕНЕНИЕ ОСТАТКА ====================

async function verifyStockChange() {
  log.info('Проверка изменения остатка после заказа...');
  try {
    const res = await api('get', `/inventory/product/${DATA.productId}`, null, ADMIN_TOKEN);
    const currentStock = res.data.quantity;
    const expectedStock = DATA.initialStock - DATA.orderQuantity;
    
    log.info(`Начальный остаток: ${DATA.initialStock} шт.`);
    log.info(`Заказано: ${DATA.orderQuantity} шт.`);
    log.info(`Ожидаемый остаток: ${expectedStock} шт.`);
    log.info(`Фактический остаток: ${currentStock} шт.`);

    if (currentStock === expectedStock) {
      log.success('Количество уменьшилось корректно!');
      return true;
    } else {
      log.error(`Несоответствие! Ожидалось: ${expectedStock}, Фактически: ${currentStock}`);
      return false;
    }
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

// ==================== ПРОВЕРИТЬ ЗАКАЗ В БД ====================

async function verifyOrder() {
  log.info(`Проверка заказа ${DATA.orderId}...`);
  try {
    const res = await api('get', `/orders/${DATA.orderId}`, null, USER_TOKEN);
    if (res.data) {
      log.success(`Заказ найден: ${res.data.orderNumber}`);
      log.info(`Статус: ${res.data.status?.status_name || res.data.status_id}`);
      log.info(`Сумма: ${res.data.total_amount} руб.`);
      
      if (res.data.orderItems && res.data.orderItems.length > 0) {
        log.info('Товары в заказе:');
        res.data.orderItems.forEach((item, idx) => {
          console.log(`   ${idx + 1}. ${item.product?.name || 'Товар'} - ${item.quantity} шт. x ${item.price} руб.`);
        });
      }
      return true;
    }
    return false;
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

// ==================== ОТМЕНИТЬ ЗАКАЗ ====================

async function cancelOrder() {
  log.info(`Отмена заказа ${DATA.orderId}...`);
  try {
    const res = await api('put', `/orders/${DATA.orderId}/cancel`, null, USER_TOKEN);
    log.success(`Заказ ${DATA.orderId} отменён`);
    return res.data;
  } catch (error) {
    log.error(`Ошибка отмены: ${error.message}`);
    return null;
  }
}

// ==================== ПРОВЕРИТЬ ВОЗВРАТ ТОВАРОВ ====================

async function verifyStockReturn() {
  log.info('Проверка возврата товаров после отмены...');
  try {
    const res = await api('get', `/inventory/product/${DATA.productId}`, null, ADMIN_TOKEN);
    const currentStock = res.data.quantity;
    const expectedStock = DATA.initialStock;
    
    log.info(`Начальный остаток: ${DATA.initialStock} шт.`);
    log.info(`Текущий остаток: ${currentStock} шт.`);
    log.info(`Ожидаемый остаток: ${expectedStock} шт.`);

    if (currentStock === expectedStock) {
      log.success('Товары возвращены на склад!');
      return true;
    } else {
      log.error(`Несоответствие! Ожидалось: ${expectedStock}, Фактически: ${currentStock}`);
      return false;
    }
  } catch (error) {
    log.error(`Ошибка: ${error.message}`);
    return false;
  }
}

// ==================== ОСНОВНАЯ ФУНКЦИЯ ====================

async function testReservation() {
  console.log('╔═══════════════════════════════════════════════════════════╗'.cyan);
  console.log('║        🧪 ТЕСТ РЕЗЕРВИРОВАНИЯ ТОВАРОВ                   ║'.cyan);
  console.log('╚═══════════════════════════════════════════════════════════╝'.cyan);
  console.log();

  try {
    // 1. Логин
    await loginAdmin();
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
    let inventory = await getCurrentStock();
    await delay(200);

    // 4. Создание инвентаризации (если нет)
    if (!inventory) {
      await createInventory();
      await delay(200);
      inventory = await getCurrentStock();
    }

    // 5. Проверка наличия
    await checkAvailability();
    await delay(200);

    // 6. Очистка корзины
    await clearCart();
    await delay(200);

    // 7. Добавление в корзину
    const quantity = 3;
    await addToCart(quantity);
    await delay(200);

    // 8. Проверка корзины
    await getCart();
    await delay(200);

    // 9. Создание заказа
    await createOrder();
    await delay(200);

    if (DATA.orderId) {
      // 10. Проверка изменения остатка
      await verifyStockChange();
      await delay(200);

      // 11. Проверка заказа
      await verifyOrder();
      await delay(200);

      // 12. Отмена заказа
      await cancelOrder();
      await delay(200);

      // 13. Проверка возврата товаров
      await verifyStockReturn();
      await delay(200);
    }

    // Итог
    log.separator();
    console.log('╔═══════════════════════════════════════════════════════════╗'.cyan);
    console.log('║                    📊 ИТОГ                              ║'.cyan);
    console.log('╚═══════════════════════════════════════════════════════════╝'.cyan);
    console.log();

    console.log(`  Товар ID:          ${DATA.productId}`);
    console.log(`  Начальный остаток: ${DATA.initialStock} шт.`);
    console.log(`  Заказано:          ${DATA.orderQuantity} шт.`);
    console.log(`  Заказ ID:          ${DATA.orderId || 'Не создан'}`);

    console.log();
    if (DATA.orderId) {
      console.log('ТЕСТ ПРОЙДЕН: Товары резервируются и возвращаются!'.brightGreen);
    } else {
      console.log('ТЕСТ НЕ ЗАВЕРШЕН: Проверьте логи выше.'.brightYellow);
    }

  } catch (error) {
    console.error('Критическая ошибка:', error.message);
  }
}

testReservation();