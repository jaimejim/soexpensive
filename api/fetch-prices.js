const { sql } = require('@vercel/postgres');

// Sample price data (since store APIs block scraper requests)
const SAMPLE_PRICES = {
  "Milk": { "Lidl": 0.99, "S-Market": 1.15, "Prisma": 1.09, "K-Citymarket": 1.19, "K-Supermarket": 1.22, "Alepa": 1.25 },
  "Bread": { "Lidl": 0.79, "S-Market": 1.29, "Prisma": 1.19, "K-Citymarket": 1.35, "K-Supermarket": 1.39, "Alepa": 1.45 },
  "Cheese": { "Lidl": 2.99, "S-Market": 3.49, "Prisma": 3.29, "K-Citymarket": 3.59, "K-Supermarket": 3.69, "Alepa": 3.79 },
  "Eggs": { "Lidl": 2.49, "S-Market": 2.89, "Prisma": 2.79, "K-Citymarket": 2.95, "K-Supermarket": 2.99, "Alepa": 3.09 },
  "Tomato": { "Lidl": 1.99, "S-Market": 2.49, "Prisma": 2.29, "K-Citymarket": 2.59, "K-Supermarket": 2.69, "Alepa": 2.79 },
  "Banana": { "Lidl": 1.49, "S-Market": 1.79, "Prisma": 1.69, "K-Citymarket": 1.89, "K-Supermarket": 1.95, "Alepa": 1.99 },
  "Coffee": { "Lidl": 4.99, "S-Market": 5.99, "Prisma": 5.49, "K-Citymarket": 6.29, "K-Supermarket": 6.49, "Alepa": 6.79 },
  "Rice": { "Lidl": 1.99, "S-Market": 2.49, "Prisma": 2.29, "K-Citymarket": 2.59, "K-Supermarket": 2.69, "Alepa": 2.79 },
  "Pasta": { "Lidl": 0.89, "S-Market": 1.29, "Prisma": 1.09, "K-Citymarket": 1.39, "K-Supermarket": 1.45, "Alepa": 1.49 },
  "Yogurt": { "Lidl": 0.79, "S-Market": 1.19, "Prisma": 0.99, "K-Citymarket": 1.29, "K-Supermarket": 1.35, "Alepa": 1.39 },
  "Butter": { "Lidl": 2.49, "S-Market": 3.29, "Prisma": 2.89, "K-Citymarket": 3.49, "K-Supermarket": 3.59, "Alepa": 3.69 },
  "Chicken": { "Lidl": 5.99, "S-Market": 7.49, "Prisma": 6.99, "K-Citymarket": 7.89, "K-Supermarket": 7.99, "Alepa": 8.29 },
  "Apple": { "Lidl": 1.99, "S-Market": 2.49, "Prisma": 2.29, "K-Citymarket": 2.59, "K-Supermarket": 2.69, "Alepa": 2.79 },
  "Orange": { "Lidl": 1.79, "S-Market": 2.29, "Prisma": 2.09, "K-Citymarket": 2.39, "K-Supermarket": 2.49, "Alepa": 2.59 },
  "Potato": { "Lidl": 1.49, "S-Market": 1.99, "Prisma": 1.79, "K-Citymarket": 2.09, "K-Supermarket": 2.19, "Alepa": 2.29 }
};

// Helper: normalize product names
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[^\wåäö\s]/g, '')
    .trim();
}

// Helper: find product match
function findProductMatch(productName, dbProducts) {
  const normalized = normalizeProductName(productName);
  return dbProducts.find(p => {
    const dbNorm = normalizeProductName(p.name);
    return normalized.includes(dbNorm) || dbNorm.includes(normalized);
  });
}

// Main handler
module.exports = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = {
    started: new Date().toISOString(),
    stores: {},
    summary: {
      total_fetched: 0,
      total_updated: 0,
      errors: ['NOTE: Using sample prices (store APIs block scraper requests)']
    },
    debug: {
      db_products: 0,
      db_stores: 0,
      scraped_samples: {},
      match_samples: []
    }
  };

  try {
    // Get stores and products from database
    const [storesResult, productsResult] = await Promise.all([
      sql`SELECT id, name FROM stores`,
      sql`SELECT id, name, category FROM products`
    ]);

    const stores = storesResult.rows;
    const products = productsResult.rows;

    results.debug.db_products = products.length;
    results.debug.db_stores = stores.length;

    console.log(`Processing ${stores.length} stores, ${products.length} products`);

    // Process each store with sample data
    for (const store of stores) {
      results.stores[store.name] = { status: 'pending', products: 0, matched: 0 };

      try {
        const storeMatches = [];

        // Find matching prices from sample data
        for (const [productName, storePrices] of Object.entries(SAMPLE_PRICES)) {
          if (storePrices[store.name]) {
            storeMatches.push({
              name: productName,
              price: storePrices[store.name]
            });
          }
        }

        if (storeMatches.length === 0) {
          results.stores[store.name].status = 'no_data';
          continue;
        }

        results.summary.total_fetched += storeMatches.length;

        // Store samples for debugging (first 3 items)
        results.debug.scraped_samples[store.name] = storeMatches.slice(0, 3).map(item => ({
          name: item.name,
          price: item.price
        }));

        // Match and update prices
        let matched = 0;
        for (const item of storeMatches) {
          const productMatch = findProductMatch(item.name, products);

          if (productMatch && item.price > 0) {
            try {
              // Convert euros to cents (INTEGER)
              const priceCents = Math.round(item.price * 100);

              await sql`
                INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
                VALUES (${productMatch.id}, ${store.id}, ${priceCents}, NOW())
                ON CONFLICT (product_id, store_id)
                DO UPDATE SET
                  price_cents = ${priceCents},
                  recorded_at = NOW()
              `;
              matched++;
              results.summary.total_updated++;

              // Store first 5 matches for debugging
              if (results.debug.match_samples.length < 5) {
                results.debug.match_samples.push({
                  store: store.name,
                  scraped_name: item.name,
                  matched_to: productMatch.name,
                  price_euros: item.price,
                  price_cents: priceCents
                });
              }
            } catch (dbErr) {
              const errMsg = `DB insert failed for ${item.name}: ${dbErr.message}`;
              console.error(errMsg);
              results.summary.errors.push(errMsg);
            }
          }
        }

        results.stores[store.name].status = 'success';
        results.stores[store.name].products = storeMatches.length;
        results.stores[store.name].matched = matched;

      } catch (error) {
        results.stores[store.name].status = 'error';
        results.stores[store.name].error = error.message;
        results.summary.errors.push(`${store.name}: ${error.message}`);
      }
    }

    results.completed = new Date().toISOString();
    res.status(200).json(results);

  } catch (error) {
    console.error('Fetch prices failed:', error);
    res.status(500).json({
      error: error.message,
      results
    });
  }
};
