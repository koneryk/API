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

// Хранение созданных ID
const IDs = {
  categoryId: null,
  brandId: null,
  productIds: [],
  characteristicIds: [],
  discountIds: [],
  speciesId: null,
  breedId: null,
  petIds: [],
  reviewIds: [],
  orderIds: [],
  orderStatusId: null,
  userId: null,
  repositoryIds: [],
  inventoryIds: [],
  stockIds: [],
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
    log.warn('Пользователь не найден');
    return false;
  }
}

async function registerUser() {
  log.info('📝 Регистрация пользователя...');
  try {
    const data = {
      email: 'user@test.com',
      password: 'test1234',
      first_name: 'Test',
      last_name: 'User',
      phone: '+79001234567',
      address: 'г. Москва, ул. Тестовая, д.1',
    };
    const res = await api('post', '/auth/registration', data);
    log.success('Пользователь создан: user@test.com');
    return true;
  } catch (error) {
    log.warn('Пользователь уже существует');
    return true;
  }
}

// ==================== КАТЕГОРИИ ====================

async function createCategories() {
  log.info('📁 Создание 5 категорий...');
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
      IDs.categoryId = res.data.id;
      log.success(`Категория создана ID: ${IDs.categoryId} (${cat.name})`);
    } catch (error) {
      log.error(`Ошибка создания категории: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== БРЕНДЫ ====================

async function createBrands() {
  log.info('🏷️ Создание 5 брендов...');
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
      IDs.brandId = res.data.id;
      log.success(`Бренд создан ID: ${IDs.brandId} (${brand.name})`);
    } catch (error) {
      log.error(`Ошибка создания бренда: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== ТОВАРЫ ====================

async function createProducts() {
  log.info('📦 Создание 5 товаров...');
  const products = [
    {
      sku: 'RC-001',
      name: 'Корм Royal Canin для щенков 15 кг',
      category_id: 1,
      brand_id: 1,
      price: 4500,
      description: 'Полнорационный сухой корм для щенков',
      ingredients: 'Курица, рис, кукуруза, витамины',
    },
    {
      sku: 'RC-002',
      name: 'Корм Royal Canin для взрослых собак 12 кг',
      category_id: 1,
      brand_id: 1,
      price: 5200,
      description: 'Сухой корм для взрослых собак',
      ingredients: 'Говядина, рис, овощи, витамины',
    },
    {
      sku: 'PR-001',
      name: 'Корм Purina ONE для кошек 10 кг',
      category_id: 2,
      brand_id: 2,
      price: 3800,
      description: 'Полнорационный корм для кошек',
      ingredients: 'Курица, рыба, злаки, витамины',
    },
    {
      sku: 'HL-001',
      name: "Корм Hill's для собак с чувствительным пищеварением",
      category_id: 1,
      brand_id: 3,
      price: 6000,
      description: 'Ветеринарная диета для собак',
      ingredients: 'Рис, ягненок, овощи, пробиотики',
    },
    {
      sku: 'AC-001',
      name: 'Корм Acana для щенков крупных пород 11 кг',
      category_id: 1,
      brand_id: 4,
      price: 7200,
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
  return true;
}

// ==================== ХАРАКТЕРИСТИКИ ====================

async function createCharacteristics() {
  log.info('📊 Создание 5 характеристик...');
  const characteristics = [
    { name: 'Вес упаковки', type: 'STRING' },
    { name: 'Размер', type: 'STRING' },
    { name: 'Возраст', type: 'STRING' },
    { name: 'Тип корма', type: 'STRING' },
    { name: 'Срок годности', type: 'STRING' },
  ];

  for (const char of characteristics) {
    try {
      const res = await api('post', '/characteristics', char, ADMIN_TOKEN);
      IDs.characteristicIds.push(res.data.id);
      log.success(`Характеристика создана ID: ${res.data.id} (${char.name})`);
    } catch (error) {
      log.error(`Ошибка создания характеристики: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== СВЯЗИ ХАРАКТЕРИСТИК ====================

async function createProductCharacteristics() {
  log.info('🔗 Привязка характеристик к товарам...');
  const values = ['15 кг', 'Крупный', 'Щенки', 'Сухой', '12 месяцев'];

  for (let i = 0; i < Math.min(IDs.productIds.length, 5); i++) {
    try {
      const data = {
        product_id: IDs.productIds[i],
        characteristic_id: IDs.characteristicIds[i],
        value: values[i] || 'Тестовое значение',
      };
      await api('post', '/products/characteristics', data, ADMIN_TOKEN);
      log.success(`Характеристика привязана к товару ${IDs.productIds[i]}`);
    } catch (error) {
      log.error(`Ошибка привязки: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== СКИДКИ ====================

async function createDiscounts() {
  log.info('🏷️ Создание 5 скидок...');
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);

  const discounts = [
    { code: 'FIRST15', name: 'Скидка на первый заказ 15%', value: 15 },
    { code: 'SAVE10', name: 'Экономия 10%', value: 10 },
    { code: 'SUMMER20', name: 'Летняя скидка 20%', value: 20 },
    { code: 'BIG5', name: 'Скидка 5% на крупный заказ', value: 5 },
    { code: 'VIP25', name: 'VIP скидка 25%', value: 25 },
  ];

  for (const discount of discounts) {
    try {
      const data = {
        code: discount.code,
        name: discount.name,
        type: 'PERCENTAGE',
        value: discount.value,
        min_order: 1000,
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        is_active: true,
      };
      const res = await api('post', '/discounts', data, ADMIN_TOKEN);
      IDs.discountIds.push(res.data.id);
      log.success(`Скидка создана ID: ${res.data.id} (${discount.name})`);
    } catch (error) {
      log.error(`Ошибка создания скидки: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== ПРИВЯЗКА СКИДОК ====================

async function createDiscountProducts() {
  log.info('🔗 Привязка скидок к товарам...');
  for (let i = 0; i < Math.min(IDs.discountIds.length, IDs.productIds.length); i++) {
    try {
      const data = {
        discount_id: IDs.discountIds[i],
        product_id: IDs.productIds[i],
      };
      await api('post', '/discount-products', data, ADMIN_TOKEN);
      log.success(`Скидка ${IDs.discountIds[i]} привязана к товару ${IDs.productIds[i]}`);
    } catch (error) {
      log.error(`Ошибка привязки скидки: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== ВИДЫ ====================

async function createSpecies() {
  log.info('🐾 Создание 5 видов...');
  const species = [
    { name: 'Собаки' },
    { name: 'Кошки' },
    { name: 'Птицы' },
    { name: 'Рыбы' },
    { name: 'Грызуны' },
  ];

  for (const s of species) {
    try {
      const res = await api('post', '/pets/species', s, ADMIN_TOKEN);
      IDs.speciesId = res.data.id;
      log.success(`Вид создан ID: ${IDs.speciesId} (${s.name})`);
    } catch (error) {
      log.error(`Ошибка создания вида: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== ПОРОДЫ ====================

async function createBreeds() {
  log.info('🐕 Создание 5 пород...');
  const breeds = [
    { name: 'Лабрадор', size: 'Крупная' },
    { name: 'Британская короткошерстная', size: 'Средняя' },
    { name: 'Попугай', size: 'Маленькая' },
    { name: 'Золотая рыбка', size: 'Маленькая' },
    { name: 'Хомяк', size: 'Маленькая' },
  ];

  for (let i = 0; i < breeds.length; i++) {
    try {
      const data = {
        species_id: 1,
        name: breeds[i].name,
        description: `Описание породы ${breeds[i].name}`,
        size: breeds[i].size,
      };
      const res = await api('post', '/pets/breeds', data, ADMIN_TOKEN);
      IDs.breedId = res.data.id;
      log.success(`Порода создана ID: ${IDs.breedId} (${breeds[i].name})`);
    } catch (error) {
      log.error(`Ошибка создания породы: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== ПИТОМЦЫ ====================

async function createPets() {
  log.info('🐶 Создание 5 питомцев...');
  const pets = [
    { name: 'Шарик', weight: 25.5 },
    { name: 'Мурка', weight: 4.5 },
    { name: 'Кеша', weight: 0.3 },
    { name: 'Золотая', weight: 0.1 },
    { name: 'Хома', weight: 0.2 },
  ];

  for (let i = 0; i < pets.length; i++) {
    try {
      const data = {
        breed_id: 1,
        name: pets[i].name,
        birth_date: '2020-01-01',
        weight: pets[i].weight,
        gender: i % 2 === 0 ? 'male' : 'female',
        notes: `Питомец ${pets[i].name}`,
      };
      const res = await api('post', '/pets', data, ADMIN_TOKEN);
      IDs.petIds.push(res.data.id);
      log.success(`Питомец создан ID: ${res.data.id} (${pets[i].name})`);
    } catch (error) {
      log.error(`Ошибка создания питомца: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== ОТЗЫВЫ ====================

async function createReviews() {
  log.info('⭐ Создание 5 отзывов...');
  const reviews = [
    { rating: 5, comment: 'Отличный корм! Нашему псу очень нравится!' },
    { rating: 4, comment: 'Хороший корм, но цена кусается' },
    { rating: 5, comment: 'Лучший корм на рынке! Рекомендую всем!' },
    { rating: 3, comment: 'Неплохо, но есть и получше' },
    { rating: 5, comment: 'Наш лабрадор обожает этот корм!' },
  ];

  for (let i = 0; i < Math.min(reviews.length, IDs.productIds.length); i++) {
    try {
      const data = {
        product_id: IDs.productIds[i],
        rating: reviews[i].rating,
        comment: reviews[i].comment,
      };
      const res = await api('post', '/reviews', data, ADMIN_TOKEN);
      IDs.reviewIds.push(res.data.id);
      log.success(`Отзыв создан ID: ${res.data.id}`);
    } catch (error) {
      log.error(`Ошибка создания отзыва: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== ИЗБРАННОЕ ====================

async function createWishlists() {
  log.info('❤️ Добавление товаров в избранное...');
  let token = USER_TOKEN;
  if (!token) {
    const loginRes = await api('post', '/auth/login', {
      email: 'user@test.com',
      password: 'test1234',
    });
    token = loginRes.data.token;
  }

  for (let i = 0; i < Math.min(IDs.productIds.length, 5); i++) {
    try {
      await api('post', `/wishlists/${IDs.productIds[i]}`, {}, token);
      log.success(`Товар ${IDs.productIds[i]} добавлен в избранное`);
    } catch (error) {
      log.error(`Ошибка добавления в избранное: ${error.message}`);
    }
    await delay(100);
  }
  return true;
}

// ==================== СКЛАДЫ ====================

async function createRepositories() {
  log.info('🏭 Создание 3 складов...');
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
  return true;
}

// ==================== ИНВЕНТАРИЗАЦИЯ ====================

async function createInventory() {
  log.info('📦 Создание инвентаризации для товаров...');
  
  for (const productId of IDs.productIds) {
    const quantity = Math.floor(Math.random() * 190) + 10;
    try {
      const res = await api('post', `/inventory/product/${productId}`, 
        { quantity: quantity, minStock: 5 }, 
        ADMIN_TOKEN
      );
      IDs.inventoryIds.push(res.data.id);
      log.success(`Инвентаризация для товара ${productId}: ${quantity} шт.`);
    } catch (error) {
      if (error.response?.status === 400) {
        log.warn(`Инвентаризация для товара ${productId} уже существует`);
        // Получаем существующую
        try {
          const res = await api('get', `/inventory/product/${productId}`, null, ADMIN_TOKEN);
          IDs.inventoryIds.push(res.data.id);
          log.success(`Инвентаризация для товара ${productId}: ${res.data.quantity} шт.`);
        } catch (e) {
          log.error(`Ошибка получения инвентаризации: ${e.message}`);
        }
      } else {
        log.error(`Ошибка создания инвентаризации: ${error.message}`);
      }
    }
    await delay(100);
  }
  return true;
}

// ==================== ОСТАТКИ НА СКЛАДАХ ====================

async function createRepositoryStocks() {
  log.info('📦 Создание остатков на складах...');
  
  let totalCreated = 0;
  for (const productId of IDs.productIds) {
    for (const repositoryId of IDs.repositoryIds) {
      const quantity = Math.floor(Math.random() * 90) + 10;
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
  log.success(`Создано ${totalCreated} остатков на складах`);
  return true;
}

// ==================== КОРЗИНА ====================

async function addMultipleToCart() {
  log.info('🛒 Добавление товаров в корзину...');
  let token = USER_TOKEN;
  if (!token) {
    const loginRes = await api('post', '/auth/login', {
      email: 'user@test.com',
      password: 'test1234',
    });
    token = loginRes.data.token;
  }

  const items = [
    { product_id: IDs.productIds[0] || 1, quantity: 2 },
    { product_id: IDs.productIds[1] || 2, quantity: 1 },
    { product_id: IDs.productIds[2] || 3, quantity: 3 },
  ];

  for (const item of items) {
    try {
      const res = await api('post', '/cart', item, token);
      log.success(`Товар ${item.product_id} добавлен в корзину (${res.data.quantity} шт.)`);
    } catch (error) {
      log.error(`Ошибка добавления товара ${item.product_id}: ${error.message}`);
    }
    await delay(200);
  }
  return true;
}

async function checkCart() {
  log.info('🛒 Проверка корзины...');
  try {
    let token = USER_TOKEN;
    if (!token) {
      const loginRes = await api('post', '/auth/login', {
        email: 'user@test.com',
        password: 'test1234',
      });
      token = loginRes.data.token;
    }
    
    const res = await api('get', '/cart', null, token);
    log.success(`В корзине ${res.data.length} товаров`);
    
    if (res.data.length > 0) {
      console.log('📊 Товары в корзине:');
      res.data.forEach((item, index) => {
        const product = item.product || {};
        console.log(`   ${index + 1}. ${product.name || 'Товар'} - ${item.quantity} шт. x ${product.price || 0} руб.`);
      });
    }
    return true;
  } catch (error) {
    log.error(`Ошибка проверки корзины: ${error.message}`);
    return false;
  }
}

// ==================== СТАТУСЫ ЗАКАЗОВ ====================

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
    log.warn('Статус уже существует');
    return true;
  }
}

// ==================== ЗАКАЗЫ ====================

async function createOrders() {
  log.info('📦 Создание 5 заказов...');
  const addresses = [
    'г. Москва, ул. Ленина, д.1',
    'г. Москва, ул. Пушкина, д.2',
    'г. Москва, ул. Гагарина, д.3',
    'г. Москва, ул. Советская, д.4',
    'г. Москва, ул. Мира, д.5',
  ];

  for (let i = 0; i < Math.min(5, IDs.productIds.length); i++) {
    try {
      const productId = IDs.productIds[i];
      const productRes = await api('get', `/products/${productId}`, null, ADMIN_TOKEN);
      const price = productRes.data.price || 1000;
      const quantity = Math.floor(Math.random() * 3) + 1;
      
      const data = {
        status_id: 1,
        total_amount: price * quantity,
        shipping_address: addresses[i % addresses.length],
        payment_method: 'card',
        items: [
          {
            product_id: productId,
            quantity: quantity,
            price: price,
          },
        ],
      };
      const res = await api('post', '/orders', data, USER_TOKEN);
      IDs.orderIds.push(res.data.id);
      log.success(`Заказ создан ID: ${res.data.id} (${price * quantity} руб.)`);
    } catch (error) {
      log.error(`Ошибка создания заказа: ${error.message}`);
    }
    await delay(150);
  }
  return true;
}

// ==================== ГЛАВНАЯ ФУНКЦИЯ ====================

async function seedAll() {
  console.log('╔══════════════════════════════════════════════════╗'.cyan);
  console.log('║        🌱 ПОЛНОЕ ЗАПОЛНЕНИЕ БАЗЫ ДАННЫХ       ║'.cyan);
  console.log('║           🐶 ЗООМАГАЗИН 🐱                     ║'.cyan);
  console.log('║        🏭 + 📦 + 🛒 + 📋                       ║'.cyan);
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

    // 2. Пользователь
    await registerUser();
    await delay(200);
    await loginUser();
    await delay(200);

    // 3. Категории и бренды
    await createCategories();
    await delay(200);
    await createBrands();
    await delay(200);

    // 4. Товары
    await createProducts();
    await delay(200);

    // 5. Характеристики
    await createCharacteristics();
    await delay(200);
    await createProductCharacteristics();
    await delay(200);

    // 6. Скидки
    await createDiscounts();
    await delay(200);
    await createDiscountProducts();
    await delay(200);

    // 7. Питомцы
    await createSpecies();
    await delay(200);
    await createBreeds();
    await delay(200);
    await createPets();
    await delay(200);

    // 8. Отзывы
    await createReviews();
    await delay(200);

    // 9. Избранное
    await createWishlists();
    await delay(200);

    // 10. ⭐ СКЛАДЫ И ИНВЕНТАРИЗАЦИЯ ⭐
    await createRepositories();
    await delay(200);
    await createInventory();
    await delay(200);
    await createRepositoryStocks();
    await delay(200);

    // 11. Корзина
    await addMultipleToCart();
    await delay(200);
    await checkCart();
    await delay(200);

    // 12. Статусы и заказы
    await createOrderStatus();
    await delay(200);
    await createOrders();
    await delay(200);

    // ИТОГ
    log.separator();
    console.log('╔══════════════════════════════════════════════════╗'.cyan);
    console.log('║                 📊 ИТОГ                        ║'.cyan);
    console.log('╚══════════════════════════════════════════════════╝'.cyan);
    console.log();

    console.log(`  📁 Категории:        5 шт`);
    console.log(`  🏷️  Бренды:          5 шт`);
    console.log(`  📦 Товары:           ${IDs.productIds.length} шт (IDs: ${IDs.productIds.join(', ')})`);
    console.log(`  📊 Характеристики:   ${IDs.characteristicIds.length} шт`);
    console.log(`  🏷️  Скидки:          ${IDs.discountIds.length} шт`);
    console.log(`  🐾 Виды:             5 шт`);
    console.log(`  🐕 Породы:           5 шт`);
    console.log(`  🐶 Питомцы:          ${IDs.petIds.length} шт`);
    console.log(`  ⭐ Отзывы:           ${IDs.reviewIds.length} шт`);
    console.log(`  ❤️ Избранное:        ${Math.min(IDs.productIds.length, 5)} товаров`);
    console.log(`  🏭 Склады:           ${IDs.repositoryIds.length} шт (IDs: ${IDs.repositoryIds.join(', ')})`);
    console.log(`  📦 Инвентаризация:   ${IDs.inventoryIds.length} шт`);
    console.log(`  📊 Остатки на складах: ${IDs.stockIds.length} шт`);
    console.log(`  🛒 Корзина:          Заполнена ✅`);
    console.log(`  📋 Статус заказа:    ${IDs.orderStatusId ? '✅' : '❌'}`);
    console.log(`  📦 Заказы:           ${IDs.orderIds.length} шт (IDs: ${IDs.orderIds.join(', ')})`);

    console.log();
    console.log('✅ БАЗА ДАННЫХ ПОЛНОСТЬЮ ЗАПОЛНЕНА!'.brightGreen);
    console.log();
    console.log('📝 Данные для входа:'.yellow);
    console.log(`   Администратор: admin@example.com / admin123`.gray);
    console.log(`   Пользователь:  user@test.com / test1234`.gray);
    console.log();
    console.log('📊 Проверьте:'.yellow);
    console.log('   SELECT * FROM products;'.gray);
    console.log('   SELECT * FROM product_inventory;'.gray);
    console.log('   SELECT * FROM repositories;'.gray);
    console.log('   SELECT * FROM repository_stocks;'.gray);
    console.log('   SELECT * FROM cart_items;'.gray);
    console.log('   SELECT * FROM orders;'.gray);

  } catch (error) {
    console.error('❌ Критическая ошибка:', error.message);
  }
}

// Запуск
seedAll();