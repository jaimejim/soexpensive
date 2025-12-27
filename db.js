const { sql } = require('@vercel/postgres');

// Initialize database tables
async function initDatabase() {
  try {
    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        unit TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(name, category, unit)
      )
    `;

    // Create stores table
    await sql`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create prices table - stores historical price data
    await sql`
      CREATE TABLE IF NOT EXISTS prices (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id),
        store_id INTEGER NOT NULL REFERENCES stores(id),
        price DECIMAL(10,2) NOT NULL,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_prices_product_store
      ON prices(product_id, store_id, recorded_at)
    `;

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    // If tables already exist, that's fine
    if (error.message.includes('already exists')) {
      console.log('Tables already exist, skipping creation');
      return true;
    }
    throw error;
  }
}

// Get all products with latest prices
async function getProductsWithPrices() {
  const result = await sql`
    SELECT
      p.id,
      p.name,
      p.category,
      p.unit,
      s.name as store_name,
      pr.price,
      pr.recorded_at
    FROM products p
    CROSS JOIN stores s
    LEFT JOIN LATERAL (
      SELECT product_id, store_id, price, recorded_at
      FROM prices
      WHERE product_id = p.id AND store_id = s.id
      ORDER BY recorded_at DESC
      LIMIT 1
    ) pr ON true
    ORDER BY p.category, p.name, s.name
  `;

  return result.rows;
}

// Get price history for a specific product
async function getPriceHistory(productId) {
  const result = await sql`
    SELECT
      s.name as store_name,
      pr.price,
      pr.recorded_at
    FROM prices pr
    JOIN stores s ON pr.store_id = s.id
    WHERE pr.product_id = ${productId}
    ORDER BY pr.recorded_at ASC
  `;

  return result.rows;
}

// Add a new price entry
async function addPrice(productId, storeId, price) {
  const result = await sql`
    INSERT INTO prices (product_id, store_id, price)
    VALUES (${productId}, ${storeId}, ${price})
    RETURNING id
  `;

  return { lastInsertRowid: result.rows[0].id };
}

// Get all stores
async function getStores() {
  const result = await sql`
    SELECT * FROM stores ORDER BY name
  `;

  return result.rows;
}

// Get all products
async function getProducts() {
  const result = await sql`
    SELECT * FROM products ORDER BY category, name
  `;

  return result.rows;
}

// Add a new product
async function addProduct(name, category, unit) {
  const result = await sql`
    INSERT INTO products (name, category, unit)
    VALUES (${name}, ${category}, ${unit})
    ON CONFLICT (name, category, unit) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id
  `;

  return { lastInsertRowid: result.rows[0].id };
}

// Get product by ID
async function getProduct(id) {
  const result = await sql`
    SELECT * FROM products WHERE id = ${id}
  `;

  return result.rows[0];
}

// Add store
async function addStore(name) {
  try {
    const result = await sql`
      INSERT INTO stores (name)
      VALUES (${name})
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    return result.rows[0].id;
  } catch (error) {
    // If store exists, get its ID
    const result = await sql`SELECT id FROM stores WHERE name = ${name}`;
    return result.rows[0].id;
  }
}

// Get store by name
async function getStoreByName(name) {
  const result = await sql`
    SELECT * FROM stores WHERE name = ${name}
  `;
  return result.rows[0];
}

// Check if database is initialized
async function isDatabaseInitialized() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM products
    `;
    return result.rows[0].count > 0;
  } catch (error) {
    return false;
  }
}

module.exports = {
  sql,
  initDatabase,
  getProductsWithPrices,
  getPriceHistory,
  addPrice,
  getStores,
  getProducts,
  addProduct,
  getProduct,
  addStore,
  getStoreByName,
  isDatabaseInitialized
};
