const { sql } = require('@vercel/postgres');

// Common products to search for (expand this list)
const commonProducts = [
  'maito', 'leipä', 'juusto', 'kananmunat', 'tomaatti', 'kurkku',
  'banaani', 'omena', 'peruna', 'porkkana', 'sipuli', 'kahvi',
  'tee', 'sokeri', 'jauhot', 'riisi', 'pasta', 'jugurtti', 'voi',
  'margariini', 'kinkku', 'meetvursti', 'olut', 'limonaadi'
];

// Helper function to normalize product names for matching
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[^\wåäö\s]/g, '')
    .trim();
}

// Helper function to match scraped product to database product
function findProductMatch(scrapedName, dbProducts) {
  const normalized = normalizeProductName(scrapedName);

  return dbProducts.find(p => {
    const dbNorm = normalizeProductName(p.name);
    return normalized.includes(dbNorm) || dbNorm.includes(normalized);
  });
}

// Store-specific scraping functions
const scrapers = {
  // K-Ruoka API (K-Citymarket, K-Supermarket)
  async scrapeKRuoka() {
    const products = [];

    try {
      for (const searchTerm of commonProducts.slice(0, 10)) {
        const url = `https://www.k-ruoka.fi/kr-api/product/search?query=${encodeURIComponent(searchTerm)}&pageNumber=1&pageSize=20`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) continue;

        const data = await response.json();

        if (data.results && Array.isArray(data.results)) {
          for (const item of data.results) {
            if (item.name && item.price) {
              products.push({
                name: item.name,
                price: parseFloat(item.price),
                unit: item.unitPriceUnit || item.unit,
                ean: item.ean
              });
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`K-Ruoka: Found ${products.length} products`);
      return products;
    } catch (error) {
      console.error('K-Ruoka scrape failed:', error.message);
      return products;
    }
  },

  // S-Market/Prisma API (SOK Group)
  async scrapeSMarket() {
    const products = [];

    try {
      // Try the Foodie.fm API used by S-Kaupat
      for (const searchTerm of commonProducts.slice(0, 10)) {
        const url = `https://www.foodie.fi/api/products/search?term=${encodeURIComponent(searchTerm)}&limit=20`;

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          // Try alternative endpoint
          const altUrl = `https://www.s-kaupat.fi/api/search?query=${encodeURIComponent(searchTerm)}`;
          const altResponse = await fetch(altUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json'
            }
          });

          if (!altResponse.ok) continue;

          const altData = await altResponse.json();
          if (altData.products && Array.isArray(altData.products)) {
            for (const item of altData.products) {
              if (item.name && item.price) {
                products.push({
                  name: item.name,
                  price: parseFloat(item.price),
                  unit: item.unit,
                  ean: item.ean
                });
              }
            }
          }
          continue;
        }

        const data = await response.json();

        if (data.products && Array.isArray(data.products)) {
          for (const item of data.products) {
            if (item.name && item.price) {
              products.push({
                name: item.name,
                price: parseFloat(item.price),
                unit: item.unit,
                ean: item.ean
              });
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`S-Market: Found ${products.length} products`);
      return products;
    } catch (error) {
      console.error('S-Market scrape failed:', error.message);
      return products;
    }
  },

  // Lidl scraper
  async scrapeLidl() {
    const products = [];

    try {
      // Lidl Finland product API
      const url = 'https://www.lidl.fi/api/products';

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log('Lidl API not accessible, trying alternative method');
        return products;
      }

      const data = await response.json();

      if (data.products && Array.isArray(data.products)) {
        for (const item of data.products) {
          if (item.name && item.price) {
            products.push({
              name: item.name,
              price: parseFloat(item.price),
              unit: item.unit,
              ean: item.ean
            });
          }
        }
      }

      console.log(`Lidl: Found ${products.length} products`);
      return products;
    } catch (error) {
      console.error('Lidl scrape failed:', error.message);
      return products;
    }
  },

  // Alepa (part of SOK, similar to S-Market)
  async scrapeAlepa() {
    // Alepa uses same system as S-Market
    return this.scrapeSMarket();
  },

  // Prisma (part of SOK, similar to S-Market)
  async scrapePrisma() {
    // Prisma uses same system as S-Market
    return this.scrapeSMarket();
  }
};

module.exports = async (req, res) => {
  // Allow both POST and GET for testing
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = {
    started: new Date().toISOString(),
    stores: {},
    summary: {
      total_fetched: 0,
      total_updated: 0,
      errors: []
    }
  };

  try {
    // Get all stores from database
    const storesResult = await sql`SELECT id, name FROM stores`;
    const stores = storesResult.rows;

    // Get all products to match against
    const productsResult = await sql`SELECT id, name, category FROM products`;
    const products = productsResult.rows;

    console.log(`Processing ${stores.length} stores and ${products.length} products`);

    // Attempt to scrape each store
    for (const store of stores) {
      const storeName = store.name;
      results.stores[storeName] = { status: 'pending', products: 0, matched: 0 };

      try {
        let scrapedData = [];

        // Try different scrapers based on store name
        if (storeName.toLowerCase().includes('k-city') || storeName.toLowerCase().includes('k-super')) {
          scrapedData = await scrapers.scrapeKRuoka();
        } else if (storeName.toLowerCase().includes('s-market')) {
          scrapedData = await scrapers.scrapeSMarket();
        } else if (storeName.toLowerCase().includes('prisma')) {
          scrapedData = await scrapers.scrapePrisma();
        } else if (storeName.toLowerCase().includes('lidl')) {
          scrapedData = await scrapers.scrapeLidl();
        } else if (storeName.toLowerCase().includes('alepa')) {
          scrapedData = await scrapers.scrapeAlepa();
        }

        if (!scrapedData || scrapedData.length === 0) {
          results.stores[storeName].status = 'no_data';
          continue;
        }

        results.summary.total_fetched += scrapedData.length;

        // Match scraped products to our database products
        let matched = 0;
        for (const scrapedProduct of scrapedData) {
          const productMatch = findProductMatch(scrapedProduct.name, products);

          if (productMatch && scrapedProduct.price > 0) {
            // Insert or update price
            await sql`
              INSERT INTO prices (product_id, store_id, price, recorded_at)
              VALUES (${productMatch.id}, ${store.id}, ${scrapedProduct.price}, NOW())
              ON CONFLICT (product_id, store_id)
              DO UPDATE SET price = ${scrapedProduct.price}, recorded_at = NOW()
            `;
            matched++;
            results.summary.total_updated++;
          }
        }

        results.stores[storeName].status = 'success';
        results.stores[storeName].products = scrapedData.length;
        results.stores[storeName].matched = matched;

      } catch (error) {
        results.stores[storeName].status = 'error';
        results.stores[storeName].error = error.message;
        results.summary.errors.push(`${storeName}: ${error.message}`);
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
