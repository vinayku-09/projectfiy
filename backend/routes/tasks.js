const express = require('express');
const router = express.Router();
const db = require('../config/database');

const VALID_STATUSES = ['todo', 'in-progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const normalizeStatusForApi = (status = 'todo') => {
    const s = String(status).toLowerCase();
    if (s === 'pending') return 'todo';
    if (s === 'completed') return 'done';
    return VALID_STATUSES.includes(s) ? s : 'todo';
};

const normalizeStatusForDb = (status = 'todo') => {
    return normalizeStatusForApi(status);
};

const normalizePriority = (priority = 'medium') => {
    const p = String(priority).toLowerCase();
    return VALID_PRIORITIES.includes(p) ? p : 'medium';
};

// GET /projects/{project_id}/tasks - Fetch tasks for a specific project
router.get('/projects/:project_id/tasks', (req, res) => {
    const { project_id } = req.params;
    const { status } = req.query;
    if (!/^\d+$/.test(String(project_id))) {
        return res.status(400).json({ error: 'project_id must be a positive integer' });
    }
    if (status && !VALID_STATUSES.includes(String(status).toLowerCase())) {
        return res.status(400).json({ error: 'Invalid status filter' });
    }

    let sql = `SELECT * FROM tasks WHERE project_id = ?`;
    const params = [project_id];

    if (status) {
        sql += ` AND LOWER(status) IN (?, ?)`;
        const normalized = normalizeStatusForApi(status);
        if (normalized === 'done') {
            params.push('done', 'completed');
        } else if (normalized === 'in-progress') {
            params.push('in-progress', 'in-progress');
        } else {
            params.push('todo', 'pending');
        }
    }

    sql += ` ORDER BY due_date ASC, created_at DESC`;

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const normalizedRows = rows.map((task) => ({
            ...task,
            status: normalizeStatusForApi(task.status),
            priority: normalizePriority(task.priority),
        }));
        res.json(normalizedRows);
    });
});

// POST /projects/{project_id}/tasks - Add task to project
router.post('/projects/:project_id/tasks', (req, res) => {
    const { project_id } = req.params;
    const body = req.body || {};
    const { title, description, status, priority, due_date } = body;

    if (!/^\d+$/.test(String(project_id))) {
        return res.status(400).json({ error: 'project_id must be a positive integer' });
    }
    if (!title) {
        return res.status(400).json({ error: 'Task title is required' });
    }
    if (status !== undefined && !VALID_STATUSES.includes(String(status).toLowerCase())) {
        return res.status(400).json({ error: 'Invalid task status' });
    }
    if (priority !== undefined && !VALID_PRIORITIES.includes(String(priority).toLowerCase())) {
        return res.status(400).json({ error: 'Invalid task priority' });
    }
    if (due_date && !ISO_DATE_RE.test(String(due_date))) {
        return res.status(400).json({ error: 'due_date must be in YYYY-MM-DD format' });
    }

    const normalizedStatusApi = normalizeStatusForApi(status);
    const normalizedStatusDb = normalizeStatusForDb(status);
    const normalizedPriority = normalizePriority(priority);

    const sql = `INSERT INTO tasks (project_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?) RETURNING id`;
    const params = [
        project_id,
        title,
        description || null,
        normalizedStatusDb,
        normalizedPriority,
        due_date || null
    ];

    db.get(`SELECT id FROM projects WHERE id = ?`, [project_id], (projectErr, projectRow) => {
        if (projectErr) return res.status(500).json({ error: projectErr.message });
        if (!projectRow) return res.status(404).json({ error: `Project #${project_id} not found` });

        db.run(sql, params, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: this.lastID,
                project_id: Number(project_id),
                title,
                description: description || null,
                status: normalizedStatusApi,
                priority: normalizedPriority,
                due_date: due_date || null
            });
        });
    });
});

// PUT /tasks/{id} - Update task
router.put('/tasks/:id', (req, res) => {
    const body = req.body || {};
    const { status, title, description, priority, due_date } = body;
    if (!/^\d+$/.test(String(req.params.id))) {
        return res.status(400).json({ error: 'Task id must be a positive integer' });
    }

    const fields = [];
    const values = [];

    if (status !== undefined) {
        if (!VALID_STATUSES.includes(String(status).toLowerCase())) {
            return res.status(400).json({ error: 'Invalid task status' });
        }
        fields.push('status = ?');
        values.push(normalizeStatusForDb(status));
    }
    if (title !== undefined) {
        fields.push('title = ?');
        values.push(title);
    }
    if (description !== undefined) {
        fields.push('description = ?');
        values.push(description);
    }
    if (priority !== undefined) {
        if (!VALID_PRIORITIES.includes(String(priority).toLowerCase())) {
            return res.status(400).json({ error: 'Invalid task priority' });
        }
        fields.push('priority = ?');
        values.push(normalizePriority(priority));
    }
    if (due_date !== undefined) {
        if (due_date && !ISO_DATE_RE.test(String(due_date))) {
            return res.status(400).json({ error: 'due_date must be in YYYY-MM-DD format' });
        }
        fields.push('due_date = ?');
        values.push(due_date);
    }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update' });
    }

    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    values.push(req.params.id);

    db.run(sql, values, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: `Task #${req.params.id} not found` });
        res.json({ message: "Updated", changes: this.changes });
    });
});

// DELETE /tasks/{id} - Delete a task
router.delete('/tasks/:id', (req, res) => {
    if (!/^\d+$/.test(String(req.params.id))) {
        return res.status(400).json({ error: 'Task id must be a positive integer' });
    }
    db.run(`DELETE FROM tasks WHERE id = ?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) {
            return res.status(404).json({ error: `Task #${req.params.id} not found` });
        }
        res.json({ message: 'Task deleted', id: Number(req.params.id) });
    });
});

module.exports = router;