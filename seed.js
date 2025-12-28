/**
 * Seed database with normalized products from real scraped data
 * Generated: 2025-12-28T20:27:00.482Z
 *
 * Data sources:
 * - K-Citymarket: Real prices collected 2025-12-28
 * - S-Market: Real prices collected 2025-12-28
 */

const { sql } = require('@vercel/postgres');

// Normalized products (brand names stripped)
const products = [
  { name: 'Banaani piece', category: 'Fruits', unit: 'piece' },
  { name: 'Kurkku piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Miniluumutomaatti 250g', category: 'Vegetables', unit: 'pack' },
  { name: 'Tomaatti piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Jääsalaatti 100g', category: 'Vegetables', unit: 'pack' },
  { name: 'Klementiini piece', category: 'Fruits', unit: 'piece' },
  { name: 'Tumma Siemenetön Rypäle 500g', category: 'Fruits', unit: 'pack' },
  { name: 'Sitruuna piece', category: 'Fruits', unit: 'piece' },
  { name: 'Suippopaprika 200g', category: 'Vegetables', unit: 'pack' },
  { name: 'Vihreä Siemenetön Rypäle 500g', category: 'Fruits', unit: 'pack' },
  { name: 'Klementiini 15kg', category: 'Fruits', unit: 'pack' },
  { name: 'Persimon piece', category: 'Fruits', unit: 'piece' },
  { name: 'Appelsiini piece', category: 'Fruits', unit: 'piece' },
  { name: 'Päärynä Conference piece', category: 'Fruits', unit: 'piece' },
  { name: 'Porkkana 1kg', category: 'Vegetables', unit: 'pack' },
  { name: 'Sipuli piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Royal Gala Omena piece', category: 'Fruits', unit: 'piece' },
  { name: 'Syöntikypsä Avokado piece', category: 'Fruits', unit: 'piece' },
  { name: 'Punasipuli piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Omena Red Del piece', category: 'Fruits', unit: 'piece' },
  { name: 'Kurkku 300g', category: 'Vegetables', unit: 'pack' },
  { name: 'Maustekurkku piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Järvikylä Tilli Ruukku pack', category: 'Other', unit: 'pack' },
  { name: 'Porkkana 500g', category: 'Vegetables', unit: 'pack' },
  { name: 'Lime piece', category: 'Fruits', unit: 'piece' },
  { name: 'Annabelle Peruna 1kg', category: 'Vegetables', unit: 'pack' },
  { name: 'Jäävuorisalaatti piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Pensasmustikka 300g', category: 'Fruits', unit: 'pack' },
  { name: 'Kirsikkatomaatti 250g', category: 'Vegetables', unit: 'pack' },
  { name: 'Kiivi 500g', category: 'Fruits', unit: 'pack' },
  { name: 'Golden Delicious Omena piece', category: 'Fruits', unit: 'piece' },
  { name: 'Bataatti piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Omena Idared piece', category: 'Fruits', unit: 'piece' },
  { name: 'Paprika 300g 2 Kpl', category: 'Vegetables', unit: 'pack' },
  { name: 'Espanjalainen Parsakaali 400g', category: 'Vegetables', unit: 'pack' },
  { name: 'Inkivääri piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Pensasmustikka 125g', category: 'Fruits', unit: 'pack' },
  { name: 'Syöntikypsä Pikkuavokado 500g', category: 'Fruits', unit: 'pack' },
  { name: 'Kevätsipuli 100g', category: 'Vegetables', unit: 'pack' },
  { name: 'Paprika Punainen piece', category: 'Vegetables', unit: 'piece' },
  { name: 'Keltasipuli 350g', category: 'Vegetables', unit: 'pack' },
  { name: 'Klementtiini', category: 'Other', unit: 'kpl' },
  { name: 'Omena Red Delicious', category: 'Fruits', unit: 'kpl' },
  { name: 'Batatti', category: 'Other', unit: 'kpl' },
  { name: 'Porkkaana 2', category: 'Other', unit: 'kg' },
  { name: 'Veriappelsiini 1', category: 'Fruits', unit: 'kg' },
  { name: 'Mandariini Mandared', category: 'Fruits', unit: 'kpl' },
  { name: 'Tumma Siemenetön Viinirypäle 500g', category: 'Fruits', unit: '500g' },
  { name: 'Kevytmaito 1l', category: 'Dairy', unit: '1L' },
  { name: 'Laktoositon Kevytmaitojuoma 1l', category: 'Dairy', unit: '1L' },
  { name: 'Rasvaton Maito 1l', category: 'Dairy', unit: '1L' },
  { name: 'Täysmaito 1l', category: 'Dairy', unit: '1L' },
  { name: 'Laktoositon 3 Maitojuoma 1l Esl', category: 'Dairy', unit: '1L' },
  { name: 'Laktoositon 1l Rasvaton Maitojuoma', category: 'Dairy', unit: '1L' },
  { name: 'Oatly Ikaffe Kaurajuoma 1l', category: 'Dairy', unit: '1L' },
  { name: 'Elovena 1l Kaurajuoma Kahviin', category: 'Dairy', unit: '1L' },
  { name: 'Oddlygood Barista Kaurajuoma 1l Uht Gluteeniton', category: 'Dairy', unit: '1L' },
  { name: '1l Kaurajuoma Uht', category: 'Dairy', unit: '1L' },
  { name: 'Barista Kaurajuoma 1l', category: 'Dairy', unit: '1L' },
  { name: 'Paulig Juhla Mokka Kahvi Suodatinjauhatus 500g', category: 'Beverages', unit: '500g' },
  { name: 'Kulta Katriina Perinteinen Kahvi Suodatinjauhatus 500g', category: 'Beverages', unit: '500g' },
  { name: 'Snellman Kevyt Nautaherne Jauhis 75 400g', category: 'Other', unit: '400g' },
  { name: 'Atria Parempi Nauta Jauheliha 10 400g', category: 'Meat', unit: '400g' },
  { name: 'Sikanauta Jauheliha 23 400g', category: 'Meat', unit: '400g' },
  { name: 'Naudan Jauheliha 17 600g', category: 'Meat', unit: '600g' },
  { name: 'Kanan Jauheliha 4 400g', category: 'Meat', unit: '400g' },
  { name: 'Riimin Savumuikut 400g', category: 'Other', unit: '400g' },
  { name: 'Riimin Savulohi 400g', category: 'Fish', unit: '400g' },
  { name: 'Rummo Spaghetti No 3 1kg', category: 'Pantry', unit: '1kg' },
];

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
      const result = await sql`
        INSERT INTO stores (name)
        VALUES (${storeName})
        ON CONFLICT (name) DO UPDATE SET name = ${storeName}
        RETURNING id
      `;
      storeIds[storeName] = result.rows[0].id;
      console.log(`  ✓ ${storeName}`);
    }

    // Insert products
    console.log('\nCreating products...');
    const productIds = {};
    for (const product of products) {
      const result = await sql`
        INSERT INTO products (name, category, unit)
        VALUES (${product.name}, ${product.category}, ${product.unit})
        ON CONFLICT (name, category, unit) DO UPDATE
        SET name = ${product.name}
        RETURNING id
      `;
      const key = `${product.name}|${product.category}|${product.unit}`;
      productIds[key] = result.rows[0].id;
    }
    console.log(`  ✓ Created ${products.length} products`);

    // Insert real prices from scraped data
    console.log('\nInserting real prices from scraped data...');
    const priceData = [
  {
    "name": "Banaani piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.3
      },
      {
        "store": "K-Citymarket",
        "price": 0.4
      },
      {
        "store": "K-Citymarket",
        "price": 0.33
      },
      {
        "store": "S-Market",
        "price": 0.35
      }
    ]
  },
  {
    "name": "Kurkku piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.7
      },
      {
        "store": "K-Citymarket",
        "price": 1.75
      },
      {
        "store": "S-Market",
        "price": 1.23
      }
    ]
  },
  {
    "name": "Miniluumutomaatti 250g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.99
      },
      {
        "store": "S-Market",
        "price": 1.39
      }
    ]
  },
  {
    "name": "Tomaatti piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.27
      },
      {
        "store": "S-Market",
        "price": 0.46
      }
    ]
  },
  {
    "name": "Jääsalaatti 100g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.39
      },
      {
        "store": "S-Market",
        "price": 1.39
      }
    ]
  },
  {
    "name": "Klementiini piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.49
      },
      {
        "store": "K-Citymarket",
        "price": 0.16
      },
      {
        "store": "S-Market",
        "price": 0.33
      }
    ]
  },
  {
    "name": "Tumma Siemenetön Rypäle 500g",
    "category": "Fruits",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 3.69
      }
    ]
  },
  {
    "name": "Sitruuna piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.55
      },
      {
        "store": "S-Market",
        "price": 0.64
      },
      {
        "store": "S-Market",
        "price": 0.64
      }
    ]
  },
  {
    "name": "Suippopaprika 200g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.89
      }
    ]
  },
  {
    "name": "Vihreä Siemenetön Rypäle 500g",
    "category": "Fruits",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 3.69
      },
      {
        "store": "K-Citymarket",
        "price": 3.69
      }
    ]
  },
  {
    "name": "Klementiini 15kg",
    "category": "Fruits",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 3.69
      }
    ]
  },
  {
    "name": "Persimon piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.8
      },
      {
        "store": "S-Market",
        "price": 0.57
      }
    ]
  },
  {
    "name": "Appelsiini piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.56
      }
    ]
  },
  {
    "name": "Päärynä Conference piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.75
      }
    ]
  },
  {
    "name": "Porkkana 1kg",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.09
      }
    ]
  },
  {
    "name": "Sipuli piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.1
      }
    ]
  },
  {
    "name": "Royal Gala Omena piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.4
      }
    ]
  },
  {
    "name": "Syöntikypsä Avokado piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.6
      }
    ]
  },
  {
    "name": "Punasipuli piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.22
      }
    ]
  },
  {
    "name": "Omena Red Del piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.5
      }
    ]
  },
  {
    "name": "Kurkku 300g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.49
      }
    ]
  },
  {
    "name": "Maustekurkku piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.77
      }
    ]
  },
  {
    "name": "Järvikylä Tilli Ruukku pack",
    "category": "Other",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.79
      }
    ]
  },
  {
    "name": "Porkkana 500g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.89
      }
    ]
  },
  {
    "name": "Lime piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.31
      }
    ]
  },
  {
    "name": "Annabelle Peruna 1kg",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.29
      }
    ]
  },
  {
    "name": "Jäävuorisalaatti piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 2.09
      }
    ]
  },
  {
    "name": "Pensasmustikka 300g",
    "category": "Fruits",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 4.99
      }
    ]
  },
  {
    "name": "Kirsikkatomaatti 250g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.99
      },
      {
        "store": "K-Citymarket",
        "price": 1.39
      },
      {
        "store": "K-Citymarket",
        "price": 2.79
      }
    ]
  },
  {
    "name": "Kiivi 500g",
    "category": "Fruits",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.49
      }
    ]
  },
  {
    "name": "Golden Delicious Omena piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.42
      }
    ]
  },
  {
    "name": "Bataatti piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.9
      }
    ]
  },
  {
    "name": "Omena Idared piece",
    "category": "Fruits",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.2
      }
    ]
  },
  {
    "name": "Paprika 300g 2 Kpl",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 2.79
      }
    ]
  },
  {
    "name": "Espanjalainen Parsakaali 400g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.49
      }
    ]
  },
  {
    "name": "Inkivääri piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.89
      }
    ]
  },
  {
    "name": "Pensasmustikka 125g",
    "category": "Fruits",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 1.49
      }
    ]
  },
  {
    "name": "Syöntikypsä Pikkuavokado 500g",
    "category": "Fruits",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 3.49
      }
    ]
  },
  {
    "name": "Kevätsipuli 100g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 2.39
      }
    ]
  },
  {
    "name": "Paprika Punainen piece",
    "category": "Vegetables",
    "unit": "piece",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.75
      },
      {
        "store": "S-Market",
        "price": 1.3
      }
    ]
  },
  {
    "name": "Keltasipuli 350g",
    "category": "Vegetables",
    "unit": "pack",
    "prices": [
      {
        "store": "K-Citymarket",
        "price": 0.99
      }
    ]
  },
  {
    "name": "Klementtiini",
    "category": "Other",
    "unit": "kpl",
    "prices": [
      {
        "store": "S-Market",
        "price": 0.33
      }
    ]
  },
  {
    "name": "Omena Red Delicious",
    "category": "Fruits",
    "unit": "kpl",
    "prices": [
      {
        "store": "S-Market",
        "price": 0.71
      }
    ]
  },
  {
    "name": "Batatti",
    "category": "Other",
    "unit": "kpl",
    "prices": [
      {
        "store": "S-Market",
        "price": 0.47
      }
    ]
  },
  {
    "name": "Porkkaana 2",
    "category": "Other",
    "unit": "kg",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.69
      }
    ]
  },
  {
    "name": "Veriappelsiini 1",
    "category": "Fruits",
    "unit": "kg",
    "prices": [
      {
        "store": "S-Market",
        "price": 2.59
      }
    ]
  },
  {
    "name": "Mandariini Mandared",
    "category": "Fruits",
    "unit": "kpl",
    "prices": [
      {
        "store": "S-Market",
        "price": 0.47
      }
    ]
  },
  {
    "name": "Tumma Siemenetön Viinirypäle 500g",
    "category": "Fruits",
    "unit": "500g",
    "prices": [
      {
        "store": "S-Market",
        "price": 3.69
      }
    ]
  },
  {
    "name": "Kevytmaito 1l",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 0.95
      }
    ]
  },
  {
    "name": "Laktoositon Kevytmaitojuoma 1l",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.29
      }
    ]
  },
  {
    "name": "Rasvaton Maito 1l",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 0.85
      }
    ]
  },
  {
    "name": "Täysmaito 1l",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.39
      }
    ]
  },
  {
    "name": "Laktoositon 3 Maitojuoma 1l Esl",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.55
      }
    ]
  },
  {
    "name": "Laktoositon 1l Rasvaton Maitojuoma",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.29
      }
    ]
  },
  {
    "name": "Oatly Ikaffe Kaurajuoma 1l",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.95
      }
    ]
  },
  {
    "name": "Elovena 1l Kaurajuoma Kahviin",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.99
      }
    ]
  },
  {
    "name": "Oddlygood Barista Kaurajuoma 1l Uht Gluteeniton",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.89
      }
    ]
  },
  {
    "name": "1l Kaurajuoma Uht",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.19
      }
    ]
  },
  {
    "name": "Barista Kaurajuoma 1l",
    "category": "Dairy",
    "unit": "1L",
    "prices": [
      {
        "store": "S-Market",
        "price": 1.59
      }
    ]
  },
  {
    "name": "Paulig Juhla Mokka Kahvi Suodatinjauhatus 500g",
    "category": "Beverages",
    "unit": "500g",
    "prices": [
      {
        "store": "S-Market",
        "price": 9.35
      }
    ]
  },
  {
    "name": "Kulta Katriina Perinteinen Kahvi Suodatinjauhatus 500g",
    "category": "Beverages",
    "unit": "500g",
    "prices": [
      {
        "store": "S-Market",
        "price": 8.99
      }
    ]
  },
  {
    "name": "Snellman Kevyt Nautaherne Jauhis 75 400g",
    "category": "Other",
    "unit": "400g",
    "prices": [
      {
        "store": "S-Market",
        "price": 4.69
      }
    ]
  },
  {
    "name": "Atria Parempi Nauta Jauheliha 10 400g",
    "category": "Meat",
    "unit": "400g",
    "prices": [
      {
        "store": "S-Market",
        "price": 5.35
      }
    ]
  },
  {
    "name": "Sikanauta Jauheliha 23 400g",
    "category": "Meat",
    "unit": "400g",
    "prices": [
      {
        "store": "S-Market",
        "price": 2.6
      }
    ]
  },
  {
    "name": "Naudan Jauheliha 17 600g",
    "category": "Meat",
    "unit": "600g",
    "prices": [
      {
        "store": "S-Market",
        "price": 5.09
      }
    ]
  },
  {
    "name": "Kanan Jauheliha 4 400g",
    "category": "Meat",
    "unit": "400g",
    "prices": [
      {
        "store": "S-Market",
        "price": 2.99
      }
    ]
  },
  {
    "name": "Riimin Savumuikut 400g",
    "category": "Other",
    "unit": "400g",
    "prices": [
      {
        "store": "S-Market",
        "price": 9.25
      }
    ]
  },
  {
    "name": "Riimin Savulohi 400g",
    "category": "Fish",
    "unit": "400g",
    "prices": [
      {
        "store": "S-Market",
        "price": 8.95
      }
    ]
  },
  {
    "name": "Rummo Spaghetti No 3 1kg",
    "category": "Pantry",
    "unit": "1kg",
    "prices": [
      {
        "store": "S-Market",
        "price": 3.49
      }
    ]
  }
];

    let priceCount = 0;
    for (const item of priceData) {
      const key = `${item.name}|${item.category}|${item.unit}`;
      const productId = productIds[key];

      if (!productId) continue;

      for (const priceInfo of item.prices) {
        const storeId = storeIds[priceInfo.store];
        if (!storeId) continue;

        const priceCents = Math.round(priceInfo.price * 100);

        await sql`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (${productId}, ${storeId}, ${priceCents}, CURRENT_TIMESTAMP)
        `;

        priceCount++;
      }
    }

    console.log(`  ✓ Inserted ${priceCount} real prices`);

    // Add Prisma prices (same as S-Market)
    console.log('\nAdding Prisma prices (same chain as S-Market)...');
    for (const item of priceData) {
      const key = `${item.name}|${item.category}|${item.unit}`;
      const productId = productIds[key];

      if (!productId) continue;

      for (const priceInfo of item.prices) {
        if (priceInfo.store !== 'S-Market') continue;

        const storeId = storeIds['Prisma'];
        if (!storeId) continue;

        const priceCents = Math.round(priceInfo.price * 100);

        await sql`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (${productId}, ${storeId}, ${priceCents}, CURRENT_TIMESTAMP)
        `;
      }
    }

    // Add sample prices for stores without real data
    console.log('\nAdding sample prices for other stores...');
    const otherStores = stores.filter(s => s !== 'K-Citymarket' && s !== 'S-Market' && s !== 'Prisma');

    for (const item of priceData) {
      const key = `${item.name}|${item.category}|${item.unit}`;
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

        await sql`
          INSERT INTO prices (product_id, store_id, price_cents, recorded_at)
          VALUES (${productId}, ${storeId}, ${priceCents}, CURRENT_TIMESTAMP)
        `;
      }
    }

    console.log('  ✓ Added sample prices for other stores');

    console.log('\n✅ Seed completed successfully!');
    console.log(`   Products: ${products.length}`);
    console.log(`   Stores: ${stores.length}`);
    console.log(`   Real prices: ${priceCount}`);

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
