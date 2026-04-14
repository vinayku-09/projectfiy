const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../projectify.sq3');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(' Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // CRITICAL: Enable Foreign Key support for ON DELETE CASCADE
    db.run("PRAGMA foreign_keys = ON");
    
    initializeTables();
  }
});

function initializeTables() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. Projects Table (Now linked to user_id)
    db.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER, 
      name TEXT NOT NULL,
      description TEXT,
      priority INTEGER DEFAULT 3,
      due_date TEXT,
      remaining_work TEXT, 
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // 3. Tasks Table (full task schema)
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )`);

    // 4. MIGRATIONS (Adding user_id to projects if it doesn't exist)
    db.run(`ALTER TABLE projects ADD COLUMN user_id INTEGER`, (err) => {
       if (!err) console.log(' Migration: Added user_id to projects.');
    });

    db.run(`ALTER TABLE projects ADD COLUMN remaining_work TEXT`, (err) => {
      if (!err) console.log(' Migration: Added remaining_work to projects.');
    });

    db.run(`ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'Active'`, (err) => {
      if (!err) console.log(' Migration: Added status to projects.');
    });

    // 5. MIGRATIONS for tasks table columns (safe for existing DBs)
    db.run(`ALTER TABLE tasks ADD COLUMN description TEXT`, (err) => {
      if (!err) console.log(' Migration: Added description to tasks.');
    });

    db.run(`ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'`, (err) => {
      if (!err) console.log(' Migration: Added priority to tasks.');
    });

    db.run(`ALTER TABLE tasks ADD COLUMN due_date TEXT`, (err) => {
      if (!err) console.log(' Migration: Added due_date to tasks.');
    });

    // 6. Rebuild legacy tasks table (Pending/Completed schema) to new status model
    db.get(
      `SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'tasks'`,
      (err, row) => {
        if (err || !row?.sql) return;

        const isLegacyStatusSchema =
          row.sql.includes(`CHECK(status IN ('Pending', 'Completed'))`);

        if (!isLegacyStatusSchema) {
          db.run(
            `UPDATE tasks
             SET status = CASE
               WHEN LOWER(status) = 'pending' THEN 'todo'
               WHEN LOWER(status) = 'completed' THEN 'done'
               ELSE status
             END`,
            (normalizeErr) => {
              if (!normalizeErr) console.log(' Migration: Normalized task status values.');
            }
          );
          return;
        }

        db.run(`ALTER TABLE tasks RENAME TO tasks_legacy`);
        db.run(`CREATE TABLE tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT CHECK(status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
          priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
          due_date TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`);
        db.run(`INSERT INTO tasks (id, project_id, title, description, status, priority, due_date, created_at)
          SELECT
            id,
            project_id,
            title,
            COALESCE(description, ''),
            CASE
              WHEN LOWER(status) = 'completed' THEN 'done'
              WHEN LOWER(status) = 'pending' THEN 'todo'
              WHEN LOWER(status) = 'in-progress' THEN 'in-progress'
              WHEN LOWER(status) = 'done' THEN 'done'
              ELSE 'todo'
            END,
            CASE
              WHEN LOWER(priority) = 'low' THEN 'low'
              WHEN LOWER(priority) = 'high' THEN 'high'
              ELSE 'medium'
            END,
            due_date,
            created_at
          FROM tasks_legacy`);
        db.run(`DROP TABLE tasks_legacy`, (dropErr) => {
          if (!dropErr) console.log(' Migration: Rebuilt tasks table to new schema.');
        });
      }
    );
  });
}

// Helper function to use async/await with SQLite (Cleaner for controllers)
db.execute = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (sql.trim().toUpperCase().startsWith("SELECT")) {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve([rows]); // Wrapped in array to match MySQL style [rows]
      });
    } else {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, affectedRows: this.changes });
      });
    }
  });
};

module.exports = db;