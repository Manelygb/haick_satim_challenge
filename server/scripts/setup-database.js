const { query, run } = require('../config/database');

async function setupDatabase() {
  try {
    // Users table
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        bank_id TEXT NOT NULL,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Transactions table
    await run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Feedback table
    await run(`
      CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        transaction_id INTEGER,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (transaction_id) REFERENCES transactions (id)
      )
    `);

    // Notifications table
    await run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Insert sample data
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Check if users already exist
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    if (existingUsers.rows[0].count === 0) {
      await run(`
        INSERT INTO users (email, password, name, bank_id, balance) VALUES
        (?, ?, ?, ?, ?)
      `, ['ahmed@email.com', hashedPassword, 'Ahmed Benali', 'BNA', 15000.00]);

      await run(`
        INSERT INTO users (email, password, name, bank_id, balance) VALUES
        (?, ?, ?, ?, ?)
      `, ['fatima@email.com', hashedPassword, 'Fatima Khelil', 'CCP', 8500.50]);

      // Sample transactions
      await run(`
        INSERT INTO transactions (user_id, type, amount, description) VALUES
        (1, 'withdrawal', -2000.00, 'ATM Withdrawal - Place 1er Mai')
      `);
      
      await run(`
        INSERT INTO transactions (user_id, type, amount, description) VALUES
        (1, 'payment', -150.00, 'Coffee Shop Payment')
      `);
      
      await run(`
        INSERT INTO transactions (user_id, type, amount, description) VALUES
        (1, 'deposit', 5000.00, 'Salary Deposit')
      `);
      
      await run(`
        INSERT INTO transactions (user_id, type, amount, description) VALUES
        (2, 'withdrawal', -1000.00, 'ATM Withdrawal - University')
      `);
      
      await run(`
        INSERT INTO transactions (user_id, type, amount, description) VALUES
        (2, 'payment', -75.00, 'Bus Card Recharge')
      `);
    }

    console.log('✅ SQLite database setup completed successfully!');
    console.log('📄 Database file: satim_banking.db');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
