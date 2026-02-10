// Simple JSON file-based database (no native compilation required)
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

// Initialize database structure
const defaultData = {
  users: [],
  reports: [],
  otps: [],
  deviceTokens: [],
  notifications: []
};

// Load database from file
const loadDB = () => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading database:', error);
  }
  return { ...defaultData };
};

// Save database to file
const saveDB = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
};

// Initialize on first run
if (!fs.existsSync(dbPath)) {
  saveDB(defaultData);
  console.log('Database initialized at:', dbPath);
}

// Database operations
const db = {
  // Get all items from a collection
  getAll: (collection) => {
    const data = loadDB();
    return data[collection] || [];
  },

  // Get one item by field
  getOne: (collection, field, value) => {
    const data = loadDB();
    return (data[collection] || []).find(item => item[field] === value);
  },

  // Get one item by multiple fields
  getOneBy: (collection, criteria) => {
    const data = loadDB();
    return (data[collection] || []).find(item =>
      Object.keys(criteria).every(key => item[key] === criteria[key])
    );
  },

  // Insert item
  insert: (collection, item) => {
    const data = loadDB();
    if (!data[collection]) data[collection] = [];
    data[collection].push(item);
    saveDB(data);
    return item;
  },

  // Update item by field
  update: (collection, field, value, updates) => {
    const data = loadDB();
    const index = (data[collection] || []).findIndex(item => item[field] === value);
    if (index !== -1) {
      data[collection][index] = { ...data[collection][index], ...updates };
      saveDB(data);
      return data[collection][index];
    }
    return null;
  },

  // Delete item by field
  delete: (collection, field, value) => {
    const data = loadDB();
    const initialLength = (data[collection] || []).length;
    data[collection] = (data[collection] || []).filter(item => item[field] !== value);
    saveDB(data);
    return data[collection].length < initialLength;
  },

  // Custom query for OTPs (find valid unexpired OTP)
  findValidOTP: (email, code) => {
    const data = loadDB();
    const now = new Date().toISOString();
    return (data.otps || []).find(otp =>
      otp.email === email &&
      otp.code === code &&
      otp.used === 0 &&
      otp.expiresAt > now
    );
  },

  // Mark OTP as used
  markOTPUsed: (id) => {
    const data = loadDB();
    const index = (data.otps || []).findIndex(otp => otp.id === id);
    if (index !== -1) {
      data.otps[index].used = 1;
      saveDB(data);
    }
  }
};

console.log('JSON Database ready at:', dbPath);

module.exports = db;
