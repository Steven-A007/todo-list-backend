const pool = require('../db/connection');
const { decorateTag, decorateTagList } = require('../decorators/tag.decorator');

async function createTag(req, res) {
  const { name } = req.body;
  const user_id = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'name es obligatorio' });
  }

  try {
    await pool.query(
      'INSERT INTO tags (id, name, user_id) VALUES (UUID(), ?, ?)',
      [name, user_id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM tags WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [user_id]
    );

    res.status(201).json(decorateTag(rows[0]));
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe una etiqueta con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear la etiqueta' });
  }
}

async function listTags(req, res) {
  const user_id = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM tags WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    res.json(decorateTagList(rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar las etiquetas' });
  }
}

async function getTag(req, res) {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM tags WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    res.json(decorateTag(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la etiqueta' });
  }
}

async function updateTag(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const user_id = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'name es obligatorio' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE tags SET name = ? WHERE id = ? AND user_id = ?',
      [name, id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    const [rows] = await pool.query('SELECT id, name, created_at FROM tags WHERE id = ?', [id]);
    res.json(decorateTag(rows[0]));
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe una etiqueta con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar la etiqueta' });
  }
}

async function deleteTag(req, res) {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM tags WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Etiqueta no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ error: 'No se puede eliminar: la etiqueta está asociada a tareas' });
    }
    res.status(500).json({ error: 'Error al eliminar la etiqueta' });
  }
}

module.exports = { createTag, listTags, getTag, updateTag, deleteTag };