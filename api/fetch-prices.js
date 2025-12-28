const { sql } = require('@vercel/postgres');
const axios = require('axios');
const cheerio = require('cheerio');

// For Vercel deployment with puppeteer
let chromium, puppeteer;
try {
  chromium = require('@sparticuz/chromium');
  puppeteer = require('puppeteer-core');
} catch (e) {
  console.log('Puppeteer not available, using HTTP only');
}

// Common products to search for
const commonProducts = [
  'maito', 'leipä', 'juusto', 'kananmunat', 'tomaatti', 'kurkku',
  'banaani', 'omena', 'peruna', 'porkkana', 'sipuli', 'kahvi',
  'tee', 'sokeri', 'jauhot', 'riisi', 'pasta', 'jugurtti', 'voi'
];

// Helper: normalize product names
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/[^\wåäö\s]/g, '')
    .trim();
}

// Helper: find product match
function findProductMatch(scrapedName, dbProducts) {
  const normalized = normalizeProductName(scrapedName);
  return dbProducts.find(p => {
    const dbNorm = normalizeProductName(p.name);
    return normalized.includes(dbNorm) || dbNorm.includes(normalized);
  });
}

// Scraper: K-Ruoka (Kesko stores: K-City, K-Super)
async function scrapeKRuoka(errors = []) {
  const products = [];
  const debugInfo = { searched: [], found: 0, errors: [] };

  try {
    // Try K-Ruoka API
    for (const term of commonProducts.slice(0, 5)) {
      debugInfo.searched.push(term);
      try {
        const response = await axios.get(
          `https://www.k-ruoka.fi/kr-api/product/search`,
          {
            params: { query: term, pageNumber: 1, pageSize: 10 },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Referer': 'https://www.k-ruoka.fi/'
            },
            timeout: 10000
          }
        );

        if (response.data && response.data.results) {
          for (const item of response.data.results) {
            if (item.name && item.price) {
              products.push({
                name: item.name,
                price: parseFloat(item.price),
                unit: item.unit || item.salesUnit,
                ean: item.ean
              });
            }
          }
          debugInfo.found += response.data.results.length;
        } else {
          debugInfo.errors.push(`${term}: No results in response`);
        }

        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        const errMsg = `K-Ruoka search for "${term}" failed: ${err.message}`;
        console.error(errMsg);
        debugInfo.errors.push(errMsg);
        errors.push(errMsg);
      }
    }

    errors.push(`K-Ruoka: searched ${debugInfo.searched.join(', ')} → found ${products.length} products`);
    console.log(`K-Ruoka: Found ${products.length} products`);
    return products;
  } catch (error) {
    const errMsg = `K-Ruoka scraper failed: ${error.message}`;
    console.error(errMsg);
    errors.push(errMsg);
    return products;
  }
}

// Scraper: S-Market/Prisma (SOK Group)
async function scrapeSMarket(errors = []) {
  const products = [];
  const debugInfo = { searched: [], found: 0, errors: [] };

  try {
    // Try foodie.fm API (used by S-Kaupat)
    for (const term of commonProducts.slice(0, 5)) {
      debugInfo.searched.push(term);
      try {
        const response = await axios.get(
          `https://www.foodie.fi/api/v1/products/search`,
          {
            params: { q: term, page: 0, size: 10 },
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json',
              'Referer': 'https://www.foodie.fi/'
            },
            timeout: 10000
          }
        );

        if (response.data && response.data.results) {
          for (const item of response.data.results) {
            if (item.name && item.price) {
              products.push({
                name: item.name,
                price: parseFloat(item.price),
                unit: item.unit,
                ean: item.ean
              });
            }
          }
          debugInfo.found += response.data.results.length;
        } else {
          debugInfo.errors.push(`${term}: No results in response`);
        }

        await new Promise(r => setTimeout(r, 500));
      } catch (err) {
        const errMsg = `S-Market search for "${term}" failed: ${err.message}`;
        console.error(errMsg);
        debugInfo.errors.push(errMsg);
        errors.push(errMsg);
      }
    }

    errors.push(`S-Market: searched ${debugInfo.searched.join(', ')} → found ${products.length} products`);
    console.log(`S-Market: Found ${products.length} products`);
    return products;
  } catch (error) {
    const errMsg = `S-Market scraper failed: ${error.message}`;
    console.error(errMsg);
    errors.push(errMsg);
    return products;
  }
}

// Scraper: Lidl (using puppeteer for JavaScript-heavy site)
async function scrapeLidl(errors = []) {
  const products = [];

  if (!puppeteer || !chromium) {
    const errMsg = 'Lidl: Puppeteer not available, skipping';
    console.log(errMsg);
    errors.push(errMsg);
    return products;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    // Navigate to Lidl product search
    await page.goto('https://www.lidl.fi/tuotteet', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Search for products
    for (const term of commonProducts.slice(0, 3)) {
      try {
        await page.type('input[type="search"]', term);
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        const pageProducts = await page.evaluate(() => {
          const items = [];
          document.querySelectorAll('.product-grid-box').forEach(el => {
            const nameEl = el.querySelector('.product-grid-box__title');
            const priceEl = el.querySelector('.price');

            if (nameEl && priceEl) {
              const priceText = priceEl.textContent.replace(/[^0-9,.]/g, '').replace(',', '.');
              items.push({
                name: nameEl.textContent.trim(),
                price: parseFloat(priceText)
              });
            }
          });
          return items;
        });

        products.push(...pageProducts);

        // Clear search
        await page.click('input[type="search"]', { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(1000);
      } catch (err) {
        console.error(`Lidl search for "${term}" failed:`, err.message);
      }
    }

    console.log(`Lidl: Found ${products.length} products`);
  } catch (error) {
    console.error('Lidl scraper failed:', error.message);
  } finally {
    if (browser) await browser.close();
  }

  return products;
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
      errors: []
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

    // Scrape each store
    for (const store of stores) {
      const storeName = store.name.toLowerCase();
      results.stores[store.name] = { status: 'pending', products: 0, matched: 0 };

      try {
        let scrapedData = [];

        // Route to appropriate scraper
        if (storeName.includes('k-city') || storeName.includes('k-super')) {
          results.summary.errors.push(`Scraping ${store.name} with K-Ruoka API...`);
          scrapedData = await scrapeKRuoka(results.summary.errors);
        } else if (storeName.includes('s-market') || storeName.includes('prisma')) {
          results.summary.errors.push(`Scraping ${store.name} with S-Market API...`);
          scrapedData = await scrapeSMarket(results.summary.errors);
        } else if (storeName.includes('lidl')) {
          results.summary.errors.push(`Scraping ${store.name} with Lidl (Puppeteer)...`);
          scrapedData = await scrapeLidl(results.summary.errors);
        } else if (storeName.includes('alepa')) {
          results.summary.errors.push(`Scraping ${store.name} with S-Market API...`);
          scrapedData = await scrapeSMarket(results.summary.errors); // Alepa uses SOK system
        }

        if (!scrapedData || scrapedData.length === 0) {
          results.stores[store.name].status = 'no_data';
          continue;
        }

        results.summary.total_fetched += scrapedData.length;

        // Store samples for debugging (first 3 items)
        results.debug.scraped_samples[store.name] = scrapedData.slice(0, 3).map(item => ({
          name: item.name,
          price: item.price
        }));

        // Match and update prices
        let matched = 0;
        for (const item of scrapedData) {
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
        results.stores[store.name].products = scrapedData.length;
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
