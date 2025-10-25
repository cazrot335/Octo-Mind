const express = require('express');
const router = express.Router();
const wellnessController = require('../controllers/wellnessController');

// Goal management
router.post('/goals', wellnessController.createGoal);
router.get('/goals', wellnessController.getAllGoals);

// Goal completion
router.post('/complete/:goalId', wellnessController.completeGoal);
router.get('/completions', wellnessController.getCompletions);
router.get('/today', wellnessController.getTodayCompletions);

// Progress & Gamification
router.get('/progress', wellnessController.getProgress);
router.get('/badges', wellnessController.getBadges);
router.get('/insights', wellnessController.getInsights);

// Statistics
router.get('/stats/categories', wellnessController.getCategoryStats);

module.exports = router;
