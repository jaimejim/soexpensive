const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize database
db.initDatabase();

// API Routes

// Get all products with their latest prices
app.get('/api/products', (req, res) => {
  try {
    const products = db.getProductsWithPrices();

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
          price: item.price,
          recorded_at: item.recorded_at
        };
      }
    });

    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get price history for a specific product
app.get('/api/products/:id/history', (req, res) => {
  try {
    const history = db.getPriceHistory(req.params.id);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all stores
app.get('/api/stores', (req, res) => {
  try {
    const stores = db.getStores();
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new price entry
app.post('/api/prices', (req, res) => {
  try {
    const { product_id, store_id, price } = req.body;
    const result = db.addPrice(product_id, store_id, price);
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product details
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.getProduct(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
