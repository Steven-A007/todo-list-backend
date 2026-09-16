const pool = require('../db/connection');
const { decorateCategory, decorateCategoryList } = require('../decorators/category.decorator');

async function createCategory(req, res) {
  const { name } = req.body;
  const user_id = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'name es obligatorio' });
  }

  try {
    await pool.query(
      'INSERT INTO categories (id, name, user_id) VALUES (UUID(), ?, ?)',
      [name, user_id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM categories WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [user_id]
    );

    res.status(201).json(decorateCategory(rows[0]));
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
}

async function listCategories(req, res) {
  const user_id = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM categories WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    res.json(decorateCategoryList(rows));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar las categorías' });
  }
}

async function getCategory(req, res) {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM categories WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json(decorateCategory(rows[0]));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la categoría' });
  }
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name } = req.body;
  const user_id = req.user.id;

  if (!name) {
    return res.status(400).json({ error: 'name es obligatorio' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
      [name, id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const [rows] = await pool.query('SELECT id, name, created_at FROM categories WHERE id = ?', [id]);
    res.json(decorateCategory(rows[0]));
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error al actualizar la categoría' });
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({ error: 'No se puede eliminar: la categoría tiene tareas asociadas' });
    }
    res.status(500).json({ error: 'Error al eliminar la categoría' });
  }
}

module.exports = {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};