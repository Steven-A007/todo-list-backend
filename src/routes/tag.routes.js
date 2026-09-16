const express = require('express');
const router = express.Router();
const { createTag, listTags, getTag, updateTag, deleteTag } = require('../controllers/tag.controller');

router.post('/', createTag);
router.get('/', listTags);
router.get('/:id', getTag);
router.put('/:id', updateTag);
router.delete('/:id', deleteTag);

module.exports = router;