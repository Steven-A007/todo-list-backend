const express = require('express');
const router = express.Router();
const {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', createCategory);
router.get('/', listCategories);
router.get('/:id', getCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

module.exports = router;