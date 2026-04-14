const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;

const initSqlite = () => {
  const dbPath = path.resolve(__dirname, '../projectify.sq3');
  const sqliteDb = new sqlite3.Database(dbPath);
  sqliteDb.serialize(() => {
    sqliteDb.run('PRAGMA foreign_keys = ON');
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      priority INTEGER DEFAULT 3,
      due_date TEXT,
      remaining_work TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    sqliteDb.run(`CREATE TABLE IF NOT EXISTS tasks (
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
    sqliteDb.run(`UPDATE tasks SET status = CASE
      WHEN LOWER(status)='pending' THEN 'todo'
      WHEN LOWER(status)='completed' THEN 'done'
      ELSE status END`);
  });
  console.log('Using local SQLite fallback (DATABASE_URL not set).');
  return sqliteDb;
};

if (!connectionString) {
  const sqliteDb = initSqlite();
  sqliteDb.execute = (sql, params = []) =>
    new Promise((resolve, reject) => {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        sqliteDb.all(sql, params, (err, rows) => (err ? reject(err) : resolve([rows])));
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, affectedRows: this.changes });
        });
      }
    });
  module.exports = sqliteDb;
} else {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const toPgSql = (sql) => {
    let index = 0;
    return sql.replace(/\?/g, () => `$${++index}`);
  };

  const db = {
    query(sql, params = []) {
      return pool.query(toPgSql(sql), params);
    },
    all(sql, params = [], callback) {
      this.query(sql, params).then((r) => callback(null, r.rows)).catch((e) => callback(e));
    },
    get(sql, params = [], callback) {
      this.query(sql, params).then((r) => callback(null, r.rows[0] || null)).catch((e) => callback(e));
    },
    run(sql, params = [], callback) {
      this.query(sql, params)
        .then((r) => callback?.call({ lastID: r.rows?.[0]?.id ?? null, changes: r.rowCount || 0 }, null))
        .catch((e) => callback?.call({ lastID: null, changes: 0 }, e));
    },
    execute(sql, params = []) {
      return this.query(sql, params).then((r) =>
        sql.trim().toUpperCase().startsWith('SELECT')
          ? [r.rows]
          : { lastID: r.rows?.[0]?.id ?? null, affectedRows: r.rowCount || 0 }
      );
    },
  };

  (async () => {
    await db.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      priority INTEGER DEFAULT 3,
      due_date DATE,
      remaining_work TEXT,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.query(`CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK(status IN ('todo', 'in-progress', 'done')) DEFAULT 'todo',
      priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
      due_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await db.query(`UPDATE tasks SET status = CASE
      WHEN LOWER(status)='pending' THEN 'todo'
      WHEN LOWER(status)='completed' THEN 'done'
      ELSE status END`);
    console.log('Connected to Neon PostgreSQL.');
  })().catch((err) => {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  });

  module.exports = db;
}