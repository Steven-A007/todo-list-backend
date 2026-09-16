const express = require('express');
const router = express.Router();
const { createTag, listTags, getTag, updateTag, deleteTag } = require('../controllers/tag.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', createTag);
router.get('/', listTags);
router.get('/:id', getTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

module.exports = router;