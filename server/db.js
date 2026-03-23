// MySQL Database Module for Lost & Found Backend
const mysql = require('mysql2/promise');

// MySQL connection config (matches your Spring Boot application.properties)
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'BALARAMA007@',
    database: 'lost_and_found_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// ============================================================
// Column name mapping: camelCase (Node.js) <-> snake_case (MySQL)
// Since Spring Boot created the tables with snake_case columns,
// we map them so the Node.js app can use the same camelCase keys.
// ============================================================

const columnMap = {
    // camelCase -> snake_case
    profileImage: 'profile_image',
    googleId: 'google_id',
    createdAt: 'created_at',
    reportedBy: 'reported_by',
    reporterEmail: 'reporter_email',
    reporterId: 'reporter_id',
    userId: 'user_id',
    itemId: 'item_id',
    clickAction: 'click_action',
    isRead: 'is_read',
    isSent: 'is_sent',
    lastUsed: 'last_used',
    expiresAt: 'expires_at',
};

// Reverse map: snake_case -> camelCase
const reverseColumnMap = {};
Object.keys(columnMap).forEach(k => { reverseColumnMap[columnMap[k]] = k; });

// Convert a JS object's keys from camelCase to snake_case for INSERT/UPDATE
function toSnakeCase(obj) {
    if (!obj) return obj;
    const result = {};
    Object.keys(obj).forEach(key => {
        const snakeKey = columnMap[key] || key;
        result[snakeKey] = obj[key];
    });
    return result;
}

// Convert a MySQL row's keys from snake_case to camelCase for the app
function toCamelCase(row) {
    if (!row) return row;
    const result = {};
    Object.keys(row).forEach(key => {
        const camelKey = reverseColumnMap[key] || key;
        result[camelKey] = row[key];
    });
    // Convert booleans
    if ('isRead' in result) result.isRead = !!result.isRead;
    if ('isSent' in result) result.isSent = !!result.isSent;
    return result;
}

// Convert a single field name from camelCase to snake_case
function toSnakeField(field) {
    return columnMap[field] || field;
}

// Initialize tables on startup (only creates tables that don't already exist)
const initDB = async () => {
    const connection = await pool.getConnection();
    try {
        await connection.query(`CREATE DATABASE IF NOT EXISTS lost_and_found_db`);
        await connection.query(`USE lost_and_found_db`);

        // Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255),
                role VARCHAR(20) DEFAULT 'Student',
                status VARCHAR(20) DEFAULT 'Active',
                phone VARCHAR(20),
                bio TEXT,
                profile_image TEXT,
                google_id VARCHAR(100),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Reports table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reports (
                id VARCHAR(50) PRIMARY KEY,
                item VARCHAR(200) NOT NULL,
                description TEXT,
                location VARCHAR(200),
                type VARCHAR(20),
                status VARCHAR(30) DEFAULT 'PendingApproval',
                date VARCHAR(50),
                image LONGTEXT,
                contact VARCHAR(100),
                category VARCHAR(100),
                reported_by VARCHAR(100),
                reporter_email VARCHAR(100),
                reporter_id VARCHAR(50),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // OTPs table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS otps (
                id VARCHAR(50) PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                code VARCHAR(10) NOT NULL,
                expires_at DATETIME NOT NULL,
                used TINYINT DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Device Tokens table
        await connection.query(`
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

        // Notifications table
        await connection.query(`
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
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_id (user_id),
                INDEX idx_is_read (is_read)
            )
        `);

        console.log('✅ MySQL Database initialized successfully!');
        console.log(`   Connected to: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    } catch (error) {
        console.error('❌ MySQL initialization error:', error.message);
        throw error;
    } finally {
        connection.release();
    }
};

// ============================================================
// Table name mapping (Spring Boot uses different table names)
// ============================================================
const tableMap = {
    deviceTokens: 'device_tokens'
};

function toTableName(table) {
    return tableMap[table] || table;
}

// ============================================================
// Database Operations (same API as the old JSON-based db.js)
// ============================================================

const db = {
    // Get all items from a table
    getAll: async (table) => {
        const [rows] = await pool.query(`SELECT * FROM ??`, [toTableName(table)]);
        return rows.map(row => toCamelCase(row));
    },

    // Get one item by field
    getOne: async (table, field, value) => {
        const [rows] = await pool.query(
            `SELECT * FROM ?? WHERE ?? = ? LIMIT 1`,
            [toTableName(table), toSnakeField(field), value]
        );
        return rows.length > 0 ? toCamelCase(rows[0]) : null;
    },

    // Get one item by multiple fields
    getOneBy: async (table, criteria) => {
        const keys = Object.keys(criteria);
        const conditions = keys.map(() => `?? = ?`).join(' AND ');
        const params = [toTableName(table)];
        keys.forEach(k => { params.push(toSnakeField(k), criteria[k]); });
        const [rows] = await pool.query(`SELECT * FROM ?? WHERE ${conditions} LIMIT 1`, params);
        return rows.length > 0 ? toCamelCase(rows[0]) : null;
    },

    // Insert item
    insert: async (table, item) => {
        const snakeItem = toSnakeCase(item);
        // Convert booleans to integers for MySQL
        Object.keys(snakeItem).forEach(key => {
            if (typeof snakeItem[key] === 'boolean') {
                snakeItem[key] = snakeItem[key] ? 1 : 0;
            }
        });
        await pool.query(`INSERT INTO ?? SET ?`, [toTableName(table), snakeItem]);
        return item;
    },

    // Update item by field
    update: async (table, field, value, updates) => {
        const snakeUpdates = toSnakeCase(updates);
        Object.keys(snakeUpdates).forEach(key => {
            if (typeof snakeUpdates[key] === 'boolean') {
                snakeUpdates[key] = snakeUpdates[key] ? 1 : 0;
            }
        });
        const [result] = await pool.query(
            `UPDATE ?? SET ? WHERE ?? = ?`,
            [toTableName(table), snakeUpdates, toSnakeField(field), value]
        );
        if (result.affectedRows > 0) {
            return await db.getOne(table, field, value);
        }
        return null;
    },

    // Delete item by field
    delete: async (table, field, value) => {
        const [result] = await pool.query(
            `DELETE FROM ?? WHERE ?? = ?`,
            [toTableName(table), toSnakeField(field), value]
        );
        return result.affectedRows > 0;
    },

    // Custom query for OTPs (find valid unexpired OTP)
    findValidOTP: async (email, code) => {
        const [rows] = await pool.query(
            `SELECT * FROM otps WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW() LIMIT 1`,
            [email, code]
        );
        return rows.length > 0 ? toCamelCase(rows[0]) : null;
    },

    // Mark OTP as used
    markOTPUsed: async (id) => {
        await pool.query(`UPDATE otps SET used = 1 WHERE id = ?`, [id]);
    }
};

// Export
module.exports = db;
module.exports.initDB = initDB;
module.exports.pool = pool;
