const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Main dashboard
router.get('/', dashboardController.getDashboard);

// Daily summary
router.get('/summary', dashboardController.getDailySummary);

// Smart reminders
router.get('/reminders', dashboardController.getReminders);

// Focus insights (productivity analytics)
router.get('/focus-insights', dashboardController.getFocusInsights);

// Mood-task correlation
router.get('/mood-correlation', dashboardController.getMoodTaskCorrelation);

// Next day planning
router.get('/next-day-plan', dashboardController.getNextDayPlan);

// Analytics overview
router.get('/analytics', dashboardController.getAnalytics);

module.exports = router;
