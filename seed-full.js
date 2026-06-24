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
  categoryIds: [],
  brandIds: [],
};

const log = {
  info: (msg) => console.log(`ℹ️ ${msg}`.blue),
  success: (msg) => console.log(`${msg}`.green),
  error: (msg) => console.log(`${msg}`.red),
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

// ==================== КАТЕГОРИИ ====================

async function createCategories() {
  log.info('📁 Создание категорий...');
  
  const categories = [
    { name: 'Корма для собак' },
    { name: 'Корма для кошек' },
    { name: 'Игрушки для собак' },
    { name: 'Аксессуары для кошек' },
    { name: 'Уход и гигиена' },
  ];

  for (const cat of categories) {
    try {
      const res = await api('post', '/categories', cat, ADMIN_TOKEN);
      IDs.categoryIds.push(res.data.id);
      log.success(`Категория создана ID: ${res.data.id} (${cat.name})`);
    } catch (error) {
      log.error(`Ошибка создания категории: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== БРЕНДЫ ====================

async function createBrands() {
  log.info('🏷️ Создание брендов...');
  
  const brands = [
    { name: 'Royal Canin' },
    { name: 'Purina' },
    { name: "Hill's" },
    { name: 'Acana' },
    { name: 'Orijen' },
  ];

  for (const brand of brands) {
    try {
      const res = await api('post', '/brands', brand, ADMIN_TOKEN);
      IDs.brandIds.push(res.data.id);
      log.success(`Бренд создан ID: ${res.data.id} (${brand.name})`);
    } catch (error) {
      log.error(`Ошибка создания бренда: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== ТОВАРЫ ====================

async function createProducts() {
  log.info('Создание товаров...');
  
  const products = [
    {
      sku: 'RC-001',
      name: 'Корм Royal Canin для щенков 15 кг',
      category_id: 1,
      brand_id: 1,
      price: 4500,
      stock: 100,
      description: 'Полнорационный сухой корм для щенков',
      ingredients: 'Курица, рис, кукуруза, витамины',
    },
    {
      sku: 'RC-002',
      name: 'Корм Royal Canin для взрослых собак 12 кг',
      category_id: 1,
      brand_id: 1,
      price: 5200,
      stock: 80,
      description: 'Сухой корм для взрослых собак',
      ingredients: 'Говядина, рис, овощи, витамины',
    },
    {
      sku: 'PR-001',
      name: 'Корм Purina ONE для кошек 10 кг',
      category_id: 2,
      brand_id: 2,
      price: 3800,
      stock: 120,
      description: 'Полнорационный корм для кошек',
      ingredients: 'Курица, рыба, злаки, витамины',
    },
    {
      sku: 'HL-001',
      name: "Корм Hill's для собак с чувствительным пищеварением",
      category_id: 1,
      brand_id: 3,
      price: 6000,
      stock: 50,
      description: 'Ветеринарная диета для собак',
      ingredients: 'Рис, ягненок, овощи, пробиотики',
    },
    {
      sku: 'AC-001',
      name: 'Корм Acana для щенков крупных пород 11 кг',
      category_id: 1,
      brand_id: 4,
      price: 7200,
      stock: 30,
      description: 'Беззерновой корм для щенков',
      ingredients: 'Курица, рыба, яйца, ягоды',
    },
  ];

  for (const product of products) {
    try {
      const res = await api('post', '/products', product, ADMIN_TOKEN);
      IDs.productIds.push(res.data.id);
      log.success(`Товар создан ID: ${res.data.id} (${product.name})`);
    } catch (error) {
      log.error(`Ошибка создания товара: ${error.message}`);
    }
    await delay(150);
  }
  
  log.success(`Создано ${IDs.productIds.length} товаров`);
  return true;
}

// ==================== СКЛАДЫ ====================

async function createRepositories() {
  log.info('🏭 Создание складов...');
  
  const repositories = [
    { name: 'Склад №1 (Центральный)', address: 'г. Москва, ул. Складская, д.1', phone: '+79001234567' },
    { name: 'Склад №2 (Северный)', address: 'г. Москва, ул. Северная, д.5', phone: '+79001234568' },
    { name: 'Склад №3 (Южный)', address: 'г. Москва, ул. Южная, д.3', phone: '+79001234569' },
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

// ==================== ОСТАТКИ ====================

async function createStocks() {
  log.info('Создание остатков на складах...');
  
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
        }
      }
      await delay(100);
    }
  }
  
  log.success(`Создано ${totalCreated} остатков`);
  return true;
}

// ==================== ПРОВЕРКА ====================

async function checkStocks() {
  log.info('🔍 Проверка остатков...');
  try {
    const res = await api('get', '/repository/stocks', null, ADMIN_TOKEN);
    log.success(`Всего остатков: ${res.data.length}`);
    
    if (res.data.length > 0) {
      console.log('\n📊 Примеры остатков:');
      res.data.slice(0, 10).forEach((stock, index) => {
        const repoName = stock.repository?.name || 'Неизвестный склад';
        const productName = stock.product?.name || 'Неизвестный товар';
        console.log(`   ${index + 1}. ${productName} - ${stock.quantity} шт. (${repoName})`);
      });
    }
    return true;
  } catch (error) {
    log.error(`Ошибка проверки остатков: ${error.message}`);
    return false;
  }
}

// ==================== ГЛАВНАЯ ФУНКЦИЯ ====================

async function seedAll() {
  console.log('╔══════════════════════════════════════════════════╗'.cyan);
  console.log('║        🌱 ПОЛНОЕ ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ       ║'.cyan);
  console.log('║           🐶 ЗООМАГАЗИН 🐱                     ║'.cyan);
  console.log('╚══════════════════════════════════════════════════╝'.cyan);
  console.log();

  try {
    // 1. Логин
    const loggedIn = await login();
    if (!loggedIn) return;
    await delay(300);

    // 2. Категории
    await createCategories();
    await delay(200);

    // 3. Бренды
    await createBrands();
    await delay(200);

    // 4. Товары
    await createProducts();
    await delay(200);

    // 5. Склады
    await createRepositories();
    await delay(200);

    // 6. Остатки
    await createStocks();
    await delay(200);

    // 7. Проверка
    await checkStocks();

    // ИТОГ
    log.separator();
    console.log('╔══════════════════════════════════════════════════╗'.cyan);
    console.log('║                 📊 ИТОГ                        ║'.cyan);
    console.log('╚══════════════════════════════════════════════════╝'.cyan);
    console.log();

    console.log(`  📁 Категорий:      ${IDs.categoryIds.length} шт`);
    console.log(`  🏷️  Брендов:       ${IDs.brandIds.length} шт`);
    console.log(`  Товаров:        ${IDs.productIds.length} шт (IDs: ${IDs.productIds.join(', ')})`);
    console.log(`  🏭 Складов:        ${IDs.repositoryIds.length} шт (IDs: ${IDs.repositoryIds.join(', ')})`);
    console.log(`  Остатков:       ${IDs.stockIds.length} шт`);

    console.log();
    if (IDs.stockIds.length > 0) {
      console.log('БАЗА ДАННЫХ УСПЕШНО ЗАПОЛНЕНА!'.brightGreen);
    } else {
      console.log('⚠️ ОСТАТКИ НЕ СОЗДАНЫ'.brightYellow);
      console.log('💡 Проверьте вручную:');
      console.log('   SELECT * FROM products;');
      console.log('   SELECT * FROM repositories;');
      console.log('   SELECT * FROM repository_stocks;');
    }
  } catch (error) {
    console.error('Критическая ошибка:', error.message);
  }
}

// Запуск
seedAll();