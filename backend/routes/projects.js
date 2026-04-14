// backend/routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// ── Whitelist maps (prevent SQL injection) ──────────────────────────────────
const ALLOWED_SORT_BY    = { priority: 'priority', date: 'due_date', due_date: 'due_date', name: 'name', id: 'id' };
const ALLOWED_SORT_ORDER = { ASC: 'ASC', DESC: 'DESC' };
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// ── GET /projects ───────────────────────────────────────────────────────────
// Query params: page, limit, status, sortBy, sortOrder
router.get('/', (req, res) => {
    const rawPage = req.query.page;
    const rawLimit = req.query.limit;
    if ((rawPage !== undefined && !/^\d+$/.test(String(rawPage))) ||
        (rawLimit !== undefined && !/^\d+$/.test(String(rawLimit)))) {
        return res.status(400).json({ error: 'page and limit must be positive integers' });
    }

    const page      = Math.max(1, parseInt(rawPage)  || 1);
    const limit     = Math.max(1, parseInt(rawLimit) || 6);
    const offset    = (page - 1) * limit;
    const status    = req.query.status    || 'All';
    const sortBy    = ALLOWED_SORT_BY[req.query.sortBy]       || 'priority';
    const sortOrder = ALLOWED_SORT_ORDER[req.query.sortOrder] || 'DESC';

    // Build optional WHERE clause
    const useFilter   = status !== 'All';
    const whereClause = useFilter ? `WHERE status = ?` : ``;
    const filterParam = useFilter ? [status] : [];

    // 1. Paginated project rows
    const projectsSql = `
        SELECT * FROM projects
        ${whereClause}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT ? OFFSET ?
    `;

    // 2. Total count for pagination (same filter)
    const countSql = `SELECT COUNT(*) AS total FROM projects ${whereClause}`;

    // 3. Stats always from full table (so pie chart never lies)
    const statsSql = `
        SELECT
            SUM(CASE WHEN status = 'Active'    THEN 1 ELSE 0 END) AS active,
            SUM(CASE WHEN status = 'Pending'   THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN status = 'On Hold'   THEN 1 ELSE 0 END) AS onHold
        FROM projects
    `;

    // Run all three queries, then assemble the response
    db.all(projectsSql, [...filterParam, limit, offset], (err, projects) => {
        if (err) {
            console.error('Projects query error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        const projectIds = projects.map((p) => p.id);
        const attachAndRespond = (taskCountRows = [], total = 0) => {
            const taskCountMap = taskCountRows.reduce((acc, row) => {
                acc[row.project_id] = {
                    todo: row.todo || 0,
                    in_progress: row.in_progress || 0,
                    done: row.done || 0,
                };
                return acc;
            }, {});

            const projectsWithCounts = projects.map((project) => ({
                ...project,
                task_counts: taskCountMap[project.id] || { todo: 0, in_progress: 0, done: 0 }
            }));

            db.get(statsSql, [], (statsErr, stats) => {
                if (statsErr) {
                    console.error('Stats query error:', statsErr.message);
                    return res.status(500).json({ error: statsErr.message });
                }

                const pages = Math.ceil(total / limit);

                res.json({
                    projects: projectsWithCounts,
                    pagination: { page, pages, total },
                    stats: {
                        active:    stats.active    || 0,
                        pending:   stats.pending   || 0,
                        completed: stats.completed || 0,
                        onHold:    stats.onHold    || 0
                    }
                });
            });
        };

        db.get(countSql, filterParam, (err, countRow) => {
            if (err) {
                console.error('Count query error:', err.message);
                return res.status(500).json({ error: err.message });
            }

            if (projectIds.length === 0) {
                return attachAndRespond([], countRow.total);
            }

            const placeholders = projectIds.map(() => '?').join(',');
            const taskCountsSql = `
                SELECT
                    project_id,
                    SUM(CASE WHEN LOWER(status) IN ('todo', 'pending') THEN 1 ELSE 0 END) AS todo,
                    SUM(CASE WHEN LOWER(status) = 'in-progress' THEN 1 ELSE 0 END) AS in_progress,
                    SUM(CASE WHEN LOWER(status) IN ('done', 'completed') THEN 1 ELSE 0 END) AS done
                FROM tasks
                WHERE project_id IN (${placeholders})
                GROUP BY project_id
            `;

            db.all(taskCountsSql, projectIds, (taskErr, taskCountRows) => {
                if (taskErr) {
                    console.error('Task count query error:', taskErr.message);
                    return res.status(500).json({ error: taskErr.message });
                }
                attachAndRespond(taskCountRows, countRow.total);
            });
        });
    });
});

// ── GET /projects/:id ────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'Project id must be a positive integer' });
    }

    db.get(`SELECT * FROM projects WHERE id = ?`, [id], (err, project) => {
        if (err) {
            console.error('Project lookup error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!project) {
            return res.status(404).json({ error: `Project #${id} not found` });
        }

        db.get(
            `SELECT
                SUM(CASE WHEN LOWER(status) IN ('todo', 'pending') THEN 1 ELSE 0 END) AS todo,
                SUM(CASE WHEN LOWER(status) = 'in-progress' THEN 1 ELSE 0 END) AS in_progress,
                SUM(CASE WHEN LOWER(status) IN ('done', 'completed') THEN 1 ELSE 0 END) AS done
             FROM tasks
             WHERE project_id = ?`,
            [id],
            (taskErr, taskCounts) => {
                if (taskErr) {
                    console.error('Task count lookup error:', taskErr.message);
                    return res.status(500).json({ error: taskErr.message });
                }

                res.json({
                    ...project,
                    task_counts: {
                        todo: taskCounts?.todo || 0,
                        in_progress: taskCounts?.in_progress || 0,
                        done: taskCounts?.done || 0,
                    },
                });
            }
        );
    });
});

// ── POST /projects ──────────────────────────────────────────────────────────
router.post('/', (req, res) => {
    const body = req.body || {};
    const { name, description, priority, due_date, remaining_work, tasks } = body;

    if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'Name is required' });
    }
    if (due_date && !ISO_DATE_RE.test(String(due_date))) {
        return res.status(400).json({ error: 'due_date must be in YYYY-MM-DD format' });
    }

    const safePriority = Number.isInteger(Number(priority)) ? Number(priority) : 3;

    const sql = `
        INSERT INTO projects (name, description, priority, due_date, remaining_work, status)
        VALUES (?, ?, ?, ?, ?, 'Active')
        RETURNING id
    `;

    db.run(sql, [String(name).trim(), description || null, safePriority, due_date || null, remaining_work || null], function(err) {
        if (err) {
            console.error('Insert error:', err.message);
            return res.status(500).json({ error: err.message });
        }

        const projectId = this.lastID;
        const normalizedTasks = Array.isArray(tasks)
            ? tasks.filter((t) => t?.title).map((task) => ({
                title: task.title,
                description: task.description || null,
                status: ['todo', 'in-progress', 'done'].includes(String(task.status || '').toLowerCase())
                    ? String(task.status).toLowerCase()
                    : 'todo',
                priority: ['low', 'medium', 'high'].includes(String(task.priority || '').toLowerCase())
                    ? String(task.priority).toLowerCase()
                    : 'medium',
                due_date: task.due_date || null,
              }))
            : [];

        if (normalizedTasks.length === 0) {
            return res.status(201).json({
                id: projectId,
                name,
                description,
                priority,
                due_date: due_date || null,
                remaining_work: remaining_work || null,
                status: 'Active',
                created_tasks: 0
            });
        }

        const taskSql = `INSERT INTO tasks (project_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)`;
        let completed = 0;
        let failed = false;

        normalizedTasks.forEach((task) => {
            db.run(
                taskSql,
                [projectId, task.title, task.description, task.status, task.priority, task.due_date],
                (taskErr) => {
                  if (failed) return;
                  if (taskErr) {
                    failed = true;
                    console.error('Task insert error:', taskErr.message);
                    return res.status(500).json({ error: taskErr.message });
                  }
                  completed += 1;
                  if (completed === normalizedTasks.length) {
                    res.status(201).json({
                      id: projectId,
                      name,
                      description,
                      priority,
                      due_date: due_date || null,
                      remaining_work: remaining_work || null,
                      status: 'Active',
                      created_tasks: completed
                    });
                  }
                }
            );
        });
    });
});

// ── PUT /projects/:id ───────────────────────────────────────────────────────
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const body = req.body || {};
    const { status, remaining_work } = body;

    // Whitelist valid statuses
    const VALID_STATUSES = ['Active', 'Pending', 'Completed', 'On Hold'];
    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
    }

    // Build update dynamically — only set fields that were actually sent
    const fields  = [];
    const params  = [];

    if (status !== undefined)         { fields.push('status = ?');         params.push(status); }
    if (remaining_work !== undefined) { fields.push('remaining_work = ?'); params.push(remaining_work); }

    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, params, function(err) {
        if (err) {
            console.error('Update error:', err.message);
            return res.status(500).json({ error: 'Database update failed' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: `Project #${id} not found` });
        }
        res.json({ message: 'Update successful', id: parseInt(id), status, remaining_work });
    });
});

// ── DELETE /projects/:id ────────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM projects WHERE id = ?`, [id], function(err) {
        if (err) {
            console.error('Delete error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: `Project #${id} not found` });
        }
        res.json({ message: 'Project deleted', id: parseInt(id) });
    });
});

module.exports = router;