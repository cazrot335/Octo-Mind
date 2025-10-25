const emotionService = require('../services/emotionService');
const { getFirestore } = require('../config/firebase');

const getDb = () => getFirestore();
const emotionLogsCollection = 'emotionLogs';

/**
 * Analyze emotion from text input
 */
const analyzeEmotion = async (req, res) => {
  try {
    const { text, context } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text input is required' });
    }

    // Analyze emotion
    const emotionResult = await emotionService.analyzeEmotion(text, context || {});
    
    // Generate personalized feedback
    const feedback = emotionService.generateFeedback(emotionResult, context || {});
    
    // Log emotion for history tracking (optional)
    const log = {
      text: text,
      emotion: emotionResult.emotion,
      confidence: emotionResult.confidence,
      timestamp: new Date().toISOString()
    };
    
    // Save to Firestore (non-blocking)
    getDb().collection(emotionLogsCollection).add(log).catch(err => {
      console.error('Failed to log emotion:', err);
    });

    res.status(200).json({
      success: true,
      emotion: emotionResult.emotion,
      confidence: emotionResult.confidence,
      reasoning: emotionResult.reasoning,
      suggestions: emotionResult.suggestions,
      feedback: feedback,
      aiUsed: emotionResult.aiUsed
    });

  } catch (error) {
    console.error('Error analyzing emotion:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to analyze emotion' 
    });
  }
};

/**
 * Get breathing exercise recommendation
 */
const getBreathingExercise = async (req, res) => {
  try {
    const { intensity } = req.query; // light, normal, intense
    
    const exercise = emotionService.getBreathingExercise(intensity || 'normal');
    
    res.status(200).json({
      success: true,
      exercise: exercise
    });

  } catch (error) {
    console.error('Error getting breathing exercise:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get breathing exercise' 
    });
  }
};

/**
 * Get emotion history/logs
 */
const getEmotionHistory = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const snapshot = await getDb()
      .collection(emotionLogsCollection)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calculate emotion trends
    const emotionCounts = {};
    logs.forEach(log => {
      emotionCounts[log.emotion] = (emotionCounts[log.emotion] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs: logs,
      trends: emotionCounts
    });

  } catch (error) {
    console.error('Error fetching emotion history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch emotion history' 
    });
  }
};

/**
 * Get quick mood check-in
 */
const quickMoodCheckIn = async (req, res) => {
  try {
    const { mood } = req.body; // quick mood: "good", "okay", "bad"

    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    let detectedEmotion = 'neutral';
    let message = '';

    switch (mood.toLowerCase()) {
      case 'good':
      case 'great':
        detectedEmotion = 'happy';
        message = 'Awesome! Keep that positive energy flowing! 🌟';
        break;
      case 'okay':
      case 'fine':
        detectedEmotion = 'neutral';
        message = 'Steady as she goes! You\'re doing well. 👍';
        break;
      case 'bad':
      case 'not good':
      case 'stressed':
        detectedEmotion = 'stressed';
        message = 'I\'m here to help. Let\'s make things better! 💪';
        break;
      case 'tired':
      case 'exhausted':
        detectedEmotion = 'tired';
        message = 'Rest is important. Take care of yourself! 😴';
        break;
      default:
        detectedEmotion = 'neutral';
        message = 'Thanks for checking in!';
    }

    const suggestions = emotionService.getSuggestionsForEmotion(detectedEmotion);

    res.status(200).json({
      success: true,
      emotion: detectedEmotion,
      message: message,
      suggestions: suggestions.slice(0, 2)
    });

  } catch (error) {
    console.error('Error in mood check-in:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process mood check-in' 
    });
  }
};

module.exports = {
  analyzeEmotion,
  getBreathingExercise,
  getEmotionHistory,
  quickMoodCheckIn
};
