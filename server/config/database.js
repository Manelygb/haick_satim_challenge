const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in project directory
const dbPath = path.join(__dirname, '..', 'satim_banking.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// Promisify database operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve({ rows });
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ rows: [{ id: this.lastID }] });
    });
  });
};

module.exports = { query, run, db };
