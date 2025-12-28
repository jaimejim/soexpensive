const db = require('../db');
const fs = require('fs');
const path = require('path');

/**
 * Seed endpoint - loads products and prices from CSV in repo
 * CSV location: /products-prices.csv
 *
 * Format: store,product,category,unit,price_euros
 * Example: K-Citymarket,Banaani,Fruits,kg,1.69
 */

const stores = ['S-Market', 'Prisma', 'K-Citymarket', 'K-Supermarket', 'Lidl', 'Alepa'];

// Parse CSV from repo
function loadProductsFromCSV() {
  const csvPath = path.join(__dirname, '../products-prices.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const lines = csvContent.split('\n').filter(l => l.trim());
  const products = new Map(); // Use Map to deduplicate products
  const prices = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const [store, product, category, unit, priceEuros] = line.split(',');

    if (!store || !product || !category || !unit || !priceEuros) {
      console.warn(`Skipping invalid line ${i + 1}: ${line}`);
      continue;
    }

    // Add unique product
    const productKey = `${product}|${category}|${unit}`;
    if (!products.has(productKey)) {
      products.set(productKey, { product, category, unit });
    }

    // Store price info
    prices.push({
      store: store.trim(),
      product: product.trim(),
      category: category.trim(),
      unit: unit.trim(),
      priceEuros: parseFloat(priceEuros)
    });
  }

  return {
    products: Array.from(products.values()),
    prices
  };
}

module.exports = async (req, res) => {
  try {
    const results = {
      stores: 0,
      products: 0,
      realPrices: 0,
      estimatedPrices: 0
    };

    // Initialize database
    await db.initDatabase();

    // Load data from CSV
    const { products, prices } = loadProductsFromCSV();
    console.log(`Loaded ${products.length} products and ${prices.length} real prices from CSV`);

    // Add stores
    const storeIds = {};
    for (const storeName of stores) {
      const id = await db.addStore(storeName);
      storeIds[storeName] = id;
      results.stores++;
    }

    // Add products
    const productMap = new Map();
    for (const { product, category, unit } of products) {
      const result = await db.addProduct(product, category, unit);
      const key = `${product}|${category}|${unit}`;
      productMap.set(key, result.lastInsertRowid);
      results.products++;
    }

    // Add real prices from CSV
    for (const priceInfo of prices) {
      const productKey = `${priceInfo.product}|${priceInfo.category}|${priceInfo.unit}`;
      const productId = productMap.get(productKey);
      const storeId = storeIds[priceInfo.store];

      if (!productId || !storeId) {
        console.warn(`Skipping price for ${priceInfo.product} at ${priceInfo.store}`);
        continue;
      }

      const priceCents = Math.round(priceInfo.priceEuros * 100);

      await db.sql`
        INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
        VALUES (${productId}, ${storeId}, ${priceCents}, CURRENT_TIMESTAMP)
      `;

      results.realPrices++;
    }

    // Add Prisma prices (same as S-Market)
    console.log('Adding Prisma prices (same chain as S-Market)...');
    const sMarketPrices = prices.filter(p => p.store === 'S-Market');
    for (const priceInfo of sMarketPrices) {
      const productKey = `${priceInfo.product}|${priceInfo.category}|${priceInfo.unit}`;
      const productId = productMap.get(productKey);
      const storeId = storeIds['Prisma'];

      if (!productId || !storeId) continue;

      const priceCents = Math.round(priceInfo.priceEuros * 100);

      await db.sql`
        INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
        VALUES (${productId}, ${storeId}, ${priceCents}, CURRENT_TIMESTAMP)
      `;

      results.realPrices++;
    }

    // Add estimated prices for stores without real data (K-Supermarket, Lidl, Alepa)
    console.log('Adding estimated prices for other stores...');
    const otherStores = ['K-Supermarket', 'Lidl', 'Alepa'];

    // Group prices by product to calculate average
    const productAvgPrices = new Map();
    for (const priceInfo of prices) {
      const productKey = `${priceInfo.product}|${priceInfo.category}|${priceInfo.unit}`;
      if (!productAvgPrices.has(productKey)) {
        productAvgPrices.set(productKey, []);
      }
      productAvgPrices.get(productKey).push(priceInfo.priceEuros);
    }

    for (const [productKey, priceList] of productAvgPrices.entries()) {
      const productId = productMap.get(productKey);
      if (!productId) continue;

      // Calculate average price
      const avgPrice = priceList.reduce((sum, p) => sum + p, 0) / priceList.length;

      for (const storeName of otherStores) {
        const storeId = storeIds[storeName];
        if (!storeId) continue;

        // Vary price by ±15%
        const variation = 0.85 + Math.random() * 0.3;
        const estimatedPrice = avgPrice * variation;
        const priceCents = Math.round(estimatedPrice * 100);

        await db.sql`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (${productId}, ${storeId}, ${priceCents}, CURRENT_TIMESTAMP)
        `;

        results.estimatedPrices++;
      }
    }

    res.json({
      success: true,
      message: 'Database seeded from products-prices.csv',
      results,
      source: 'products-prices.csv'
    });

  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
