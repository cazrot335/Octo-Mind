const express = require('express');
const router = express.Router();
const emotionController = require('../controllers/emotionController');

// Analyze emotion from text
router.post('/analyze', emotionController.analyzeEmotion);

// Quick mood check-in
router.post('/check-in', emotionController.quickMoodCheckIn);

// Get breathing exercise
router.get('/breathing-exercise', emotionController.getBreathingExercise);

// Get emotion history
router.get('/history', emotionController.getEmotionHistory);

module.exports = router;
