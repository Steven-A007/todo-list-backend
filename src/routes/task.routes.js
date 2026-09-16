const express = require('express');
const router = express.Router();
const { createTask, listTasks, getTask, updateTask, deleteTask } = require('../controllers/task.controller');

router.post('/', createTask);
router.get('/', listTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;