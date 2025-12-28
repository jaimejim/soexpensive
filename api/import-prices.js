const { sql } = require('@vercel/postgres');

/**
 * Manual price import endpoint
 * POST body format:
 * {
 *   "prices": [
 *     {"product": "Milk 1L", "store": "Lidl", "price": 1.29},
 *     {"product": "Bread", "store": "S-Market", "price": 2.49}
 *   ]
 * }
 */

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method POST required' });
  }

  const { prices } = req.body;

  if (!prices || !Array.isArray(prices)) {
    return res.status(400).json({ error: 'Body must contain "prices" array' });
  }

  const results = {
    started: new Date().toISOString(),
    total: prices.length,
    updated: 0,
    failed: 0,
    errors: []
  };

  try {
    // Get all products and stores for matching
    const [productsResult, storesResult] = await Promise.all([
      sql`SELECT id, name FROM products`,
      sql`SELECT id, name FROM stores`
    ]);

    const products = productsResult.rows;
    const stores = storesResult.rows;

    // Process each price entry
    for (const entry of prices) {
      try {
        const { product, store, price } = entry;

        if (!product || !store || !price) {
          results.errors.push(`Missing fields: ${JSON.stringify(entry)}`);
          results.failed++;
          continue;
        }

        // Find matching product
        const productMatch = products.find(p =>
          p.name.toLowerCase().includes(product.toLowerCase()) ||
          product.toLowerCase().includes(p.name.toLowerCase())
        );

        // Find matching store
        const storeMatch = stores.find(s =>
          s.name.toLowerCase().includes(store.toLowerCase()) ||
          store.toLowerCase().includes(s.name.toLowerCase())
        );

        if (!productMatch) {
          results.errors.push(`Product not found: ${product}`);
          results.failed++;
          continue;
        }

        if (!storeMatch) {
          results.errors.push(`Store not found: ${store}`);
          results.failed++;
          continue;
        }

        // Convert price to cents and insert as new record (no UPSERT) for price history
        const priceCents = Math.round(price * 100);
        await sql`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (${productMatch.id}, ${storeMatch.id}, ${priceCents}, NOW())
        `;

        results.updated++;

      } catch (error) {
        results.errors.push(`${entry.product} @ ${entry.store}: ${error.message}`);
        results.failed++;
      }
    }

    results.completed = new Date().toISOString();
    res.status(200).json(results);

  } catch (error) {
    console.error('Import failed:', error);
    res.status(500).json({
      error: error.message,
      results
    });
  }
};
