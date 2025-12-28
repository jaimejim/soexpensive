const { sql } = require('@vercel/postgres');

/**
 * CSV Price Import Endpoint
 * Handles pipe-delimited format from scraped store data
 *
 * POST body format:
 * {
 *   "store": "K-Citymarket",
 *   "csvData": "PRODUCT NAME | PRICE (€/unit) | PRICE (€/kg)\nPirkka banaani | 0.30 | 1.69"
 * }
 */

// Helper: normalize product names for matching
function normalizeProductName(name) {
  return name
    .toLowerCase()
    // Remove common brand names
    .replace(/\bpirkka\b/g, '')
    .replace(/\bk-menu\b/g, '')
    .replace(/\brainbow\b/g, '')
    .replace(/\bvalio\b/g, '')
    // Remove origin markers
    .replace(/\bsuomi\b/g, '')
    .replace(/\bulkomainen\b/g, '')
    .replace(/\bespanja\b/g, '')
    .replace(/\bitalia\b/g, '')
    // Remove qualifiers
    .replace(/\bluomu\b/g, '')
    .replace(/\bparhaat\b/g, '')
    .replace(/\bsuomalainen\b/g, '')
    .replace(/\btuore\b/g, '')
    // Keep Finnish characters, remove everything else
    .replace(/[^\wåäö\s]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: find best product match in database
function findProductMatch(scrapedName, dbProducts) {
  const normalized = normalizeProductName(scrapedName);

  // Split into words for flexible matching
  const words = normalized.split(' ').filter(w => w.length > 2); // ignore short words

  if (words.length === 0) return null;

  // Try exact match first
  let match = dbProducts.find(p => normalizeProductName(p.name) === normalized);
  if (match) return match;

  // Try matching with main words (most flexible)
  match = dbProducts.find(p => {
    const dbNorm = normalizeProductName(p.name);
    const dbWords = dbNorm.split(' ').filter(w => w.length > 2);

    // Check if all database words are in scraped name
    return dbWords.every(dbWord =>
      words.some(scrapedWord =>
        scrapedWord.includes(dbWord) || dbWord.includes(scrapedWord)
      )
    );
  });

  return match;
}

// Helper: parse CSV line (pipe-delimited)
function parseCSVLine(line) {
  const parts = line.split('|').map(p => p.trim());
  if (parts.length < 2) return null;

  const productName = parts[0];
  const priceUnit = parseFloat(parts[1]);
  const priceKg = parts[2] ? parseFloat(parts[2]) : null;

  if (!productName || isNaN(priceUnit)) return null;

  return {
    productName,
    priceUnit,
    priceKg
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method POST required' });
  }

  const { store, csvData } = req.body;

  if (!store || !csvData) {
    return res.status(400).json({
      error: 'Body must contain "store" and "csvData"',
      example: {
        store: 'K-Citymarket',
        csvData: 'PRODUCT NAME | PRICE (€/unit) | PRICE (€/kg)\nPirkka banaani | 0.30 | 1.69'
      }
    });
  }

  const results = {
    started: new Date().toISOString(),
    store,
    total: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    matches: []
  };

  try {
    // Get all products and stores from database
    const [productsResult, storesResult] = await Promise.all([
      sql`SELECT id, name, category, unit FROM products ORDER BY name`,
      sql`SELECT id, name FROM stores WHERE name = ${store}`
    ]);

    const dbProducts = productsResult.rows;
    const storeMatch = storesResult.rows[0];

    if (!storeMatch) {
      return res.status(400).json({
        error: `Store "${store}" not found in database`,
        availableStores: ['S-Market', 'Prisma', 'K-Citymarket', 'K-Supermarket', 'Lidl', 'Alepa']
      });
    }

    // Parse CSV data
    const lines = csvData.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Skip header line if it exists
    let startIndex = 0;
    if (lines[0] && lines[0].toLowerCase().includes('product name')) {
      startIndex = 1;
      console.log('Skipping header line');
    }

    results.total = lines.length - startIndex;

    // Process each line
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];

      try {
        const parsed = parseCSVLine(line);

        if (!parsed) {
          results.errors.push(`Line ${i + 1}: Could not parse "${line.substring(0, 50)}..."`);
          results.failed++;
          continue;
        }

        // Find matching product in database
        const productMatch = findProductMatch(parsed.productName, dbProducts);

        if (!productMatch) {
          results.errors.push(`Line ${i + 1}: No match for "${parsed.productName}"`);
          results.skipped++;
          continue;
        }

        // Convert price from euros to cents
        const priceCents = Math.round(parsed.priceUnit * 100);

        // Insert price record
        await sql`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (${productMatch.id}, ${storeMatch.id}, ${priceCents}, NOW())
        `;

        results.imported++;

        // Store first 10 matches for verification
        if (results.matches.length < 10) {
          results.matches.push({
            line: i + 1,
            scraped: parsed.productName,
            matched: productMatch.name,
            price_euros: parsed.priceUnit,
            price_cents: priceCents,
            category: productMatch.category
          });
        }

      } catch (error) {
        results.errors.push(`Line ${i + 1}: ${error.message}`);
        results.failed++;
      }
    }

    results.completed = new Date().toISOString();

    // Success response
    res.status(200).json(results);

  } catch (error) {
    console.error('CSV import failed:', error);
    res.status(500).json({
      error: error.message,
      results
    });
  }
};
