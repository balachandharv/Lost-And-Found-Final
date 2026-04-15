const { pool } = require('./db');

(async () => {
  try {
    console.log('🔄 Deleting all reports from the database...');
    const [result] = await pool.query('DELETE FROM reports');
    console.log(`✅ Deleted ${result.affectedRows} report(s).`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to delete reports:', err);
    process.exit(1);
  }
})();
