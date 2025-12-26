const db = require('../db');

// Finnish supermarket data
const stores = ['S-Market', 'Prisma', 'K-Citymarket', 'K-Supermarket', 'Lidl', 'Alepa'];

const products = [
  // Maito ja Munat (Milk & Eggs)
  { name: 'Maito 1L', category: 'Maito ja Munat', unit: '1L', priceRange: [1.19, 1.49] },
  { name: 'Piimä 1L', category: 'Maito ja Munat', unit: '1L', priceRange: [1.29, 1.59] },
  { name: 'Kananmunat 10kpl', category: 'Maito ja Munat', unit: '10kpl', priceRange: [2.49, 3.19] },
  { name: 'Kerma 2dl', category: 'Maito ja Munat', unit: '2dl', priceRange: [0.89, 1.29] },
  { name: 'Jogurtti 150g', category: 'Maito ja Munat', unit: '150g', priceRange: [0.79, 1.09] },

  // Leipä (Bread)
  { name: 'Ruisleipä 500g', category: 'Leipä', unit: '500g', priceRange: [2.29, 2.89] },
  { name: 'Näkkileipä 250g', category: 'Leipä', unit: '250g', priceRange: [1.79, 2.29] },
  { name: 'Paahtoleipä 750g', category: 'Leipä', unit: '750g', priceRange: [1.99, 2.49] },
  { name: 'Sämpylät 6kpl', category: 'Leipä', unit: '6kpl', priceRange: [1.49, 1.99] },

  // Liha (Meat)
  { name: 'Jauheliha 400g', category: 'Liha', unit: '400g', priceRange: [3.99, 5.49] },
  { name: 'Broilerin fileesuikale 300g', category: 'Liha', unit: '300g', priceRange: [4.29, 5.99] },
  { name: 'Kanankoivet 800g', category: 'Liha', unit: '800g', priceRange: [5.49, 6.99] },
  { name: 'Porsaan ulkofileepihvi 400g', category: 'Liha', unit: '400g', priceRange: [5.99, 7.49] },
  { name: 'Makkara 300g', category: 'Liha', unit: '300g', priceRange: [2.99, 3.99] },
  { name: 'Meetvursti 200g', category: 'Liha', unit: '200g', priceRange: [2.49, 3.29] },

  // Vihannekset (Vegetables)
  { name: 'Tomaatti 500g', category: 'Vihannekset', unit: '500g', priceRange: [2.29, 2.99] },
  { name: 'Kurkku 1kpl', category: 'Vihannekset', unit: '1kpl', priceRange: [0.99, 1.49] },
  { name: 'Porkkana 1kg', category: 'Vihannekset', unit: '1kg', priceRange: [1.49, 1.99] },
  { name: 'Sipuli 1kg', category: 'Vihannekset', unit: '1kg', priceRange: [1.29, 1.79] },
  { name: 'Paprika 1kpl', category: 'Vihannekset', unit: '1kpl', priceRange: [1.99, 2.49] },

  // Hedelmät (Fruits)
  { name: 'Banaani 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [1.79, 2.29] },
  { name: 'Omena 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [2.49, 2.99] },
  { name: 'Appelsiini 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [2.29, 2.79] },
  { name: 'Mansikka 250g', category: 'Hedelmät', unit: '250g', priceRange: [3.99, 4.99] },
  { name: 'Viinirypäle 500g', category: 'Hedelmät', unit: '500g', priceRange: [2.99, 3.99] },

  // Juusto (Cheese)
  { name: 'Edamjuusto 200g', category: 'Juusto', unit: '200g', priceRange: [2.49, 3.19] },
  { name: 'Emmental viipale 150g', category: 'Juusto', unit: '150g', priceRange: [2.29, 2.99] },
  { name: 'Tuorejuusto 200g', category: 'Juusto', unit: '200g', priceRange: [1.99, 2.49] },
  { name: 'Rahka 250g', category: 'Juusto', unit: '250g', priceRange: [1.49, 1.99] },

  // Kala (Fish)
  { name: 'Lohi 300g', category: 'Kala', unit: '300g', priceRange: [7.99, 9.99] },
  { name: 'Kirjolohi 400g', category: 'Kala', unit: '400g', priceRange: [6.99, 8.49] },
  { name: 'Tonnikala säilyke 150g', category: 'Kala', unit: '150g', priceRange: [1.99, 2.49] },
  { name: 'MSC Seiti 400g', category: 'Kala', unit: '400g', priceRange: [4.99, 6.49] },

  // Pakasteet (Frozen)
  { name: 'Pakastepizza 350g', category: 'Pakasteet', unit: '350g', priceRange: [2.49, 3.49] },
  { name: 'Herneet 400g', category: 'Pakasteet', unit: '400g', priceRange: [1.49, 1.99] },
  { name: 'Ranskalaiset 750g', category: 'Pakasteet', unit: '750g', priceRange: [1.99, 2.79] },
  { name: 'Kalapuikot 250g', category: 'Pakasteet', unit: '250g', priceRange: [2.99, 3.99] },
  { name: 'Jäätelö 500ml', category: 'Pakasteet', unit: '500ml', priceRange: [2.99, 4.49] },

  // Juomat (Beverages)
  { name: 'Appelsiinimehu 1L', category: 'Juomat', unit: '1L', priceRange: [1.79, 2.29] },
  { name: 'Virvoitusjuoma 1.5L', category: 'Juomat', unit: '1.5L', priceRange: [1.29, 1.99] },
  { name: 'Kivennäisvesi 1.5L', category: 'Juomat', unit: '1.5L', priceRange: [0.79, 1.29] },
  { name: 'Omenamehu 1L', category: 'Juomat', unit: '1L', priceRange: [1.69, 2.19] },
  { name: 'Energiajuoma 0.5L', category: 'Juomat', unit: '0.5L', priceRange: [1.99, 2.49] },

  // Kahvi ja Tee (Coffee & Tea)
  { name: 'Kahvi 500g', category: 'Kahvi ja Tee', unit: '500g', priceRange: [4.99, 6.49] },
  { name: 'Espressopavut 500g', category: 'Kahvi ja Tee', unit: '500g', priceRange: [5.99, 7.99] },
  { name: 'Tee 20pss', category: 'Kahvi ja Tee', unit: '20pss', priceRange: [2.49, 3.29] },
  { name: 'Vihreä tee 20pss', category: 'Kahvi ja Tee', unit: '20pss', priceRange: [2.79, 3.49] },
  { name: 'Pikakahvi 100g', category: 'Kahvi ja Tee', unit: '100g', priceRange: [4.49, 5.99] },

  // Välipalat (Snacks)
  { name: 'Sipsit 200g', category: 'Välipalat', unit: '200g', priceRange: [2.49, 3.29] },
  { name: 'Suklaapatukka 100g', category: 'Välipalat', unit: '100g', priceRange: [1.99, 2.49] },
  { name: 'Pähkinät 200g', category: 'Välipalat', unit: '200g', priceRange: [3.49, 4.49] },
  { name: 'Keksit 200g', category: 'Välipalat', unit: '200g', priceRange: [1.99, 2.79] },
  { name: 'Makeispussi 280g', category: 'Välipalat', unit: '280g', priceRange: [2.99, 3.99] },

  // Einekset (Ready meals)
  { name: 'Lasagne 400g', category: 'Einekset', unit: '400g', priceRange: [3.99, 4.99] },
  { name: 'Keitto 450g', category: 'Einekset', unit: '450g', priceRange: [2.49, 3.29] },
  { name: 'Ateria-annos 350g', category: 'Einekset', unit: '350g', priceRange: [3.49, 4.49] },
  { name: 'Pasta-ateria 300g', category: 'Einekset', unit: '300g', priceRange: [2.99, 3.99] },
  { name: 'Riisi-ateria 350g', category: 'Einekset', unit: '350g', priceRange: [3.29, 4.29] },

  // Mausteet (Spices)
  { name: 'Suola 600g', category: 'Mausteet', unit: '600g', priceRange: [0.79, 1.19] },
  { name: 'Pippuri 50g', category: 'Mausteet', unit: '50g', priceRange: [1.99, 2.49] },
  { name: 'Oregano 15g', category: 'Mausteet', unit: '15g', priceRange: [1.49, 1.99] },
  { name: 'Basilika 15g', category: 'Mausteet', unit: '15g', priceRange: [1.49, 1.99] },

  // Hygienia (Hygiene)
  { name: 'Hammastahna 75ml', category: 'Hygienia', unit: '75ml', priceRange: [2.49, 3.49] },
  { name: 'Shampoo 250ml', category: 'Hygienia', unit: '250ml', priceRange: [2.99, 4.49] },
  { name: 'Saippua 100g', category: 'Hygienia', unit: '100g', priceRange: [1.49, 2.29] },
  { name: 'Deodorantti 50ml', category: 'Hygienia', unit: '50ml', priceRange: [2.99, 4.49] },
  { name: 'WC-paperi 8rll', category: 'Hygienia', unit: '8rll', priceRange: [3.99, 5.49] }
];

function generatePrice(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

module.exports = async (req, res) => {
  try {
    const results = {
      stores: 0,
      products: 0,
      currentPrices: 0,
      historicalPrices: 0
    };

    // Initialize database
    await db.initDatabase();

    // Add stores
    const storeIds = {};
    for (const storeName of stores) {
      const id = await db.addStore(storeName);
      storeIds[storeName] = id;
      results.stores++;
    }

    // Add products
    const productIds = [];
    for (const product of products) {
      const result = await db.addProduct(product.name, product.category, product.unit);
      productIds.push({
        id: result.lastInsertRowid,
        priceRange: product.priceRange
      });
      results.products++;
    }

    // Add current prices
    for (const product of productIds) {
      for (const storeName of stores) {
        const price = generatePrice(product.priceRange[0], product.priceRange[1]);
        await db.addPrice(product.id, storeIds[storeName], price);
        results.currentPrices++;
      }
    }

    // Add historical prices (6 months)
    for (let daysAgo = 1; daysAgo <= 180; daysAgo++) {
      for (const product of productIds) {
        for (const storeName of stores) {
          const price = generatePrice(product.priceRange[0], product.priceRange[1]);

          // Insert with historical timestamp
          const timestamp = new Date();
          timestamp.setDate(timestamp.getDate() - daysAgo);

          await db.sql`
            INSERT INTO prices (product_id, store_id, price, recorded_at)
            VALUES (${product.id}, ${storeIds[storeName]}, ${price}, ${timestamp.toISOString()})
          `;
          results.historicalPrices++;
        }
      }
    }

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      results
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
