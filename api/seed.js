const db = require('../db');

// Finnish supermarket data
const stores = ['S-Market', 'Prisma', 'K-Citymarket', 'K-Supermarket', 'Lidl', 'Alepa'];

const products = [
  // Maito ja Munat (Milk & Eggs)
  { name: 'Maito 1L', category: 'Maito ja Munat', unit: '1L', priceRange: [1.19, 1.49] },
  { name: 'Maito rasvaton 1L', category: 'Maito ja Munat', unit: '1L', priceRange: [1.15, 1.45] },
  { name: 'Piimä 1L', category: 'Maito ja Munat', unit: '1L', priceRange: [1.29, 1.59] },
  { name: 'Kananmunat 10kpl', category: 'Maito ja Munat', unit: '10kpl', priceRange: [2.49, 3.19] },
  { name: 'Kananmunat 6kpl', category: 'Maito ja Munat', unit: '6kpl', priceRange: [1.69, 2.29] },
  { name: 'Kerma 2dl', category: 'Maito ja Munat', unit: '2dl', priceRange: [0.89, 1.29] },
  { name: 'Kerma 5dl', category: 'Maito ja Munat', unit: '5dl', priceRange: [1.99, 2.59] },
  { name: 'Jogurtti 150g', category: 'Maito ja Munat', unit: '150g', priceRange: [0.79, 1.09] },
  { name: 'Kreikkalainen jogurtti 150g', category: 'Maito ja Munat', unit: '150g', priceRange: [0.99, 1.39] },
  { name: 'Vanilja jogurtti 150g', category: 'Maito ja Munat', unit: '150g', priceRange: [0.85, 1.15] },
  { name: 'Mansikka jogurtti 150g', category: 'Maito ja Munat', unit: '150g', priceRange: [0.85, 1.15] },
  { name: 'Laktoositon maito 1L', category: 'Maito ja Munat', unit: '1L', priceRange: [1.39, 1.79] },
  { name: 'Kaurajuoma 1L', category: 'Maito ja Munat', unit: '1L', priceRange: [1.89, 2.49] },

  // Leipä (Bread)
  { name: 'Ruisleipä 500g', category: 'Leipä', unit: '500g', priceRange: [2.29, 2.89] },
  { name: 'Näkkileipä 250g', category: 'Leipä', unit: '250g', priceRange: [1.79, 2.29] },
  { name: 'Paahtoleipä 750g', category: 'Leipä', unit: '750g', priceRange: [1.99, 2.49] },
  { name: 'Sämpylät 6kpl', category: 'Leipä', unit: '6kpl', priceRange: [1.49, 1.99] },
  { name: 'Täysjyväpaahtoleipä 500g', category: 'Leipä', unit: '500g', priceRange: [2.29, 2.99] },
  { name: 'Ranskanleipä 1kpl', category: 'Leipä', unit: '1kpl', priceRange: [1.49, 1.99] },
  { name: 'Vaalea paahtoleipä 750g', category: 'Leipä', unit: '750g', priceRange: [1.79, 2.29] },
  { name: 'Siemennäkkileipä 200g', category: 'Leipä', unit: '200g', priceRange: [2.49, 3.19] },

  // Liha (Meat)
  { name: 'Jauheliha 400g', category: 'Liha', unit: '400g', priceRange: [3.99, 5.49] },
  { name: 'Sianjauheliha 400g', category: 'Liha', unit: '400g', priceRange: [3.49, 4.99] },
  { name: 'Broilerin fileesuikale 300g', category: 'Liha', unit: '300g', priceRange: [4.29, 5.99] },
  { name: 'Kanankoivet 800g', category: 'Liha', unit: '800g', priceRange: [5.49, 6.99] },
  { name: 'Broilerin rintafile 600g', category: 'Liha', unit: '600g', priceRange: [6.99, 8.49] },
  { name: 'Porsaan ulkofileepihvi 400g', category: 'Liha', unit: '400g', priceRange: [5.99, 7.49] },
  { name: 'Makkara 300g', category: 'Liha', unit: '300g', priceRange: [2.99, 3.99] },
  { name: 'Grillimakkara 400g', category: 'Liha', unit: '400g', priceRange: [3.49, 4.49] },
  { name: 'Meetvursti 200g', category: 'Liha', unit: '200g', priceRange: [2.49, 3.29] },
  { name: 'Kinkku 150g', category: 'Liha', unit: '150g', priceRange: [2.99, 3.99] },
  { name: 'Palvikinkku 150g', category: 'Liha', unit: '150g', priceRange: [2.49, 3.49] },
  { name: 'Pekoni 150g', category: 'Liha', unit: '150g', priceRange: [2.49, 3.29] },

  // Vihannekset (Vegetables)
  { name: 'Tomaatti 500g', category: 'Vihannekset', unit: '500g', priceRange: [2.29, 2.99] },
  { name: 'Kirsikkatomaatti 250g', category: 'Vihannekset', unit: '250g', priceRange: [2.49, 3.29] },
  { name: 'Kurkku 1kpl', category: 'Vihannekset', unit: '1kpl', priceRange: [0.99, 1.49] },
  { name: 'Porkkana 1kg', category: 'Vihannekset', unit: '1kg', priceRange: [1.49, 1.99] },
  { name: 'Sipuli 1kg', category: 'Vihannekset', unit: '1kg', priceRange: [1.29, 1.79] },
  { name: 'Paprika 1kpl', category: 'Vihannekset', unit: '1kpl', priceRange: [1.99, 2.49] },
  { name: 'Punasipuli 500g', category: 'Vihannekset', unit: '500g', priceRange: [1.49, 1.99] },
  { name: 'Salaatti 1kpl', category: 'Vihannekset', unit: '1kpl', priceRange: [1.29, 1.79] },
  { name: 'Jäävuorisalaatti 1kpl', category: 'Vihannekset', unit: '1kpl', priceRange: [1.49, 1.99] },
  { name: 'Peruna 2kg', category: 'Vihannekset', unit: '2kg', priceRange: [2.49, 3.29] },
  { name: 'Kesäkurpitsa 1kpl', category: 'Vihannekset', unit: '1kpl', priceRange: [1.79, 2.29] },
  { name: 'Parsakaali 500g', category: 'Vihannekset', unit: '500g', priceRange: [2.99, 3.79] },

  // Hedelmät (Fruits)
  { name: 'Banaani 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [1.79, 2.29] },
  { name: 'Omena 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [2.49, 2.99] },
  { name: 'Appelsiini 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [2.29, 2.79] },
  { name: 'Mansikka 250g', category: 'Hedelmät', unit: '250g', priceRange: [3.99, 4.99] },
  { name: 'Viinirypäle 500g', category: 'Hedelmät', unit: '500g', priceRange: [2.99, 3.99] },
  { name: 'Päärynä 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [2.69, 3.29] },
  { name: 'Klementiini 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [2.49, 3.29] },
  { name: 'Kiivi 1kg', category: 'Hedelmät', unit: '1kg', priceRange: [3.49, 4.49] },
  { name: 'Avokado 1kpl', category: 'Hedelmät', unit: '1kpl', priceRange: [1.49, 2.29] },
  { name: 'Sitruuna 1kpl', category: 'Hedelmät', unit: '1kpl', priceRange: [0.79, 1.29] },
  { name: 'Mustikka 150g', category: 'Hedelmät', unit: '150g', priceRange: [3.49, 4.49] },

  // Juusto (Cheese)
  { name: 'Edamjuusto 200g', category: 'Juusto', unit: '200g', priceRange: [2.49, 3.19] },
  { name: 'Emmental viipale 150g', category: 'Juusto', unit: '150g', priceRange: [2.29, 2.99] },
  { name: 'Tuorejuusto 200g', category: 'Juusto', unit: '200g', priceRange: [1.99, 2.49] },
  { name: 'Rahka 250g', category: 'Juusto', unit: '250g', priceRange: [1.49, 1.99] },
  { name: 'Cheddar viipale 150g', category: 'Juusto', unit: '150g', priceRange: [2.49, 3.29] },
  { name: 'Mozzarella 125g', category: 'Juusto', unit: '125g', priceRange: [1.99, 2.69] },
  { name: 'Raejuusto 200g', category: 'Juusto', unit: '200g', priceRange: [1.79, 2.49] },
  { name: 'Viipaloidut juustot 150g', category: 'Juusto', unit: '150g', priceRange: [2.29, 2.99] },

  // Kala (Fish)
  { name: 'Lohi 300g', category: 'Kala', unit: '300g', priceRange: [7.99, 9.99] },
  { name: 'Kirjolohi 400g', category: 'Kala', unit: '400g', priceRange: [6.99, 8.49] },
  { name: 'Tonnikala säilyke 150g', category: 'Kala', unit: '150g', priceRange: [1.99, 2.49] },
  { name: 'MSC Seiti 400g', category: 'Kala', unit: '400g', priceRange: [4.99, 6.49] },
  { name: 'Silakka 500g', category: 'Kala', unit: '500g', priceRange: [3.99, 5.49] },
  { name: 'Katkarapu 200g', category: 'Kala', unit: '200g', priceRange: [4.99, 6.49] },
  { name: 'Savulohi 100g', category: 'Kala', unit: '100g', priceRange: [3.99, 5.49] },

  // Pakasteet (Frozen)
  { name: 'Pakastepizza 350g', category: 'Pakasteet', unit: '350g', priceRange: [2.49, 3.49] },
  { name: 'Herneet 400g', category: 'Pakasteet', unit: '400g', priceRange: [1.49, 1.99] },
  { name: 'Ranskalaiset 750g', category: 'Pakasteet', unit: '750g', priceRange: [1.99, 2.79] },
  { name: 'Kalapuikot 250g', category: 'Pakasteet', unit: '250g', priceRange: [2.99, 3.99] },
  { name: 'Jäätelö 500ml', category: 'Pakasteet', unit: '500ml', priceRange: [2.99, 4.49] },
  { name: 'Sekavihannes 500g', category: 'Pakasteet', unit: '500g', priceRange: [1.79, 2.49] },
  { name: 'Kana nuggetit 300g', category: 'Pakasteet', unit: '300g', priceRange: [3.49, 4.49] },
  { name: 'Pinaatti 450g', category: 'Pakasteet', unit: '450g', priceRange: [1.99, 2.69] },

  // Juomat (Beverages)
  { name: 'Appelsiinimehu 1L', category: 'Juomat', unit: '1L', priceRange: [1.79, 2.29] },
  { name: 'Virvoitusjuoma 1.5L', category: 'Juomat', unit: '1.5L', priceRange: [1.29, 1.99] },
  { name: 'Kivennäisvesi 1.5L', category: 'Juomat', unit: '1.5L', priceRange: [0.79, 1.29] },
  { name: 'Omenamehu 1L', category: 'Juomat', unit: '1L', priceRange: [1.69, 2.19] },
  { name: 'Energiajuoma 0.5L', category: 'Juomat', unit: '0.5L', priceRange: [1.99, 2.49] },
  { name: 'Pepsi Max 1.5L', category: 'Juomat', unit: '1.5L', priceRange: [1.49, 2.19] },
  { name: 'Coca-Cola 1.5L', category: 'Juomat', unit: '1.5L', priceRange: [1.49, 2.19] },
  { name: 'Fanta 1.5L', category: 'Juomat', unit: '1.5L', priceRange: [1.49, 2.19] },
  { name: 'Sprite 1.5L', category: 'Juomat', unit: '1.5L', priceRange: [1.49, 2.19] },

  // Kahvi ja Tee (Coffee & Tea)
  { name: 'Kahvi 500g', category: 'Kahvi ja Tee', unit: '500g', priceRange: [4.99, 6.49] },
  { name: 'Espressopavut 500g', category: 'Kahvi ja Tee', unit: '500g', priceRange: [5.99, 7.99] },
  { name: 'Tee 20pss', category: 'Kahvi ja Tee', unit: '20pss', priceRange: [2.49, 3.29] },
  { name: 'Vihreä tee 20pss', category: 'Kahvi ja Tee', unit: '20pss', priceRange: [2.79, 3.49] },
  { name: 'Pikakahvi 100g', category: 'Kahvi ja Tee', unit: '100g', priceRange: [4.49, 5.99] },
  { name: 'Kaakaojauhe 250g', category: 'Kahvi ja Tee', unit: '250g', priceRange: [3.49, 4.49] },

  // Välipalat (Snacks)
  { name: 'Sipsit 200g', category: 'Välipalat', unit: '200g', priceRange: [2.49, 3.29] },
  { name: 'Suklaapatukka 100g', category: 'Välipalat', unit: '100g', priceRange: [1.99, 2.49] },
  { name: 'Pähkinät 200g', category: 'Välipalat', unit: '200g', priceRange: [3.49, 4.49] },
  { name: 'Keksit 200g', category: 'Välipalat', unit: '200g', priceRange: [1.99, 2.79] },
  { name: 'Makeispussi 280g', category: 'Välipalat', unit: '280g', priceRange: [2.99, 3.99] },
  { name: 'Popcorn 100g', category: 'Välipalat', unit: '100g', priceRange: [1.49, 2.29] },
  { name: 'Cashew pähkinät 150g', category: 'Välipalat', unit: '150g', priceRange: [4.49, 5.99] },
  { name: 'Suklaalevy 100g', category: 'Välipalat', unit: '100g', priceRange: [2.29, 3.29] },

  // Einekset (Ready meals)
  { name: 'Lasagne 400g', category: 'Einekset', unit: '400g', priceRange: [3.99, 4.99] },
  { name: 'Keitto 450g', category: 'Einekset', unit: '450g', priceRange: [2.49, 3.29] },
  { name: 'Ateria-annos 350g', category: 'Einekset', unit: '350g', priceRange: [3.49, 4.49] },
  { name: 'Pasta-ateria 300g', category: 'Einekset', unit: '300g', priceRange: [2.99, 3.99] },
  { name: 'Riisi-ateria 350g', category: 'Einekset', unit: '350g', priceRange: [3.29, 4.29] },
  { name: 'Kanakeitto 450g', category: 'Einekset', unit: '450g', priceRange: [2.69, 3.49] },

  // Mausteet (Spices)
  { name: 'Suola 600g', category: 'Mausteet', unit: '600g', priceRange: [0.79, 1.19] },
  { name: 'Pippuri 50g', category: 'Mausteet', unit: '50g', priceRange: [1.99, 2.49] },
  { name: 'Oregano 15g', category: 'Mausteet', unit: '15g', priceRange: [1.49, 1.99] },
  { name: 'Basilika 15g', category: 'Mausteet', unit: '15g', priceRange: [1.49, 1.99] },
  { name: 'Curry 50g', category: 'Mausteet', unit: '50g', priceRange: [1.99, 2.69] },
  { name: 'Kaneli 50g', category: 'Mausteet', unit: '50g', priceRange: [2.49, 3.29] },
  { name: 'Valkosipuli jauhe 60g', category: 'Mausteet', unit: '60g', priceRange: [1.79, 2.49] },

  // Hygienia (Hygiene)
  { name: 'Hammastahna 75ml', category: 'Hygienia', unit: '75ml', priceRange: [2.49, 3.49] },
  { name: 'Shampoo 250ml', category: 'Hygienia', unit: '250ml', priceRange: [2.99, 4.49] },
  { name: 'Saippua 100g', category: 'Hygienia', unit: '100g', priceRange: [1.49, 2.29] },
  { name: 'Deodorantti 50ml', category: 'Hygienia', unit: '50ml', priceRange: [2.99, 4.49] },
  { name: 'WC-paperi 8rll', category: 'Hygienia', unit: '8rll', priceRange: [3.99, 5.49] },
  { name: 'Talouspaperi 2rll', category: 'Hygienia', unit: '2rll', priceRange: [2.49, 3.49] },
  { name: 'Hoitoaine 250ml', category: 'Hygienia', unit: '250ml', priceRange: [2.99, 4.49] },
  { name: 'Suihkugeeli 250ml', category: 'Hygienia', unit: '250ml', priceRange: [2.49, 3.99] },

  // Peruselintarvikkeet (Staples)
  { name: 'Pasta 500g', category: 'Peruselintarvikkeet', unit: '500g', priceRange: [0.99, 1.49] },
  { name: 'Riisi 1kg', category: 'Peruselintarvikkeet', unit: '1kg', priceRange: [2.49, 3.29] },
  { name: 'Jauhot 2kg', category: 'Peruselintarvikkeet', unit: '2kg', priceRange: [1.99, 2.79] },
  { name: 'Sokeri 1kg', category: 'Peruselintarvikkeet', unit: '1kg', priceRange: [1.29, 1.79] },
  { name: 'Öljy 750ml', category: 'Peruselintarvikkeet', unit: '750ml', priceRange: [3.49, 4.99] },
  { name: 'Ketsuppi 500g', category: 'Peruselintarvikkeet', unit: '500g', priceRange: [2.29, 2.99] },
  { name: 'Majoneesi 400g', category: 'Peruselintarvikkeet', unit: '400g', priceRange: [2.49, 3.29] },
  { name: 'Sinappi 275g', category: 'Peruselintarvikkeet', unit: '275g', priceRange: [1.99, 2.69] }
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

    // Add products (deduplicate in case of conflicts)
    const productMap = new Map();
    for (const product of products) {
      const result = await db.addProduct(product.name, product.category, product.unit);
      const key = `${product.name}-${product.category}-${product.unit}`;

      // Only add if not already in map (prevents duplicates from ON CONFLICT)
      if (!productMap.has(key)) {
        productMap.set(key, {
          id: result.lastInsertRowid,
          priceRange: product.priceRange
        });
        results.products++;
      }
    }

    const productIds = Array.from(productMap.values());

    // Add current prices - using Promise.all for parallel inserts
    const pricePromises = [];
    for (const product of productIds) {
      for (const storeName of stores) {
        const priceEuros = generatePrice(product.priceRange[0], product.priceRange[1]);
        const priceCents = Math.round(parseFloat(priceEuros) * 100);
        pricePromises.push(
          db.sql`INSERT INTO prices (product_id, store_id, price_cents) VALUES (${product.id}, ${storeIds[storeName]}, ${priceCents})`
        );
        results.currentPrices++;
      }
    }

    // Execute all inserts in parallel (much faster than sequential)
    await Promise.all(pricePromises);

    results.historicalPrices = 0;

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
