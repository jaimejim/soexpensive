const db = require('./db');

// Finnish supermarket stores
const stores = [
  'S-Market',
  'Prisma',
  'K-Citymarket',
  'K-Supermarket',
  'Lidl',
  'Alepa'
];

// Sample Finnish supermarket products (realistic items)
const products = [
  // Dairy
  { name: 'Valio Eila Rasvaton maito', category: 'Dairy', unit: '1L' },
  { name: 'Valio Kevytmaito 1%', category: 'Dairy', unit: '1L' },
  { name: 'Valio Täysmaito 3,5%', category: 'Dairy', unit: '1L' },
  { name: 'Valio Hyla Juustoviipale', category: 'Dairy', unit: '150g' },
  { name: 'Valio Oltermanni juusto', category: 'Dairy', unit: '250g' },
  { name: 'Arla Luomu jogurtti', category: 'Dairy', unit: '400g' },
  { name: 'Valio Vanilja villi', category: 'Dairy', unit: '200g' },
  { name: 'Valio Kermaviili', category: 'Dairy', unit: '200ml' },

  // Bread & Bakery
  { name: 'Fazer Ruispalat täysjyvä', category: 'Bakery', unit: '320g' },
  { name: 'Oululainen Reissumies', category: 'Bakery', unit: '500g' },
  { name: 'Vaasan Täysjyvä', category: 'Bakery', unit: '400g' },
  { name: 'Fazer Sämpylä', category: 'Bakery', unit: '6kpl' },
  { name: 'Pirkka Vehnäleipä', category: 'Bakery', unit: '750g' },

  // Meat
  { name: 'HK Sininen Lenkki', category: 'Meat', unit: '350g' },
  { name: 'Atria Broilerin koipi', category: 'Meat', unit: '600g' },
  { name: 'Snellman Meetvursti', category: 'Meat', unit: '200g' },
  { name: 'Pirkka Jauheliha 10%', category: 'Meat', unit: '400g' },
  { name: 'Atria Possun ulkofile', category: 'Meat', unit: '400g' },

  // Fish
  { name: 'Mowi Lohifile', category: 'Fish', unit: '300g' },
  { name: 'Abba MSC Silli', category: 'Fish', unit: '250g' },
  { name: 'Apetit Norjan lohi', category: 'Fish', unit: '400g' },

  // Vegetables
  { name: 'Suomalainen Tomaatti', category: 'Vegetables', unit: 'kg' },
  { name: 'Suomalainen Kurkku', category: 'Vegetables', unit: 'kpl' },
  { name: 'Porkkana', category: 'Vegetables', unit: 'kg' },
  { name: 'Suomalainen Peruna', category: 'Vegetables', unit: '2kg' },
  { name: 'Sipuli', category: 'Vegetables', unit: 'kg' },
  { name: 'Paprika punainen', category: 'Vegetables', unit: 'kg' },
  { name: 'Salaatti Jäävuori', category: 'Vegetables', unit: 'kpl' },

  // Fruits
  { name: 'Banaani', category: 'Fruits', unit: 'kg' },
  { name: 'Omena Suomi', category: 'Fruits', unit: 'kg' },
  { name: 'Appelsiini', category: 'Fruits', unit: 'kg' },
  { name: 'Mandariini', category: 'Fruits', unit: 'kg' },
  { name: 'Päärynä', category: 'Fruits', unit: 'kg' },

  // Frozen
  { name: 'Apetit Kalapuikot', category: 'Frozen', unit: '250g' },
  { name: 'Pirkka Pakasteherneet', category: 'Frozen', unit: '400g' },
  { name: 'Saarioinen Lihapullat', category: 'Frozen', unit: '400g' },
  { name: 'Apetit Pizza Margherita', category: 'Frozen', unit: '300g' },

  // Pantry
  { name: 'Pirkka Spagetti', category: 'Pantry', unit: '500g' },
  { name: 'Pirkka Makaroni', category: 'Pantry', unit: '500g' },
  { name: 'Pirkka Riisi pitkäjyväinen', category: 'Pantry', unit: '1kg' },
  { name: 'Pirkka Vehnäjauho', category: 'Pantry', unit: '2kg' },
  { name: 'Pirkka Sokeri', category: 'Pantry', unit: '1kg' },
  { name: 'Pirkka Suola', category: 'Pantry', unit: '500g' },
  { name: 'Pirkka Tomaattimurska', category: 'Pantry', unit: '400g' },
  { name: 'Pirkka Ketsuppi', category: 'Pantry', unit: '500g' },
  { name: 'Felix Sinappimajoneesi', category: 'Pantry', unit: '250g' },

  // Beverages
  { name: 'Pirkka Appelsiinimehu', category: 'Beverages', unit: '1L' },
  { name: 'Pirkka Kivennäisvesi', category: 'Beverages', unit: '1,5L' },
  { name: 'Coca-Cola', category: 'Beverages', unit: '1,5L' },
  { name: 'Pirkka Omenamehu', category: 'Beverages', unit: '1L' },
  { name: 'Valio Luomu Smoothie', category: 'Beverages', unit: '250ml' },

  // Coffee & Tea
  { name: 'Paulig Juhla Mokka', category: 'Coffee & Tea', unit: '500g' },
  { name: 'Löfbergs Lila', category: 'Coffee & Tea', unit: '500g' },
  { name: 'Lipton Tee', category: 'Coffee & Tea', unit: '100kpl' },

  // Snacks
  { name: 'Taffel Sipsit suola', category: 'Snacks', unit: '150g' },
  { name: 'Fazer Sininen', category: 'Snacks', unit: '200g' },
  { name: 'Geisha', category: 'Snacks', unit: '150g' },
  { name: 'Panda Salmiakki', category: 'Snacks', unit: '200g' },
  { name: 'Dumle Original', category: 'Snacks', unit: '100g' },

  // Breakfast
  { name: 'Fazer Kaurapuuro', category: 'Breakfast', unit: '1kg' },
  { name: 'Pirkka Mysli', category: 'Breakfast', unit: '500g' },
  { name: 'Pirkka Cornflakes', category: 'Breakfast', unit: '500g' },

  // Cleaning
  { name: 'Fairy astianpesuaine', category: 'Cleaning', unit: '500ml' },
  { name: 'Pirkka WC-puhdistusaine', category: 'Cleaning', unit: '750ml' },

  // Personal Care
  { name: 'Colgate hammastahna', category: 'Personal Care', unit: '75ml' },
  { name: 'Pirkka Shampoo', category: 'Personal Care', unit: '500ml' },
  { name: 'Dove Suihkusaippua', category: 'Personal Care', unit: '250ml' }
];

// Generate realistic prices for Finnish market
function generatePrice(category) {
  const priceRanges = {
    'Dairy': [0.99, 3.99],
    'Bakery': [1.49, 4.99],
    'Meat': [3.99, 12.99],
    'Fish': [5.99, 15.99],
    'Vegetables': [1.49, 4.99],
    'Fruits': [1.99, 5.99],
    'Frozen': [2.49, 6.99],
    'Pantry': [0.99, 4.99],
    'Beverages': [0.79, 2.99],
    'Coffee & Tea': [3.99, 8.99],
    'Snacks': [1.99, 4.99],
    'Breakfast': [2.49, 5.99],
    'Cleaning': [1.99, 4.99],
    'Personal Care': [1.99, 6.99]
  };

  const [min, max] = priceRanges[category] || [1.99, 5.99];
  const price = min + Math.random() * (max - min);
  return Math.round(price * 100) / 100; // Round to 2 decimals
}

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // Initialize database
    await db.initDatabase();

    // Insert stores
    const storeIds = {};
    for (const storeName of stores) {
      const id = await db.addStore(storeName);
      storeIds[storeName] = id;
      console.log(`Added store: ${storeName} (ID: ${id})`);
    }

    // Insert products
    const productIds = [];
    for (const product of products) {
      const result = await db.addProduct(product.name, product.category, product.unit);
      productIds.push(result.lastInsertRowid);
      console.log(`Added product: ${product.name}`);
    }

    console.log('✓ Database seeded successfully!');
    console.log(`✓ Added ${stores.length} stores`);
    console.log(`✓ Added ${products.length} products`);

    // Add current prices for all products in all stores
    let priceCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productId = productIds[i];

      for (const storeName of stores) {
        const storeId = storeIds[storeName];
        const basePrice = generatePrice(product.category);

        // Add small variation between stores (-10% to +15%)
        const variation = 0.9 + Math.random() * 0.25;
        const price = Math.round(basePrice * variation * 100) / 100;

        await db.addPrice(productId, storeId, price);
        priceCount++;
      }
    }

    console.log(`✓ Added ${priceCount} current price entries`);

    // Add historical data (simulate price changes over past months)
    console.log('Adding historical price data...');
    const monthsAgo = [30, 60, 90, 120, 150, 180]; // 1-6 months ago

    let historicalCount = 0;
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productId = productIds[i];

      for (const daysAgo of monthsAgo) {
        for (const storeName of stores) {
          const storeId = storeIds[storeName];
          const basePrice = generatePrice(product.category);

          // Simulate price inflation over time (prices were slightly lower before)
          const inflationFactor = 1 - (daysAgo / 365) * 0.05; // ~5% annual increase
          const variation = 0.9 + Math.random() * 0.25;
          const price = Math.round(basePrice * variation * inflationFactor * 100) / 100;

          // Insert with historical date
          await db.sql`
            INSERT INTO prices (product_id, store_id, price, recorded_at)
            VALUES (${productId}, ${storeId}, ${price}, NOW() - INTERVAL '${daysAgo} days')
          `;
          historicalCount++;
        }
      }
    }

    console.log(`✓ Added ${historicalCount} historical price entries`);
    console.log('✓ Database is ready to use');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
