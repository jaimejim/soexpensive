const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database initialization state
let dbInitialized = false;
let dbInitPromise = null;

// Initialize database only when needed and only once
async function ensureDbInitialized() {
  if (dbInitialized) return true;

  // Check if POSTGRES_URL is configured
  if (!process.env.POSTGRES_URL) {
    throw new Error('Database not configured. Please add PostgreSQL database in Vercel dashboard.');
  }

  if (!dbInitPromise) {
    dbInitPromise = db.initDatabase()
      .then(() => {
        dbInitialized = true;
        console.log('Database ready');
        return true;
      })
      .catch(err => {
        console.error('Database initialization failed:', err);
        dbInitPromise = null; // Reset so it can retry
        throw err;
      });
  }

  return dbInitPromise;
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const hasPostgresUrl = !!process.env.POSTGRES_URL;
  let dbCheck = 'not_initialized';

  if (hasPostgresUrl) {
    try {
      await ensureDbInitialized();
      const hasData = await db.isDatabaseInitialized();
      dbCheck = hasData ? 'initialized_with_data' : 'initialized_empty';
    } catch (error) {
      dbCheck = 'error: ' + error.message;
    }
  }

  res.json({
    status: 'ok',
    database: {
      hasPostgresUrl,
      state: dbCheck
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes

// Get all products with their latest prices
app.get('/api/products', async (req, res) => {
  try {
    await ensureDbInitialized();
    const products = await db.getProductsWithPrices();

    // Group by product
    const grouped = {};
    products.forEach(item => {
      if (!grouped[item.id]) {
        grouped[item.id] = {
          id: item.id,
          name: item.name,
          category: item.category,
          unit: item.unit,
          prices: {}
        };
      }
      if (item.price !== null) {
        grouped[item.id].prices[item.store_name] = {
          price: parseFloat(item.price),
          recorded_at: item.recorded_at
        };
      }
    });

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get price history for a specific product
app.get('/api/products/:id/history', async (req, res) => {
  try {
    await ensureDbInitialized();
    const history = await db.getPriceHistory(req.params.id);
    res.json(history.map(h => ({
      ...h,
      price: parseFloat(h.price)
    })));
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all stores
app.get('/api/stores', async (req, res) => {
  try {
    await ensureDbInitialized();
    const stores = await db.getStores();
    res.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add a new price entry
app.post('/api/prices', async (req, res) => {
  try {
    await ensureDbInitialized();
    const { product_id, store_id, price } = req.body;
    const result = await db.addPrice(product_id, store_id, price);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error adding price:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product details
app.get('/api/products/:id', async (req, res) => {
  try {
    await ensureDbInitialized();
    const product = await db.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export for Vercel
module.exports = app;

// Start server only if not in serverless environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
