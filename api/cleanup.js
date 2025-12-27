const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = {
      before: { products: 0, prices: 0, stores: 0 },
      after: { products: 0, prices: 0, stores: 0 },
      deleted: { products: 0, prices: 0, stores: 0 }
    };

    // Check current state (tables might not exist)
    try {
      const productsBefore = await sql`SELECT COUNT(*) as count FROM products`;
      const pricesBefore = await sql`SELECT COUNT(*) as count FROM prices`;
      const storesBefore = await sql`SELECT COUNT(*) as count FROM stores`;

      results.before = {
        products: parseInt(productsBefore.rows[0].count),
        prices: parseInt(pricesBefore.rows[0].count),
        stores: parseInt(storesBefore.rows[0].count)
      };
    } catch (error) {
      // Tables don't exist yet - that's fine
      console.log('Tables do not exist, skipping count');
    }

    // Drop tables completely to reset schema
    await sql`DROP TABLE IF EXISTS prices CASCADE`;
    await sql`DROP TABLE IF EXISTS products CASCADE`;
    await sql`DROP TABLE IF EXISTS stores CASCADE`;

    // Calculate what was deleted
    results.deleted = {
      products: results.before.products - 0,
      prices: results.before.prices - 0,
      stores: results.before.stores - 0
    };

    res.status(200).json({
      success: true,
      message: 'Database cleaned successfully. Tables dropped. Please re-run seed to recreate with new schema.',
      results
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
