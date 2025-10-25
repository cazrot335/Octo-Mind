const dashboardService = require('../services/dashboardService');
const { getFirestore } = require('../config/firebase');

const getDb = () => getFirestore();

/**
 * Get comprehensive dashboard overview
 */
const getDashboard = async (req, res) => {
  try {
    const userId = 'default_user'; // TODO: Add auth

    // Aggregate data from all modules
    const aggregatedData = await aggregateAllData(userId);

    // Generate insights dashboard
    const insights = await dashboardService.generateInsightsDashboard(aggregatedData);

    // Get smart reminders
    const completedToday = aggregatedData.todayTasks.filter(t => t.isCompleted).length;
    const reminders = await dashboardService.getSmartReminders(
      { 
        pendingTasks: aggregatedData.tasks.filter(t => !t.isCompleted),
        completedToday: completedToday
      },
      { todayLogs: aggregatedData.todayEmotions },
      { 
        todayCompletions: aggregatedData.todayWellness,
        progress: aggregatedData.wellnessProgress
      }
    );

    res.status(200).json({
      success: true,
      dashboard: {
        greeting: dashboardService.getGreeting(),
        date: new Date().toISOString().split('T')[0],
        insights: insights,
        reminders: reminders,
        quickStats: {
          tasksToday: aggregatedData.todayTasks.length,
          tasksCompleted: aggregatedData.todayTasks.filter(t => t.isCompleted).length,
          wellnessActivities: aggregatedData.todayWellness.length,
          currentMood: aggregatedData.currentMood,
          streakDays: aggregatedData.wellnessProgress?.stats?.wellnessStreak || 0
        }
      }
    });

  } catch (error) {
    console.error('Error getting dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard',
      details: error.message
    });
  }
};

/**
 * Get daily summary
 */
const getDailySummary = async (req, res) => {
  try {
    const userId = 'default_user';
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const aggregatedData = await aggregateAllData(userId, targetDate);
    
    // Count completions
    const completedTasks = aggregatedData.tasks.filter(t => {
      if (!t.completedAt) return false;
      const completedDate = new Date(t.completedAt).toISOString().split('T')[0];
      const targetDateStr = targetDate.toISOString().split('T')[0];
      return completedDate === targetDateStr;
    });

    const wellnessActivities = aggregatedData.todayWellness.filter(
      w => w.goal?.type === 'wellness'
    ).length;

    const sustainabilityActions = aggregatedData.todayWellness.filter(
      w => w.goal?.type === 'sustainability'
    ).length;

    // Generate summary text
    let summaryText = `You completed ${completedTasks.length} task(s) today`;
    
    if (completedTasks.length > 0) {
      const categories = [...new Set(completedTasks.map(t => t.category))];
      if (categories.length === 1) {
        summaryText += `, mostly ${categories[0]}-related`;
      } else {
        summaryText += `, across ${categories.length} categories`;
      }
    }

    summaryText += '. ';

    if (wellnessActivities === 0 && sustainabilityActions === 0) {
      summaryText += 'Try adding a wellness or sustainability habit tomorrow!';
    } else if (wellnessActivities > 0 && sustainabilityActions === 0) {
      summaryText += 'Great self-care! Consider an eco-friendly action tomorrow.';
    } else if (wellnessActivities === 0 && sustainabilityActions > 0) {
      summaryText += 'Nice eco-efforts! Don\'t forget personal wellness too.';
    } else {
      summaryText += 'Excellent balance of productivity, wellness, and sustainability!';
    }

    res.status(200).json({
      success: true,
      summary: {
        date: targetDate.toISOString().split('T')[0],
        text: summaryText,
        stats: {
          tasksCompleted: completedTasks.length,
          tasksPending: aggregatedData.tasks.filter(t => !t.isCompleted).length,
          wellnessActivities: wellnessActivities,
          sustainabilityActions: sustainabilityActions,
          emotionLogs: aggregatedData.todayEmotions.length,
          dominantMood: aggregatedData.currentMood
        },
        breakdown: {
          tasksByCategory: groupByCategory(completedTasks),
          topPriority: completedTasks.filter(t => (t.priority || 0) >= 8).length,
          pointsEarned: aggregatedData.todayWellness.reduce((sum, w) => sum + (w.pointsEarned || 0), 0)
        }
      }
    });

  } catch (error) {
    console.error('Error getting daily summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate summary',
      details: error.message
    });
  }
};

/**
 * Get smart reminders
 */
const getReminders = async (req, res) => {
  try {
    const userId = 'default_user';
    const aggregatedData = await aggregateAllData(userId);

    const completedToday = aggregatedData.todayTasks.filter(t => t.isCompleted).length;
    const reminders = await dashboardService.getSmartReminders(
      { 
        pendingTasks: aggregatedData.tasks.filter(t => !t.isCompleted),
        completedToday: completedToday
      },
      { todayLogs: aggregatedData.todayEmotions },
      {
        todayCompletions: aggregatedData.todayWellness,
        progress: aggregatedData.wellnessProgress
      }
    );

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders: reminders
    });

  } catch (error) {
    console.error('Error getting reminders:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reminders'
    });
  }
};

/**
 * Get focus insights (productivity analytics)
 */
const getFocusInsights = async (req, res) => {
  try {
    const userId = 'default_user';
    const { days = 7 } = req.query;

    const aggregatedData = await aggregateAllData(userId);
    const insights = await dashboardService.generateInsightsDashboard(aggregatedData);

    res.status(200).json({
      success: true,
      insights: {
        productivity: insights.productivity,
        peakHours: insights.productivity.peakProductivityHours,
        timeManagement: insights.timeManagement,
        recommendations: insights.recommendations.filter(r => r.category === 'productivity' || r.category === 'optimization')
      },
      period: `Last ${days} days`
    });

  } catch (error) {
    console.error('Error getting focus insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get focus insights'
    });
  }
};

/**
 * Get mood-task correlation
 */
const getMoodTaskCorrelation = async (req, res) => {
  try {
    const userId = 'default_user';
    const aggregatedData = await aggregateAllData(userId);
    const insights = await dashboardService.generateInsightsDashboard(aggregatedData);

    res.status(200).json({
      success: true,
      correlation: {
        dominant: insights.emotional.dominant,
        distribution: insights.emotional.distribution,
        patterns: insights.emotional.correlations,
        moodTrend: insights.emotional.moodTrend,
        recommendation: getMoodBasedRecommendation(insights.emotional.dominant)
      }
    });

  } catch (error) {
    console.error('Error getting mood correlation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze mood correlation'
    });
  }
};

/**
 * Get next day planning suggestions
 */
const getNextDayPlan = async (req, res) => {
  try {
    const userId = 'default_user';
    const aggregatedData = await aggregateAllData(userId);

    const suggestions = await dashboardService.generateNextDayPlan(aggregatedData);

    res.status(200).json({
      success: true,
      plan: {
        date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        suggestions: suggestions,
        message: 'Here are your top 3 priorities for tomorrow'
      }
    });

  } catch (error) {
    console.error('Error generating next day plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate plan'
    });
  }
};

/**
 * Get analytics overview
 */
const getAnalytics = async (req, res) => {
  try {
    const userId = 'default_user';
    const { period = '7d' } = req.query;

    const aggregatedData = await aggregateAllData(userId);
    const insights = await dashboardService.generateInsightsDashboard(aggregatedData);

    res.status(200).json({
      success: true,
      analytics: {
        period: period,
        productivity: insights.productivity,
        emotional: insights.emotional,
        wellness: insights.wellness,
        timeManagement: insights.timeManagement,
        trends: {
          taskCompletion: insights.productivity.trend,
          moodTrend: insights.emotional.moodTrend,
          wellnessEngagement: insights.wellness.status
        }
      }
    });

  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
};

// Helper functions

/**
 * Aggregate data from all modules
 */
async function aggregateAllData(userId, date = new Date()) {
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch all tasks
  const tasksSnapshot = await getDb().collection('tasks')
    .where('userId', '==', userId)
    .get();
  
  const tasks = [];
  tasksSnapshot.forEach(doc => {
    tasks.push({ id: doc.id, ...doc.data() });
  });

  // Fetch today's tasks
  const todayTasks = tasks.filter(t => {
    if (t.completedAt) {
      const completedDate = new Date(t.completedAt);
      return completedDate >= today && completedDate < tomorrow;
    }
    return !t.isCompleted; // Include pending tasks
  });

  // Fetch emotions
  const emotionsSnapshot = await getDb().collection('emotionLogs')
    .limit(50)
    .get();
  
  const emotions = [];
  emotionsSnapshot.forEach(doc => {
    emotions.push(doc.data());
  });

  // Sort emotions by timestamp
  emotions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const todayEmotions = emotions.filter(e => {
    const emotionDate = new Date(e.timestamp);
    return emotionDate >= today && emotionDate < tomorrow;
  });

  const currentMood = todayEmotions.length > 0 ? todayEmotions[0].emotion : 'neutral';

  // Fetch wellness data
  const wellnessSnapshot = await getDb().collection('goalCompletions')
    .where('userId', '==', userId)
    .limit(100)
    .get();
  
  const wellnessCompletions = [];
  wellnessSnapshot.forEach(doc => {
    wellnessCompletions.push(doc.data());
  });

  const todayWellness = wellnessCompletions.filter(w => {
    const completedDate = new Date(w.completedAt);
    return completedDate >= today && completedDate < tomorrow;
  });

  // Fetch wellness progress
  const progressDoc = await getDb().collection('userProgress')
    .doc(userId)
    .get();
  
  const wellnessProgress = progressDoc.exists ? progressDoc.data() : null;

  // Fetch latest schedule
  const scheduleSnapshot = await getDb().collection('schedules')
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();
  
  let schedule = null;
  if (!scheduleSnapshot.empty) {
    schedule = scheduleSnapshot.docs[0].data();
  }

  return {
    tasks: tasks,
    todayTasks: todayTasks,
    emotions: emotions,
    todayEmotions: todayEmotions,
    currentMood: currentMood,
    todayWellness: todayWellness,
    wellness: {
      completions: wellnessCompletions,
      progress: wellnessProgress
    },
    wellnessProgress: wellnessProgress,
    schedule: schedule
  };
}

function groupByCategory(items) {
  const grouped = {};
  items.forEach(item => {
    const cat = item.category || 'uncategorized';
    grouped[cat] = (grouped[cat] || 0) + 1;
  });
  return grouped;
}

function getMoodBasedRecommendation(mood) {
  const recommendations = {
    'stressed': 'Try meditation or a short walk to reduce stress',
    'tired': 'Consider taking a break or scheduling easier tasks',
    'energetic': 'Great time to tackle challenging tasks!',
    'happy': 'Maintain this mood with positive activities',
    'frustrated': 'Take small wins to build confidence',
    'neutral': 'Good baseline - stay consistent'
  };
  
  return recommendations[mood] || recommendations['neutral'];
}

module.exports = {
  getDashboard,
  getDailySummary,
  getReminders,
  getFocusInsights,
  getMoodTaskCorrelation,
  getNextDayPlan,
  getAnalytics
};
