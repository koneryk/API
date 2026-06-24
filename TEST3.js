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
  repositoryIds: [],
  stockIds: [],
  productIds: [],
};

const log = {
  info: (msg) => console.log(`ℹ️ ${msg}`.blue),
  success: (msg) => console.log(`✅ ${msg}`.green),
  error: (msg) => console.log(`❌ ${msg}`.red),
  warn: (msg) => console.log(`⚠️ ${msg}`.yellow),
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
    log.success('Токен получен');
    return true;
  } catch (error) {
    log.error(`Ошибка логина: ${error.message}`);
    return false;
  }
}

// ==================== ПОЛУЧИТЬ ТОВАРЫ ====================

async function getProducts() {
  log.info('Получение списка товаров...');
  try {
    const res = await api('get', '/products', null, ADMIN_TOKEN);
    IDs.productIds = res.data.map(p => p.id);
    log.success(`Найдено ${IDs.productIds.length} товаров`);
    return true;
  } catch (error) {
    log.error(`Ошибка получения товаров: ${error.message}`);
    return false;
  }
}

// ==================== ПРОВЕРИТЬ СУЩЕСТВУЕТ ЛИ ОСТАТОК ====================

async function checkStockExists(repositoryId, productId) {
  try {
    const res = await api('get', `/repository/stocks/repository/${repositoryId}`, null, ADMIN_TOKEN);
    return res.data.some(stock => stock.product_id === productId);
  } catch (error) {
    return false;
  }
}

// ==================== СОЗДАНИЕ СКЛАДОВ ====================

async function createRepositories() {
  log.info('🏭 Создание складов...');
  
  const repositories = [
    { 
      name: 'Склад №1 (Центральный)', 
      address: 'г. Москва, ул. Складская, д.1', 
      phone: '+79001234567' 
    },
    { 
      name: 'Склад №2 (Северный)', 
      address: 'г. Москва, ул. Северная, д.5', 
      phone: '+79001234568' 
    },
    { 
      name: 'Склад №3 (Южный)', 
      address: 'г. Москва, ул. Южная, д.3', 
      phone: '+79001234569' 
    },
    { 
      name: 'Склад №4 (Западный)', 
      address: 'г. Москва, ул. Западная, д.7', 
      phone: '+79001234570' 
    },
    { 
      name: 'Склад №5 (Восточный)', 
      address: 'г. Москва, ул. Восточная, д.9', 
      phone: '+79001234571' 
    },
  ];

  for (const repo of repositories) {
    try {
      const res = await api('post', '/repository', repo, ADMIN_TOKEN);
      IDs.repositoryIds.push(res.data.id);
      log.success(`Склад создан ID: ${res.data.id} (${repo.name})`);
    } catch (error) {
      log.error(`Ошибка создания склада: ${error.message}`);
    }
    await delay(150);
  }
  
  log.success(`Создано ${IDs.repositoryIds.length} складов`);
  return true;
}

// ==================== СОЗДАНИЕ ОСТАТКОВ ====================

async function createStocks() {
  log.info('Создание остатков на складах...');
  
  if (IDs.repositoryIds.length === 0) {
    log.warn('Нет складов для создания остатков');
    return false;
  }

  if (IDs.productIds.length === 0) {
    log.warn('Нет товаров для создания остатков');
    return false;
  }

  let totalCreated = 0;
  
  for (const productId of IDs.productIds) {
    for (const repositoryId of IDs.repositoryIds) {
      // Проверяем, существует ли уже остаток
      const exists = await checkStockExists(repositoryId, productId);
      if (exists) {
        log.warn(`Остаток для товара ${productId} на складе ${repositoryId} уже существует`);
        continue;
      }

      const quantity = Math.floor(Math.random() * 190) + 10;
      const minStock = Math.floor(Math.random() * 12) + 3;
      
      try {
        const data = {
          repository_id: repositoryId,
          product_id: productId,
          quantity: quantity,
          min_stock: minStock,
          location: `Ряд ${Math.floor(Math.random() * 15) + 1}-Стеллаж ${Math.floor(Math.random() * 10) + 1}`,
        };
        const res = await api('post', '/repository/stocks', data, ADMIN_TOKEN);
        IDs.stockIds.push(res.data.id);
        totalCreated++;
        log.success(`Остаток создан: товар ${productId} на складе ${repositoryId} (${quantity} шт.)`);
      } catch (error) {
        if (error.response?.status === 400) {
          log.warn(`Остаток для товара ${productId} на складе ${repositoryId} уже существует`);
        } else {
          log.error(`Ошибка создания остатка: ${error.message}`);
          if (error.response) console.log(error.response.data);
        }
      }
      await delay(100);
    }
  }
  
  log.success(`Создано ${totalCreated} остатков`);
  return true;
}

// ==================== ПРОВЕРКА СКЛАДОВ ====================

async function checkRepositories() {
  log.info('🔍 Проверка складов...');
  try {
    const res = await api('get', '/repository', null, ADMIN_TOKEN);
    log.success(`Всего складов: ${res.data.length}`);
    
    console.log('\n📊 Список складов:');
    res.data.forEach((repo, index) => {
      console.log(`   ${index + 1}. ${repo.name} (ID: ${repo.id}) - ${repo.address || 'Адрес не указан'}`);
      if (repo.stocks) {
        console.log(`      Товаров на складе: ${repo.stocks.length}`);
      }
    });
    return true;
  } catch (error) {
    log.error(`Ошибка проверки складов: ${error.message}`);
    return false;
  }
}

// ==================== ПРОВЕРКА ОСТАТКОВ ====================

async function checkStocks() {
  log.info('🔍 Проверка остатков...');
  try {
    const res = await api('get', '/repository/stocks', null, ADMIN_TOKEN);
    log.success(`Всего остатков: ${res.data.length}`);
    
    if (res.data.length > 0) {
      console.log('\n📊 Примеры остатков:');
      const samples = res.data.slice(0, 10);
      samples.forEach((stock, index) => {
        const repoName = stock.repository?.name || 'Неизвестный склад';
        const productName = stock.product?.name || 'Неизвестный товар';
        console.log(`   ${index + 1}. ${productName} - ${stock.quantity} шт. (${repoName})`);
      });
      if (res.data.length > 10) {
        console.log(`   ... и еще ${res.data.length - 10} записей`);
      }
    } else {
      log.warn('⚠️ Остатков нет!');
    }
    return true;
  } catch (error) {
    log.error(`Ошибка проверки остатков: ${error.message}`);
    return false;
  }
}

// ==================== ПРОВЕРКА НАЛИЧИЯ ====================

async function checkAvailability() {
  log.info('🔍 Проверка наличия товаров...');
  try {
    if (IDs.productIds.length === 0) {
      log.warn('Нет товаров для проверки');
      return false;
    }

    const productId = IDs.productIds[0];
    if (!productId || isNaN(productId)) {
      log.warn('Некорректный ID товара');
      return false;
    }
    
    const quantity = 50;
    
    const res = await api('get', `/repository/check/${productId}/${quantity}`, null, ADMIN_TOKEN);
    
    log.success(`Проверка товара ID: ${productId}`);
    console.log(`   Доступно: ${res.data.totalStock} шт.`);
    console.log(`   ✅ Запрошено: ${quantity} шт.`);
    console.log(`   ${res.data.available ? '✅ Достаточно' : '❌ Недостаточно'}`);
    
    if (res.data.repositories && res.data.repositories.length > 0) {
      console.log('\n   📊 Распределение по складам:');
      res.data.repositories.forEach((repo, index) => {
        console.log(`      ${index + 1}. ${repo.name || 'Неизвестный склад'} - ${repo.quantity || 0} шт.`);
      });
    }
    return true;
  } catch (error) {
    log.error(`Ошибка проверки наличия: ${error.message}`);
    return false;
  }
}

// ==================== НИЗКИЙ ОСТАТОК ====================

async function checkLowStock() {
  log.info('🔍 Проверка товаров с низким остатком...');
  try {
    const res = await api('get', '/repository/low-stock', null, ADMIN_TOKEN);
    
    if (res.data.length === 0) {
      log.success('✅ Товары с низким остатком отсутствуют');
      return true;
    }
    
    log.warn(`⚠️ Найдено ${res.data.length} товаров с низким остатком:`);
    res.data.forEach((stock, index) => {
      const repoName = stock.repository?.name || 'Неизвестный склад';
      const productName = stock.product?.name || 'Неизвестный товар';
      console.log(`   ${index + 1}. ${productName} - ${stock.quantity} шт. (${repoName})`);
      console.log(`      Минимальный остаток: ${stock.min_stock || 5} шт.`);
    });
    return true;
  } catch (error) {
    log.error(`Ошибка проверки низкого остатка: ${error.message}`);
    return false;
  }
}

// ==================== ПЕРЕМЕЩЕНИЕ ТОВАРОВ ====================

async function moveStock() {
  log.info('🔄 Перемещение товаров между складами...');
  try {
    if (IDs.repositoryIds.length < 2) {
      log.warn('Недостаточно складов для перемещения');
      return false;
    }

    if (IDs.productIds.length === 0) {
      log.warn('Нет товаров для перемещения');
      return false;
    }

    const fromRepoId = IDs.repositoryIds[0];
    const toRepoId = IDs.repositoryIds[1];
    const productId = IDs.productIds[0];
    const quantity = 10;

    if (!fromRepoId || !toRepoId || !productId || isNaN(fromRepoId) || isNaN(toRepoId) || isNaN(productId)) {
      log.warn('Некорректные ID для перемещения');
      return false;
    }

    const data = {
      from_repository_id: fromRepoId,
      to_repository_id: toRepoId,
      product_id: productId,
      quantity: quantity,
    };

    const res = await api('post', '/repository/move', data, ADMIN_TOKEN);
    
    log.success(`✅ Товар перемещен: ${quantity} шт.`);
    console.log(`   Со склада ID: ${fromRepoId} на склад ID: ${toRepoId}`);
    console.log(`   📊 Остаток на складе-источнике: ${res.data.from.quantity} шт.`);
    console.log(`   📊 Остаток на складе-назначении: ${res.data.to.quantity} шт.`);
    return true;
  } catch (error) {
    if (error.response?.status === 400) {
      log.warn(`⚠️ Недостаточно товара для перемещения`);
    } else {
      log.error(`Ошибка перемещения: ${error.message}`);
    }
    return false;
  }
}

// ==================== ДОБАВЛЯЕМ НОВУЮ ФУНКЦИЮ: ПРИНУДИТЕЛЬНОЕ ЗАПОЛНЕНИЕ ====================

async function forceSeedStocks() {
  log.info('🔄 ПРИНУДИТЕЛЬНОЕ ЗАПОЛНЕНИЕ ОСТАТКОВ...');
  
  if (IDs.repositoryIds.length === 0) {
    log.warn('Нет складов');
    return false;
  }

  if (IDs.productIds.length === 0) {
    log.warn('Нет товаров');
    return false;
  }

  let totalCreated = 0;
  
  for (const productId of IDs.productIds) {
    for (const repositoryId of IDs.repositoryIds) {
      const quantity = Math.floor(Math.random() * 90) + 10;
      const minStock = 5;
      
      try {
        const data = {
          repository_id: repositoryId,
          product_id: productId,
          quantity: quantity,
          min_stock: minStock,
          location: `A${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}`,
        };
        const res = await api('post', '/repository/stocks', data, ADMIN_TOKEN);
        IDs.stockIds.push(res.data.id);
        totalCreated++;
        log.success(`✅ Принудительно создан остаток: товар ${productId} на складе ${repositoryId} (${quantity} шт.)`);
      } catch (error) {
        if (error.response?.status === 400) {
          log.warn(`Остаток для товара ${productId} на складе ${repositoryId} уже существует`);
        } else {
          log.error(`Ошибка: ${error.message}`);
          if (error.response) console.log(error.response.data);
        }
      }
      await delay(100);
    }
  }
  
  log.success(`Принудительно создано ${totalCreated} остатков`);
  return true;
}

// ==================== ГЛАВНАЯ ФУНКЦИЯ ====================

async function seedRepository() {
  console.log('╔══════════════════════════════════════════════════╗'.cyan);
  console.log('║        🏭 ЗАПОЛНЕНИЕ СКЛАДА                  ║'.cyan);
  console.log('║           УПРАВЛЕНИЕ ТОВАРАМИ               ║'.cyan);
  console.log('╚══════════════════════════════════════════════════╝'.cyan);
  console.log();

  try {
    // 1. Логин
    const loggedIn = await login();
    if (!loggedIn) {
      log.error('❌ Не удалось войти в систему');
      return;
    }
    await delay(300);

    // 2. Получение товаров
    await getProducts();
    await delay(200);

    // 3. Создание складов
    await createRepositories();
    await delay(200);

    // 4. Создание остатков (первая попытка)
    await createStocks();
    await delay(200);

    // 5. Проверка остатков
    await checkStocks();
    await delay(200);

    // 6. Если остатков нет — принудительное заполнение
    if (IDs.stockIds.length === 0) {
      log.warn('⚠️ Остатков нет! Запускаю принудительное заполнение...');
      await forceSeedStocks();
      await delay(200);
    }

    // 7. Проверка складов
    await checkRepositories();
    await delay(200);

    // 8. Проверка наличия
    await checkAvailability();
    await delay(200);

    // 9. Проверка низкого остатка
    await checkLowStock();
    await delay(200);

    // 10. Перемещение товаров
    await moveStock();
    await delay(200);

    // ИТОГ
    log.separator();
    console.log('╔══════════════════════════════════════════════════╗'.cyan);
    console.log('║                 📊 ИТОГ                        ║'.cyan);
    console.log('╚══════════════════════════════════════════════════╝'.cyan);
    console.log();

    console.log(`  🏭 Складов:           ${IDs.repositoryIds.length} шт (IDs: ${IDs.repositoryIds.join(', ') || '❌'})`);
    console.log(`  Остатков:          ${IDs.stockIds.length} шт`);
    console.log(`  Товаров:           ${IDs.productIds.length} шт (IDs: ${IDs.productIds.join(', ') || '❌'})`);
    console.log(`  ✅ Проверка наличия:  Выполнена`);
    console.log(`  ⚠️ Низкий остаток:    Проверен`);
    console.log(`  🔄 Перемещение:       Выполнено`);

    console.log();
    if (IDs.stockIds.length > 0) {
      console.log('✅ СКЛАД УСПЕШНО ЗАПОЛНЕН!'.brightGreen);
    } else {
      console.log('⚠️ НЕ УДАЛОСЬ СОЗДАТЬ ОСТАТКИ'.brightYellow);
      console.log('💡 Проверьте:');
      console.log('   1. Есть ли склады в таблице repositories');
      console.log('   2. Есть ли товары в таблице products');
      console.log('   3. Правильно ли работает эндпоинт /repository/stocks');
    }
    console.log();
    console.log('📝 Проверьте через SQL:'.yellow);
    console.log('   SELECT * FROM repositories;'.gray);
    console.log('   SELECT * FROM repository_stocks;'.gray);
    console.log('   SELECT * FROM repository_stocks WHERE quantity < min_stock;'.gray);

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
    console.error(error);
  }
}

// Запуск
seedRepository();