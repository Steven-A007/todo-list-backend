require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/connection');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ mensaje: 'Conexión exitosa', resultado: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});