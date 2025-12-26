const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'prices.db'));

// Create tables
function initDatabase() {
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      unit TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stores table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Prices table - stores historical price data
  db.exec(`
    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      store_id INTEGER NOT NULL,
      price REAL NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    )
  `);

  // Create index for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_prices_product_store
    ON prices(product_id, store_id, recorded_at)
  `);

  console.log('Database initialized successfully');
}

// Get all products with latest prices
function getProductsWithPrices() {
  const query = `
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
    LEFT JOIN (
      SELECT product_id, store_id, price, recorded_at
      FROM prices
      WHERE (product_id, store_id, recorded_at) IN (
        SELECT product_id, store_id, MAX(recorded_at)
        FROM prices
        GROUP BY product_id, store_id
      )
    ) pr ON p.id = pr.product_id AND s.id = pr.store_id
    ORDER BY p.category, p.name, s.name
  `;

  return db.prepare(query).all();
}

// Get price history for a specific product
function getPriceHistory(productId) {
  const query = `
    SELECT
      s.name as store_name,
      pr.price,
      pr.recorded_at
    FROM prices pr
    JOIN stores s ON pr.store_id = s.id
    WHERE pr.product_id = ?
    ORDER BY pr.recorded_at ASC
  `;

  return db.prepare(query).all(productId);
}

// Add a new price entry
function addPrice(productId, storeId, price) {
  const stmt = db.prepare('INSERT INTO prices (product_id, store_id, price) VALUES (?, ?, ?)');
  return stmt.run(productId, storeId, price);
}

// Get all stores
function getStores() {
  return db.prepare('SELECT * FROM stores ORDER BY name').all();
}

// Get all products
function getProducts() {
  return db.prepare('SELECT * FROM products ORDER BY category, name').all();
}

// Add a new product
function addProduct(name, category, unit) {
  const stmt = db.prepare('INSERT INTO products (name, category, unit) VALUES (?, ?, ?)');
  return stmt.run(name, category, unit);
}

// Get product by ID
function getProduct(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

module.exports = {
  db,
  initDatabase,
  getProductsWithPrices,
  getPriceHistory,
  addPrice,
  getStores,
  getProducts,
  addProduct,
  getProduct
};
