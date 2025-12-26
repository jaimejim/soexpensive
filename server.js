const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize database (async)
let dbInitialized = false;
db.initDatabase().then(() => {
  dbInitialized = true;
  console.log('Database ready');
}).catch(err => {
  console.error('Database initialization failed:', err);
});

// API Routes

// Get all products with their latest prices
app.get('/api/products', async (req, res) => {
  try {
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

// Export for Vercel
module.exports = app;

// Start server only if not in serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
