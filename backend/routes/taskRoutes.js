const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Create a new task
router.post('/', taskController.createTask);

// Get all tasks
router.get('/', taskController.getAllTasks);

// Get pending tasks only
router.get('/pending', taskController.getPendingTasks);

// Get completed tasks only
router.get('/completed', taskController.getCompletedTasks);

// Get a single task by ID
router.get('/:id', taskController.getTaskById);

// Update a task
router.put('/:id', taskController.updateTask);

// Delete a task
router.delete('/:id', taskController.deleteTask);

// Mark task as done/undone
router.patch('/:id/done', taskController.markTaskDone);
router.patch('/:id/undone', taskController.markTaskUndone);

// AI Prioritization endpoint
router.post('/prioritize', taskController.prioritizeTasks);

module.exports = router;
