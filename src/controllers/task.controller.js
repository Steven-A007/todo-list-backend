const pool = require('../db/connection');
const { decorateTask, decorateTaskList } = require('../decorators/task.decorator');

const TASK_SELECT_WITH_TAGS = `
  SELECT t.id, t.title, t.description, t.status, t.category_id, t.created_at,
         GROUP_CONCAT(CONCAT(tg.id, '::', tg.name)) AS tags
  FROM tasks t
  LEFT JOIN tags_task tt ON tt.task_id = t.id
  LEFT JOIN tags tg ON tg.id = tt.tag_id
`;

async function createTask(req, res) {
  const { title, description, category_id, status, tag_ids, user_id } = req.body;

  if (!title || !category_id || !user_id) {
    return res.status(400).json({ error: 'title, category_id y user_id son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO tasks (id, title, description, status, category_id, user_id) VALUES (UUID(), ?, ?, ?, ?, ?)',
      [title, description || null, status || 'Pendiente', category_id, user_id]
    );

    const [newTaskRows] = await conn.query(
      'SELECT id FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [user_id]
    );
    const taskId = newTaskRows[0].id;

    if (Array.isArray(tag_ids) && tag_ids.length > 0) {
      const values = tag_ids.map(tagId => [tagId, taskId]);
      await conn.query('INSERT INTO tags_task (tag_id, task_id) VALUES ?', [values]);
    }

    await conn.commit();

    const [rows] = await pool.query(`${TASK_SELECT_WITH_TAGS} WHERE t.id = ? GROUP BY t.id`, [taskId]);
    res.status(201).json(decorateTask(rows[0]));
  } catch (error) {
    await conn.rollback();
    console.error(error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'category_id, user_id o tag_ids inválidos' });
    }
    res.status(500).json({ error: 'Error al crear la tarea' });
  } finally {
    conn.release();
  }
}

async function listTasks(req, res) {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id es obligatorio' });
  }

  try {
    const [rows] = await pool.query(
      `${TASK_SELECT_WITH_TAGS} WHERE t.user_id = ? GROUP BY t.id ORDER BY t.created_at DESC`,
      [user_id]
    );
    res.json(decorateTaskList(rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar las tareas' });
  }
}

async function getTask(req, res) {
  const { id } = req.params;
  const { user_id } = req.query;

  try {
    const [rows] = await pool.query(
      `${TASK_SELECT_WITH_TAGS} WHERE t.id = ? AND t.user_id = ? GROUP BY t.id`,
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.json(decorateTask(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la tarea' });
  }
}

async function updateTask(req, res) {
  const { id } = req.params;
  const { title, description, category_id, status, tag_ids, user_id } = req.body;

  if (!title || !category_id || !user_id) {
    return res.status(400).json({ error: 'title, category_id y user_id son obligatorios' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'UPDATE tasks SET title = ?, description = ?, category_id = ?, status = ? WHERE id = ? AND user_id = ?',
      [title, description || null, category_id, status || 'Pendiente', id, user_id]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    if (Array.isArray(tag_ids)) {
      await conn.query('DELETE FROM tags_task WHERE task_id = ?', [id]);
      if (tag_ids.length > 0) {
        const values = tag_ids.map(tagId => [tagId, id]);
        await conn.query('INSERT INTO tags_task (tag_id, task_id) VALUES ?', [values]);
      }
    }

    await conn.commit();

    const [rows] = await pool.query(`${TASK_SELECT_WITH_TAGS} WHERE t.id = ? GROUP BY t.id`, [id]);
    res.json(decorateTask(rows[0]));
  } catch (error) {
    await conn.rollback();
    console.error(error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'category_id o tag_ids inválidos' });
    }
    res.status(500).json({ error: 'Error al actualizar la tarea' });
  } finally {
    conn.release();
  }
}

async function deleteTask(req, res) {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'user_id es obligatorio' });
  }

  try {
    const [result] = await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la tarea' });
  }
}

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask };