const db = require('../config/db');

// GET /projects
exports.getProjects = async (req, res) => {
  try {
    const { page = 1, limit = 6, status = 'All', sortBy = 'priority', sortOrder = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const allowedSort = { priority: 'priority', date: 'due_date', name: 'name', id: 'id' };
    const safeSortBy = allowedSort[sortBy] || 'priority';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = status !== 'All' ? 'WHERE status = ?' : '';
    const params = status !== 'All' ? [status] : [];

    // 1. Fetch Projects
    const [projects] = await db.execute(
      `SELECT * FROM projects ${whereClause} ORDER BY ${safeSortBy} ${safeOrder} LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // 2. Fetch Total for Pagination
    const [countRows] = await db.execute(`SELECT COUNT(*) as total FROM projects ${whereClause}`, params);
    
    // 3. Fetch Global Stats (SQLite friendly SUM CASE)
    const [stats] = await db.execute(`
      SELECT 
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'On Hold' THEN 1 ELSE 0 END) as onHold
      FROM projects
    `);

    res.json({
      projects,
      pagination: { page: parseInt(page), pages: Math.ceil(countRows[0].total / limit), total: countRows[0].total },
      stats: stats[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM projects WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Project not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /projects
exports.createProject = async (req, res) => {
  try {
    const { name, description, priority, due_date } = req.body;
    const result = await db.execute(
      "INSERT INTO projects (name, description, priority, due_date, status) VALUES (?, ?, ?, ?, 'Active')",
      [name, description, priority || 3, due_date]
    );
    res.status(201).json({ id: result.lastID, message: "Project created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /projects/:id (Update Status/Description)
exports.updateProject = async (req, res) => {
  try {
    const { status, remaining_work } = req.body;
    await db.execute(
      "UPDATE projects SET status = ?, remaining_work = ? WHERE id = ?",
      [status, remaining_work, req.params.id]
    );
    res.json({ message: "Update successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const result = await db.execute("DELETE FROM projects WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};