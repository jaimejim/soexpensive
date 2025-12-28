/**
 * Parse scraped store data and generate normalized seed database
 *
 * This script:
 * 1. Parses K-Citymarket CSV and S-Market pipe-delimited data
 * 2. Normalizes product names (strips brands, origins, qualifiers)
 * 3. Creates unique product list with categories and units
 * 4. Generates seed.js with real prices
 */

const fs = require('fs');
const path = require('path');

// Normalization function (matches import-csv.js)
function normalizeProductName(name) {
  return name
    .toLowerCase()
    .replace(/\bpirkka\b/g, '')
    .replace(/\bk-menu\b/g, '')
    .replace(/\brainbow\b/g, '')
    .replace(/\bvalio\b/g, '')
    .replace(/\bcoop\b/g, '')
    .replace(/\bchiquita\b/g, '')
    .replace(/\bkotimaista\b/g, '')
    .replace(/\bsuomi\b/g, '')
    .replace(/\bulkomainen\b/g, '')
    .replace(/\bespanja\b/g, '')
    .replace(/\bitalia\b/g, '')
    .replace(/\bbruno\b/g, '')
    .replace(/\bluomu\b/g, '')
    .replace(/\bparhaat\b/g, '')
    .replace(/\bsuomalainen\b/g, '')
    .replace(/\btuore\b/g, '')
    .replace(/\bpesty\b/g, '')
    .replace(/\breilun kaupan\b/g, '')
    .replace(/\bmaustamaton\b/g, '')
    .replace(/\bmiedosti suolatu\b/g, '')
    .replace(/\bmarinioidtu\b/g, '')
    .replace(/\bhunajamarinoitu\b/g, '')
    .replace(/\bpakattu\b/g, '')
    .replace(/\birto\b/g, '')
    .replace(/\birtomyynti\b/g, '')
    .replace(/\bkg\b/g, '')
    .replace(/\bn\.\s*/g, '')
    .replace(/\bca\./g, '')
    .replace(/[^\wåäö\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Category mapping based on Finnish categories
const categoryMap = {
  'hedelmät': 'Fruits',
  'fruits': 'Fruits',
  'vihannekset': 'Vegetables',
  'vegetables': 'Vegetables',
  'liha': 'Meat',
  'meat': 'Meat',
  'kasviproteiinit': 'Meat', // Group with meat for now
  'kala': 'Fish',
  'fish': 'Fish',
  'merenelävät': 'Fish',
  'seafood': 'Fish',
  'maito': 'Dairy',
  'dairy': 'Dairy',
  'munat': 'Dairy',
  'eggs': 'Dairy',
  'rasvat': 'Dairy',
  'fats': 'Dairy',
  'kahvi': 'Beverages',
  'coffee': 'Beverages',
  'tee': 'Beverages',
  'tea': 'Beverages',
  'mehu': 'Beverages',
  'juice': 'Beverages',
  'juoma': 'Beverages',
  'beverages': 'Beverages',
  'leipä': 'Bakery',
  'bread': 'Bakery',
  'keksi': 'Bakery',
  'biscuits': 'Bakery',
  'leivonnaiset': 'Bakery',
  'baking': 'Bakery',
  'pasta': 'Pantry',
  'riisi': 'Pantry',
  'rice': 'Pantry',
  'nuudeli': 'Pantry',
  'noodles': 'Pantry',
  'snacks': 'Snacks',
  'snacksit': 'Snacks'
};

function getCategoryFromText(text) {
  const lower = text.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  return 'Other';
}

// Parse K-Citymarket CSV
function parseKCitymarket(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim());
  const products = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');

    if (parts.length < 5) continue;

    const name = parts[0].trim();
    const category = parts[1].trim();
    const priceUnit = parseFloat(parts[2]);
    const unit = parts[4].trim().replace('per ', '');

    if (!name || isNaN(priceUnit)) continue;

    products.push({
      originalName: name,
      normalizedName: normalizeProductName(name),
      category: getCategoryFromText(category),
      priceEuros: priceUnit,
      unit: unit,
      store: 'K-Citymarket'
    });
  }

  return products;
}

// Parse S-Market pipe-delimited
function parseSMarket(text) {
  const lines = text.split('\n').filter(l => l.trim() && l.includes('|'));
  const products = [];

  for (const line of lines) {
    // Skip section headers
    if (line.toUpperCase() === line && !line.match(/\d/)) continue;

    const parts = line.split('|').map(p => p.trim());

    if (parts.length < 2) continue;

    const name = parts[0];
    const priceUnit = parseFloat(parts[1]);

    if (!name || isNaN(priceUnit)) continue;

    // Infer category from context
    let category = 'Other';
    if (name.match(/banaani|omena|päärynä|sitruuna|klementiini|appelsiini|mandariini|granaatti|meloni|rypäle|kiivi|avokado|mango|persimoni?/i)) {
      category = 'Fruits';
    } else if (name.match(/kurkku|tomaatti|porkkana|sipuli|peruna|paprika|salaatti|kaali|lanttu|punajuuri|bataat|inkivääri|valkosipuli|purjo|chili/i)) {
      category = 'Vegetables';
    } else if (name.match(/jauheliha|nakki|makkara|kinkku|leike|filee|pihvi|meetvurst|pekoni|siskonmakkara|salami/i)) {
      category = 'Meat';
    } else if (name.match(/lohi|muikku|kala|mäti/i)) {
      category = 'Fish';
    } else if (name.match(/maito|kerma|juusto|munat?|smetana|fraiche|kaurajuoma/i)) {
      category = 'Dairy';
    } else if (name.match(/kahvi|kiisseli/i)) {
      category = 'Beverages';
    } else if (name.match(/leipä|kakku|rulla/i)) {
      category = 'Bakery';
    } else if (name.match(/pasta|riisi|nuudeli|spaghetti/i)) {
      category = 'Pantry';
    } else if (name.match(/sipsi|lastut|crackers/i)) {
      category = 'Snacks';
    }

    // Infer unit
    let unit = 'kpl';
    if (name.match(/\d+g/)) {
      const match = name.match(/(\d+)g/);
      unit = match[1] + 'g';
    } else if (name.match(/\d+kg/)) {
      const match = name.match(/(\d+(?:\.\d+)?)kg/);
      unit = match[1] + 'kg';
    } else if (name.match(/\d+l/i)) {
      const match = name.match(/(\d+(?:\.\d+)?)l/i);
      unit = match[1] + 'L';
    } else if (name.match(/\bkg\b/i)) {
      unit = 'kg';
    }

    products.push({
      originalName: name,
      normalizedName: normalizeProductName(name),
      category,
      priceEuros: priceUnit,
      unit,
      store: 'S-Market'
    });
  }

  return products;
}

// Create unique product list
function createProductList(allProducts) {
  const productMap = new Map();

  for (const product of allProducts) {
    const key = product.normalizedName;

    if (!productMap.has(key)) {
      // Create generic product name
      let genericName = product.normalizedName
        .split(' ')
        .filter(w => w.length > 0)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      // Add unit to name if not already there
      if (!genericName.match(/\d+(g|kg|ml|l|kpl)/i) && product.unit !== 'kpl' && product.unit !== 'kg') {
        genericName += ' ' + product.unit;
      }

      productMap.set(key, {
        name: genericName,
        category: product.category,
        unit: product.unit,
        prices: []
      });
    }

    // Add price for this store
    productMap.get(key).prices.push({
      store: product.store,
      price: product.priceEuros
    });
  }

  return Array.from(productMap.values());
}

// Generate seed.js
function generateSeedFile(products) {
  const uniqueProducts = products.filter(p => p.prices.length > 0);

  let output = `/**
 * Seed database with normalized products from real scraped data
 * Generated: ${new Date().toISOString()}
 *
 * Data sources:
 * - K-Citymarket: Real prices collected 2025-12-28
 * - S-Market: Real prices collected 2025-12-28
 */

const { sql } = require('@vercel/postgres');

// Normalized products (brand names stripped)
const products = [
`;

  for (const product of uniqueProducts) {
    output += `  { name: '${product.name}', category: '${product.category}', unit: '${product.unit}' },\n`;
  }

  output += `];

const stores = [
  'S-Market',
  'Prisma', // Same chain as S-Market, uses S-Market prices
  'K-Citymarket',
  'K-Supermarket',
  'Lidl',
  'Alepa'
];

async function seed() {
  console.log('🌱 Starting database seed with real scraped data...');

  try {
    // Insert stores
    console.log('Creating stores...');
    const storeIds = {};
    for (const storeName of stores) {
      const result = await sql\`
        INSERT INTO stores (name)
        VALUES (\${storeName})
        ON CONFLICT (name) DO UPDATE SET name = \${storeName}
        RETURNING id
      \`;
      storeIds[storeName] = result.rows[0].id;
      console.log(\`  ✓ \${storeName}\`);
    }

    // Insert products
    console.log('\\nCreating products...');
    const productIds = {};
    for (const product of products) {
      const result = await sql\`
        INSERT INTO products (name, category, unit)
        VALUES (\${product.name}, \${product.category}, \${product.unit})
        ON CONFLICT (name, category, unit) DO UPDATE
        SET name = \${product.name}
        RETURNING id
      \`;
      const key = \`\${product.name}|\${product.category}|\${product.unit}\`;
      productIds[key] = result.rows[0].id;
    }
    console.log(\`  ✓ Created \${products.length} products\`);

    // Insert real prices from scraped data
    console.log('\\nInserting real prices from scraped data...');
    const priceData = ${JSON.stringify(products.map(p => ({
      name: p.name,
      category: p.category,
      unit: p.unit,
      prices: p.prices
    })), null, 2)};

    let priceCount = 0;
    for (const item of priceData) {
      const key = \`\${item.name}|\${item.category}|\${item.unit}\`;
      const productId = productIds[key];

      if (!productId) continue;

      for (const priceInfo of item.prices) {
        const storeId = storeIds[priceInfo.store];
        if (!storeId) continue;

        const priceCents = Math.round(priceInfo.price * 100);

        await sql\`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (\${productId}, \${storeId}, \${priceCents}, CURRENT_TIMESTAMP)
        \`;

        priceCount++;
      }
    }

    console.log(\`  ✓ Inserted \${priceCount} real prices\`);

    // Add Prisma prices (same as S-Market)
    console.log('\\nAdding Prisma prices (same chain as S-Market)...');
    for (const item of priceData) {
      const key = \`\${item.name}|\${item.category}|\${item.unit}\`;
      const productId = productIds[key];

      if (!productId) continue;

      for (const priceInfo of item.prices) {
        if (priceInfo.store !== 'S-Market') continue;

        const storeId = storeIds['Prisma'];
        if (!storeId) continue;

        const priceCents = Math.round(priceInfo.price * 100);

        await sql\`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (\${productId}, \${storeId}, \${priceCents}, CURRENT_TIMESTAMP)
        \`;
      }
    }

    // Add sample prices for stores without real data
    console.log('\\nAdding sample prices for other stores...');
    const otherStores = stores.filter(s => s !== 'K-Citymarket' && s !== 'S-Market' && s !== 'Prisma');

    for (const item of priceData) {
      const key = \`\${item.name}|\${item.category}|\${item.unit}\`;
      const productId = productIds[key];

      if (!productId || item.prices.length === 0) continue;

      // Use average of real prices as base
      const avgPrice = item.prices.reduce((sum, p) => sum + p.price, 0) / item.prices.length;

      for (const storeName of otherStores) {
        const storeId = storeIds[storeName];
        if (!storeId) continue;

        // Vary price by ±15%
        const variation = 0.85 + Math.random() * 0.3;
        const estimatedPrice = avgPrice * variation;
        const priceCents = Math.round(estimatedPrice * 100);

        await sql\`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (\${productId}, \${storeId}, \${priceCents}, CURRENT_TIMESTAMP)
        \`;
      }
    }

    console.log('  ✓ Added sample prices for other stores');

    console.log('\\n✅ Seed completed successfully!');
    console.log(\`   Products: \${products.length}\`);
    console.log(\`   Stores: \${stores.length}\`);
    console.log(\`   Real prices: \${priceCount}\`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seed };
`;

  return output;
}

// Main execution
async function main() {
  console.log('📊 Parsing scraped store data...\n');

  // Read data files
  const kCitymarketCSV = fs.readFileSync(
    path.join(__dirname, '../data/k-citymarket.csv'),
    'utf-8'
  );

  const sMarketText = fs.readFileSync(
    path.join(__dirname, '../data/s-market.txt'),
    'utf-8'
  );

  // Parse data
  console.log('Parsing K-Citymarket...');
  const kProducts = parseKCitymarket(kCitymarketCSV);
  console.log(`  ✓ Found ${kProducts.length} products\n`);

  console.log('Parsing S-Market...');
  const sProducts = parseSMarket(sMarketText);
  console.log(`  ✓ Found ${sProducts.length} products\n`);

  // Combine and deduplicate
  const allProducts = [...kProducts, ...sProducts];
  const uniqueProducts = createProductList(allProducts);

  console.log(`Created ${uniqueProducts.length} unique normalized products\n`);

  // Generate seed file
  const seedContent = generateSeedFile(uniqueProducts);

  fs.writeFileSync(
    path.join(__dirname, '../seed-real.js'),
    seedContent
  );

  console.log('✅ Generated seed-real.js\n');

  // Show sample products
  console.log('Sample normalized products:');
  uniqueProducts.slice(0, 10).forEach(p => {
    const stores = p.prices.map(pr => pr.store).join(', ');
    console.log(`  - ${p.name} (${p.category}, ${p.unit}) [${stores}]`);
  });
}

main().catch(console.error);
