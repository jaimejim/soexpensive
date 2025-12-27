const { sql } = require('@vercel/postgres');

module.exports = async (req, res) => {
  try {
    // Test creating a simple table and inserting
    await sql`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Try inserting
    const result = await sql`
      INSERT INTO test_table (name)
      VALUES ('test')
      RETURNING id, name, created_at
    `;

    // Count rows
    const count = await sql`SELECT COUNT(*) as total FROM test_table`;

    // Clean up
    await sql`DROP TABLE test_table`;

    res.status(200).json({
      success: true,
      message: 'Database INSERT works!',
      inserted: result.rows[0],
      totalTests: count.rows[0].total
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
  }
};
