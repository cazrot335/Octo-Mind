const express = require('express');
const router = express.Router();
const schedulerController = require('../controllers/schedulerController');

// Generate smart daily schedule
router.post('/generate', schedulerController.generateSchedule);

// Get schedule history
router.get('/history', schedulerController.getScheduleHistory);

// Reschedule based on changes
router.post('/reschedule', schedulerController.reschedule);

// Get schedule suggestions
router.get('/suggestions', schedulerController.getScheduleSuggestions);

module.exports = router;
