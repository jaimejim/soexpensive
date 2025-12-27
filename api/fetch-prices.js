const { sql } = require('@vercel/postgres');

// Store-specific scraping functions
const scrapers = {
  async scrapeLidl() {
    // Lidl blocks direct requests, would need headless browser
    // For now, return mock data
    return null;
  },

  async scrapeKRuoka() {
    // K-Ruoka has an API: https://www.k-ruoka.fi/kr-api/product/search
    try {
      const response = await fetch('https://www.k-ruoka.fi/kr-api/product/search?query=maito&pageNumber=1', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('K-Ruoka scrape failed:', error);
      return null;
    }
  },

  async scrapeSMarket() {
    // S-Market uses Kesko's API similar to K-Ruoka
    try {
      const response = await fetch('https://www.s-kaupat.fi/tuotteet/api/products?search=maito', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('S-Market scrape failed:', error);
      return null;
    }
  }
};

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Attempt to scrape each store
    for (const store of stores) {
      const storeName = store.name;
      results.stores[storeName] = { status: 'pending', products: 0 };

      try {
        let scrapedData = null;

        // Try different scrapers based on store name
        if (storeName.includes('K-')) {
          scrapedData = await scrapers.scrapeKRuoka();
        } else if (storeName.includes('S-')) {
          scrapedData = await scrapers.scrapeSMarket();
        } else if (storeName === 'Lidl') {
          scrapedData = await scrapers.scrapeLidl();
        }

        if (!scrapedData || scrapedData.length === 0) {
          results.stores[storeName].status = 'no_data';
          continue;
        }

        // Match scraped products to our database products
        let matched = 0;
        for (const scrapedProduct of scrapedData) {
          const productMatch = products.find(p =>
            p.name.toLowerCase().includes(scrapedProduct.name?.toLowerCase()) ||
            scrapedProduct.name?.toLowerCase().includes(p.name.toLowerCase())
          );

          if (productMatch && scrapedProduct.price) {
            // Insert new price
            await sql`
              INSERT INTO prices (product_id, store_id, price, recorded_at)
              VALUES (${productMatch.id}, ${store.id}, ${scrapedProduct.price}, NOW())
            `;
            matched++;
            results.summary.total_updated++;
          }
        }

        results.stores[storeName].status = 'success';
        results.stores[storeName].products = matched;
        results.summary.total_fetched += scrapedData.length;

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
