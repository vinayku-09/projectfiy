const db = require('../config/db');

// POST /projects/:project_id/tasks
exports.createTask = async (req, res) => {
  try {
    const { title } = req.body;
    const result = await db.execute(
      "INSERT INTO tasks (project_id, title, status) VALUES (?, ?, 'Pending')",
      [req.params.project_id, title]
    );
    res.status(201).json({ id: result.lastID, message: "Task added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /projects/:project_id/tasks
exports.getTasksByProject = async (req, res) => {
  try {
    const [tasks] = await db.execute("SELECT * FROM tasks WHERE project_id = ?", [req.params.project_id]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const { status } = req.body; // 'Pending' or 'Completed'
    await db.execute("UPDATE tasks SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    await db.execute("DELETE FROM tasks WHERE id = ?", [req.params.id]);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};