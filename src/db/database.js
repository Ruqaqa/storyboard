const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'storyboard.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create parts table
const createPartsTable = `
  CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    image_path TEXT,
    movement_description TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.exec(createPartsTable);

// Create index on order_index for faster queries
db.exec('CREATE INDEX IF NOT EXISTS idx_order_index ON parts(order_index)');

// Prepared statements for better performance
const statements = {
  getAllParts: db.prepare('SELECT * FROM parts ORDER BY order_index ASC'),
  
  getPartById: db.prepare('SELECT * FROM parts WHERE id = ?'),
  
  createPart: db.prepare(`
    INSERT INTO parts (order_index, title, image_path, movement_description, content)
    VALUES (?, ?, ?, ?, ?)
  `),
  
  updatePart: db.prepare(`
    UPDATE parts
    SET title = ?, image_path = ?, movement_description = ?, content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  deletePart: db.prepare('DELETE FROM parts WHERE id = ?'),
  
  updateOrderIndex: db.prepare('UPDATE parts SET order_index = ? WHERE id = ?'),
  
  getMaxOrderIndex: db.prepare('SELECT MAX(order_index) as max_order FROM parts')
};

module.exports = {
  db,
  statements
};

