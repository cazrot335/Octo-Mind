const schedulerService = require('../services/schedulerService');
const { getFirestore } = require('../config/firebase');

const getDb = () => getFirestore();
const tasksCollection = 'tasks';
const schedulesCollection = 'schedules';

/**
 * Generate smart daily schedule
 * Automatically fetches pending tasks and recent mood
 */
const generateSchedule = async (req, res) => {
  try {
    const { preferences } = req.body;

    // 1. Fetch all pending tasks
    const tasksSnapshot = await getDb().collection(tasksCollection)
      .where('isCompleted', '==', false)
      .get();
    
    const tasks = [];
    tasksSnapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (tasks.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending tasks to schedule',
        schedule: [],
        stats: schedulerService.getEmptyStats()
      });
    }

    // 2. Fetch most recent mood from emotion logs (default to 'neutral' if none found)
    let userMood = 'neutral';
    let moodSource = 'default (neutral)';
    
    try {
      const emotionSnapshot = await getDb().collection('emotionLogs')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (!emotionSnapshot.empty) {
        const latestEmotion = emotionSnapshot.docs[0].data();
        userMood = latestEmotion.emotion || 'neutral';
        moodSource = 'auto-detected from logs';
        console.log(`📊 Using recent mood: ${userMood}`);
      } else {
        console.log('ℹ️ No emotion logs found, using default mood: neutral');
      }
    } catch (emotionError) {
      console.warn('Could not fetch emotion logs:', emotionError.message);
      console.log('ℹ️ Using default mood: neutral');
    }

    // 3. Generate schedule
    const scheduleResult = await schedulerService.generateSchedule(
      tasks,
      userMood,
      preferences || {}
    );

    // 4. Save schedule to database
    const scheduleDoc = {
      mood: userMood,
      workHours: scheduleResult.workHours,
      totalSlots: scheduleResult.schedule.length,
      stats: scheduleResult.stats,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    await getDb().collection(schedulesCollection).add(scheduleDoc).catch(err => {
      console.error('Failed to save schedule:', err);
    });

    res.status(200).json({
      ...scheduleResult,
      moodSource: moodSource
    });

  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate schedule',
      details: error.message 
    });
  }
};

/**
 * Get schedule history
 */
const getScheduleHistory = async (req, res) => {
  try {
    const { limit = 7 } = req.query;

    const snapshot = await getDb()
      .collection(schedulesCollection)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();
    
    const schedules = [];
    snapshot.forEach(doc => {
      schedules.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules: schedules
    });

  } catch (error) {
    console.error('Error fetching schedule history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch schedule history' 
    });
  }
};

/**
 * Update schedule (reschedule based on new mood or tasks)
 * Automatically fetches recent mood if not provided
 */
const reschedule = async (req, res) => {
  try {
    const { mood, taskId, action } = req.body;

    // Handle specific actions
    if (action === 'remove' && taskId) {
      // Mark task as done and regenerate schedule
      await getDb().collection(tasksCollection).doc(taskId).update({
        isCompleted: true,
        completedAt: new Date().toISOString()
      });
    }

    // Fetch updated tasks
    const snapshot = await getDb().collection(tasksCollection)
      .where('isCompleted', '==', false)
      .get();
    
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Use provided mood or fetch recent mood
    let userMood = mood || 'neutral';
    if (!mood) {
      try {
        const emotionSnapshot = await getDb().collection('emotionLogs')
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();
        
        if (!emotionSnapshot.empty) {
          userMood = emotionSnapshot.docs[0].data().emotion || 'neutral';
        }
      } catch (error) {
        console.warn('Could not fetch emotion logs:', error.message);
      }
    }

    const scheduleResult = await schedulerService.generateSchedule(
      tasks,
      userMood,
      req.body.preferences || {}
    );

    res.status(200).json({
      ...scheduleResult,
      message: 'Schedule updated successfully'
    });

  } catch (error) {
    console.error('Error rescheduling:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to reschedule' 
    });
  }
};

/**
 * Get schedule suggestions based on current state
 */
const getScheduleSuggestions = async (req, res) => {
  try {
    const { mood } = req.query;

    if (!mood) {
      return res.status(400).json({ 
        success: false,
        error: 'Mood parameter is required' 
      });
    }

    const suggestions = {
      mood: mood,
      workSchedule: {},
      breakPattern: {},
      taskOrdering: ''
    };

    switch (mood.toLowerCase()) {
      case 'tired':
        suggestions.workSchedule = {
          suggestion: 'Shorten your work day',
          recommended: '9:00 AM - 4:00 PM (7 hours)',
          reason: 'Give yourself extra rest time'
        };
        suggestions.breakPattern = {
          frequency: 'Every 60 minutes',
          duration: '15 minutes',
          reason: 'More frequent, longer breaks to combat fatigue'
        };
        suggestions.taskOrdering = 'Easy tasks first, save complex work for when you feel better';
        break;

      case 'energetic':
        suggestions.workSchedule = {
          suggestion: 'Maximize your productive hours',
          recommended: '8:00 AM - 6:00 PM (10 hours)',
          reason: 'Capitalize on high energy levels'
        };
        suggestions.breakPattern = {
          frequency: 'Every 120 minutes',
          duration: '10 minutes',
          reason: 'Short breaks to maintain momentum'
        };
        suggestions.taskOrdering = 'Hardest tasks first while energy is peak';
        break;

      case 'stressed':
        suggestions.workSchedule = {
          suggestion: 'Balanced work day with buffer time',
          recommended: '9:00 AM - 5:00 PM (8 hours)',
          reason: 'Leave room for unexpected issues'
        };
        suggestions.breakPattern = {
          frequency: 'Every 90 minutes',
          duration: '10 minutes + breathing exercise',
          reason: 'Regular breaks with stress relief'
        };
        suggestions.taskOrdering = 'Quick wins first to build confidence and reduce overwhelm';
        break;

      default:
        suggestions.workSchedule = {
          suggestion: 'Standard work day',
          recommended: '9:00 AM - 6:00 PM (9 hours)',
          reason: 'Balanced schedule for steady productivity'
        };
        suggestions.breakPattern = {
          frequency: 'Every 90 minutes',
          duration: '10 minutes',
          reason: 'Standard break pattern for focus'
        };
        suggestions.taskOrdering = 'Priority order - tackle important tasks first';
    }

    res.status(200).json({
      success: true,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get suggestions' 
    });
  }
};

module.exports = {
  generateSchedule,
  getScheduleHistory,
  reschedule,
  getScheduleSuggestions
};
