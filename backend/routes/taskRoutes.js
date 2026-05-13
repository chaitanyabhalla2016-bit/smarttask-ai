const express = require('express');
const router = express.Router();
const{
    getTasks,
    createTasks,
    updateTask,
    deleteTask
} = require('../controllers/taskController');

router.get('/tasks',getTasks);
router.post('/tasks',createTasks);
// Delete backend route
router.delete('/tasks/:id',deleteTask);
// Update route
router.put('/tasks/:id',updateTask);

module.exports = router;