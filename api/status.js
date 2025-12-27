const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  const status = {
    api: 'ok',
    database: 'ok',
    products: 0,
    timestamp: new Date().toISOString()
  };

  try {
    // Check database connection
    const result = await sql`SELECT COUNT(*) as count FROM products`;
    status.products = parseInt(result.rows[0].count);

    // Check if we have any products
    if (status.products === 0) {
      status.database = 'empty';
    }
  } catch (error) {
    console.error('Database check failed:', error);
    status.database = error.message;
    status.api = 'degraded';
  }

  res.status(200).json(status);
};
