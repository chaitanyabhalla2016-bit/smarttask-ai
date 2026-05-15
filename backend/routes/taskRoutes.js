const express = require('express');
const router = express.Router();
const{
    getTasks,
    createTasks,
    updateTask,
    deleteTask,
    toggleTaskStatus
} = require('../controllers/taskController');

router.get('/tasks',getTasks);
router.post('/tasks',createTasks);
// Delete backend route
router.delete('/tasks/:id',deleteTask);
// Update route
router.put('/tasks/:id',updateTask);
router.patch('/tasks/:id/toggle-status',toggleTaskStatus);

module.exports = router;