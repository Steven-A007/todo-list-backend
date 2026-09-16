const bcrypt = require('bcrypt');
const pool = require('../db/connection');

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES (UUID(), ?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ mensaje: 'Usuario creado correctamente' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
}

module.exports = { register };