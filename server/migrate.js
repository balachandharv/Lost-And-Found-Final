const { pool } = require('./db');

async function migrate() {
    try {
        console.log('🚀 Checking database schema...');
        
        // 1. Add missing columns to 'reports' table if they don't exist
        console.log('📋 Checking "reports" table...');
        const [reportCols] = await pool.query('DESCRIBE reports');
        const reportFields = reportCols.map(c => c.Field);
        
        if (!reportFields.includes('category')) {
            console.log('➕ Adding "category" column to reports...');
            await pool.query('ALTER TABLE reports ADD COLUMN category VARCHAR(100)');
        }

        if (!reportFields.includes('reporter_email')) {
            console.log('➕ Adding "reporter_email" column to reports...');
            await pool.query('ALTER TABLE reports ADD COLUMN reporter_email VARCHAR(100)');
        }

        // 2. Ensure notifications table exists and has correct columns
        console.log('📋 Ensuring "notifications" table exists...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                item_id VARCHAR(50),
                type VARCHAR(50),
                title VARCHAR(200),
                body TEXT,
                icon VARCHAR(200),
                click_action VARCHAR(200),
                is_read TINYINT DEFAULT 0,
                is_sent TINYINT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Ensure device_tokens exists
        console.log('📋 Ensuring "device_tokens" table exists...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS device_tokens (
                id VARCHAR(50) PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                token TEXT NOT NULL,
                device VARCHAR(100),
                browser VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_used DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

migrate();
