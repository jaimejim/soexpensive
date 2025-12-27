const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  try {
    // Check if POSTGRES_URL is set
    const hasUrl = !!process.env.POSTGRES_URL;

    if (!hasUrl) {
      return res.status(500).json({
        error: 'POSTGRES_URL not set',
        env: Object.keys(process.env).filter(k => k.includes('POSTGRES'))
      });
    }

    // Try a simple query
    const result = await sql`SELECT NOW() as time`;

    res.status(200).json({
      success: true,
      message: 'Database connected!',
      serverTime: result.rows[0].time,
      hasPostgresUrl: hasUrl,
      postgresUrlLength: process.env.POSTGRES_URL?.length || 0
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,
      hasPostgresUrl: !!process.env.POSTGRES_URL
    });
  }
};
