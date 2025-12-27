const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const results = {
      before: {},
      after: {},
      deleted: {}
    };

    // Check current state
    const productsBefore = await sql`SELECT COUNT(*) as count FROM products`;
    const pricesBefore = await sql`SELECT COUNT(*) as count FROM prices`;
    const storesBefore = await sql`SELECT COUNT(*) as count FROM stores`;

    results.before = {
      products: parseInt(productsBefore.rows[0].count),
      prices: parseInt(pricesBefore.rows[0].count),
      stores: parseInt(storesBefore.rows[0].count)
    };

    // Delete all data
    await sql`TRUNCATE TABLE prices CASCADE`;
    await sql`TRUNCATE TABLE products RESTART IDENTITY CASCADE`;
    await sql`TRUNCATE TABLE stores RESTART IDENTITY CASCADE`;

    // Check after cleanup
    const productsAfter = await sql`SELECT COUNT(*) as count FROM products`;
    const pricesAfter = await sql`SELECT COUNT(*) as count FROM prices`;
    const storesAfter = await sql`SELECT COUNT(*) as count FROM stores`;

    results.after = {
      products: parseInt(productsAfter.rows[0].count),
      prices: parseInt(pricesAfter.rows[0].count),
      stores: parseInt(storesAfter.rows[0].count)
    };

    results.deleted = {
      products: results.before.products - results.after.products,
      prices: results.before.prices - results.after.prices,
      stores: results.before.stores - results.after.stores
    };

    res.status(200).json({
      success: true,
      message: 'Database cleaned successfully. Please re-run seed.',
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
