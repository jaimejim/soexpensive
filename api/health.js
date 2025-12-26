const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  try {
    const hasPostgresUrl = !!process.env.POSTGRES_URL;
    let dbState = 'not_initialized';

    if (hasPostgresUrl) {
      try {
        // Simple query to check if database is accessible and has data
        const result = await sql`SELECT COUNT(*) as count FROM products`;
        const count = parseInt(result.rows[0].count);
        dbState = count > 0 ? 'initialized_with_data' : 'initialized_empty';
      } catch (error) {
        // If products table doesn't exist, database not initialized
        if (error.message.includes('does not exist')) {
          dbState = 'initialized_empty';
        } else {
          dbState = 'error: ' + error.message;
        }
      }
    }

    res.status(200).json({
      status: 'ok',
      database: {
        hasPostgresUrl,
        state: dbState
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
