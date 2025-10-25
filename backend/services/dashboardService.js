/**
 * Dashboard Service
 * Aggregates insights from all modules for AI-driven control center
 */

const emotionService = require('./emotionService');
const schedulerService = require('./schedulerService');
const wellnessService = require('./wellnessService');

class DashboardService {
  constructor() {
    this.peakHours = [9, 10, 11, 12, 13]; // Default peak productivity hours
  }

  /**
   * Generate comprehensive daily summary
   */
  async generateDailySummary(userId, date = new Date()) {
    const dateStr = date.toISOString().split('T')[0];
    
    return {
      date: dateStr,
      greeting: this.getGreeting(),
      summary: {
        tasksCompleted: 0,
        wellnessActivities: 0,
        sustainabilityActions: 0,
        emotionalState: 'neutral',
        productivityScore: 0
      },
      highlights: [],
      recommendations: []
    };
  }

  /**
   * Get smart reminders based on context
   */
  async getSmartReminders(taskData, emotionData, wellnessData, currentTime = new Date()) {
    const reminders = [];
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    // Morning reminder (6 AM - 11 AM)
    if (hour >= 6 && hour < 11) {
      const completedToday = taskData.completedToday || 0;
      const pendingToday = taskData.pendingTasks?.length || 0;
      
      if (pendingToday > 0 && completedToday === 0) {
        reminders.push({
          id: 'morning-start',
          type: 'greeting',
          priority: 'high',
          icon: '☀️',
          title: 'Good morning! Time to plan your day',
          message: `You have ${pendingToday} task(s) waiting. Let's get started!`,
          action: 'view-schedule',
          time: currentTime.toISOString()
        });
      }
    }

    // Break reminder (if working for a while)
    const breakCompletions = wellnessData.todayCompletions?.filter(
      c => c.goal?.category === 'breaks'
    ) || [];
    
    if (breakCompletions.length === 0 && hour >= 10 && hour <= 20) {
      reminders.push({
        id: 'break-reminder',
        type: 'wellness',
        priority: 'medium',
        icon: '☕',
        title: 'Time for a break!',
        message: 'You\'ve been working hard. Take a 5-minute break to recharge.',
        action: 'log-break',
        time: currentTime.toISOString()
      });
    }

    // Pending high-priority tasks (anytime during work hours)
    const highPriorityPending = taskData.pendingTasks?.filter(
      t => (t.priority || 0) >= 8
    ) || [];
    
    if (highPriorityPending.length > 0 && hour >= 8 && hour <= 20) {
      reminders.push({
        id: 'high-priority-task',
        type: 'task',
        priority: 'high',
        icon: '⚡',
        title: `${highPriorityPending.length} high-priority task(s) pending`,
        message: `Focus on: ${highPriorityPending[0].name}`,
        action: 'view-task',
        taskId: highPriorityPending[0].id,
        time: currentTime.toISOString()
      });
    }

    // Due date approaching (anytime)
    const dueSoon = taskData.pendingTasks?.filter(t => {
      if (!t.dueDate) return false;
      const dueDate = new Date(t.dueDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return dueDate <= tomorrow && dueDate >= new Date();
    }) || [];

    if (dueSoon.length > 0) {
      reminders.push({
        id: 'due-soon',
        type: 'deadline',
        priority: 'high',
        icon: '⏰',
        title: 'Task due soon!',
        message: `"${dueSoon[0].name}" is due ${this.getRelativeTime(dueSoon[0].dueDate)}`,
        action: 'view-task',
        taskId: dueSoon[0].id,
        time: currentTime.toISOString()
      });
    }

    // Mood check-in (if no emotion logged today, after 10 AM)
    const todayEmotions = emotionData.todayLogs || [];
    if (todayEmotions.length === 0 && hour >= 10 && hour <= 20) {
      reminders.push({
        id: 'mood-checkin',
        type: 'emotion',
        priority: 'low',
        icon: '😊',
        title: 'How are you feeling?',
        message: 'Quick mood check-in to optimize your schedule',
        action: 'log-emotion',
        time: currentTime.toISOString()
      });
    }

    // Wellness streak reminder (afternoon/evening)
    const wellnessStreak = wellnessData.progress?.stats?.wellnessStreak || 0;
    const todayWellnessCount = wellnessData.todayCompletions?.length || 0;
    
    if (wellnessStreak >= 3 && todayWellnessCount === 0 && hour >= 14 && hour <= 21) {
      reminders.push({
        id: 'streak-maintain',
        type: 'wellness',
        priority: 'medium',
        icon: '🔥',
        title: `Don't break your ${wellnessStreak}-day streak!`,
        message: 'Complete at least one wellness goal today',
        action: 'view-wellness',
        time: currentTime.toISOString()
      });
    }

    // End of day summary (evening, 5 PM - 9 PM)
    if (hour >= 17 && hour <= 21) {
      const completedToday = taskData.completedToday || 0;
      if (completedToday > 0) {
        reminders.push({
          id: 'day-summary',
          type: 'summary',
          priority: 'medium',
          icon: '🌙',
          title: 'Day complete!',
          message: `You completed ${completedToday} task(s) today. Review your accomplishments!`,
          action: 'view-summary',
          time: currentTime.toISOString()
        });
      }
    }

    // Always suggest at least one reminder if there are pending tasks
    if (reminders.length === 0 && taskData.pendingTasks?.length > 0) {
      const totalPending = taskData.pendingTasks.length;
      reminders.push({
        id: 'pending-tasks',
        type: 'task',
        priority: 'medium',
        icon: '📋',
        title: `${totalPending} task(s) pending`,
        message: 'Check your task list and start making progress',
        action: 'view-tasks',
        time: currentTime.toISOString()
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    reminders.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return reminders;
  }

  /**
   * Generate AI insights dashboard
   */
  async generateInsightsDashboard(aggregatedData) {
    const insights = {
      productivity: this.analyzeProductivity(aggregatedData),
      emotional: this.analyzeEmotionalPatterns(aggregatedData),
      wellness: this.analyzeWellnessBalance(aggregatedData),
      timeManagement: this.analyzeTimeManagement(aggregatedData),
      recommendations: []
    };

    // Generate recommendations based on all insights
    insights.recommendations = this.generateRecommendations(insights, aggregatedData);

    return insights;
  }

  /**
   * Analyze productivity patterns
   */
  analyzeProductivity(data) {
    const tasks = data.tasks || [];
    const completedTasks = tasks.filter(t => t.isCompleted);
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks * 100) : 0;

    // Analyze by category
    const categoryBreakdown = {};
    completedTasks.forEach(task => {
      const cat = task.category || 'uncategorized';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    // Find peak productivity hours (based on completion timestamps)
    const completionHours = completedTasks
      .filter(t => t.completedAt)
      .map(t => new Date(t.completedAt).getHours());
    
    const peakHours = this.findPeakHours(completionHours);

    return {
      totalTasks: totalTasks,
      completedTasks: completedTasks.length,
      pendingTasks: totalTasks - completedTasks.length,
      completionRate: Math.round(completionRate),
      categoryBreakdown: categoryBreakdown,
      peakProductivityHours: peakHours,
      trend: this.calculateTrend(data.taskHistory || []),
      status: this.getProductivityStatus(completionRate)
    };
  }

  /**
   * Analyze emotional patterns
   */
  analyzeEmotionalPatterns(data) {
    const emotions = data.emotions || [];
    
    if (emotions.length === 0) {
      return {
        dominant: 'neutral',
        distribution: {},
        moodTrend: 'stable',
        correlations: []
      };
    }

    // Calculate emotion distribution
    const distribution = {};
    emotions.forEach(log => {
      const emotion = log.emotion || 'neutral';
      distribution[emotion] = (distribution[emotion] || 0) + 1;
    });

    // Find dominant emotion
    const dominant = Object.keys(distribution).reduce((a, b) => 
      distribution[a] > distribution[b] ? a : b
    );

    // Analyze mood-task correlation
    const correlations = this.analyzeMoodTaskCorrelation(data);

    return {
      dominant: dominant,
      distribution: distribution,
      totalLogs: emotions.length,
      moodTrend: this.calculateMoodTrend(emotions),
      correlations: correlations,
      averageConfidence: emotions.reduce((sum, e) => sum + (e.confidence || 0), 0) / emotions.length
    };
  }

  /**
   * Analyze wellness balance
   */
  analyzeWellnessBalance(data) {
    const wellness = data.wellness || {};
    const completions = wellness.completions || [];

    const wellnessCount = completions.filter(c => 
      c.goal?.type === 'wellness'
    ).length;

    const sustainabilityCount = completions.filter(c => 
      c.goal?.type === 'sustainability'
    ).length;

    const balance = wellnessCount + sustainabilityCount > 0
      ? Math.abs(wellnessCount - sustainabilityCount) / (wellnessCount + sustainabilityCount)
      : 1;

    return {
      wellnessActivities: wellnessCount,
      sustainabilityActivities: sustainabilityCount,
      totalActivities: wellnessCount + sustainabilityCount,
      balanceScore: Math.round((1 - balance) * 100), // 100 = perfect balance
      currentStreak: wellness.progress?.stats?.wellnessStreak || 0,
      longestStreak: wellness.progress?.stats?.longestStreak || 0,
      badges: wellness.progress?.badges?.length || 0,
      level: wellness.progress?.stats?.currentLevel || 1,
      status: this.getWellnessStatus(wellnessCount, sustainabilityCount)
    };
  }

  /**
   * Analyze time management
   */
  analyzeTimeManagement(data) {
    const schedule = data.schedule || {};
    const stats = schedule.stats || {};

    return {
      totalWorkTime: stats.totalTaskTime || 0,
      breakTime: stats.totalBreakTime || 0,
      freeTime: stats.freeTime || 0,
      workloadPercentage: stats.workloadPercentage || 0,
      overflowTasks: stats.overflowTasks || 0,
      efficiency: this.calculateEfficiency(stats),
      status: this.getTimeManagementStatus(stats.workloadPercentage || 0)
    };
  }

  /**
   * Analyze mood-task correlation
   */
  analyzeMoodTaskCorrelation(data) {
    const correlations = [];
    const emotions = data.emotions || [];
    const tasks = data.tasks || [];

    // Group tasks by mood
    const moodTaskMap = {};
    emotions.forEach(emotion => {
      const emotionDate = new Date(emotion.timestamp).toISOString().split('T')[0];
      const tasksOnDay = tasks.filter(task => {
        if (!task.completedAt) return false;
        const taskDate = new Date(task.completedAt).toISOString().split('T')[0];
        return taskDate === emotionDate;
      });

      if (tasksOnDay.length > 0) {
        const mood = emotion.emotion;
        if (!moodTaskMap[mood]) {
          moodTaskMap[mood] = { count: 0, tasks: 0 };
        }
        moodTaskMap[mood].count++;
        moodTaskMap[mood].tasks += tasksOnDay.length;
      }
    });

    // Calculate average tasks per mood
    Object.keys(moodTaskMap).forEach(mood => {
      const data = moodTaskMap[mood];
      correlations.push({
        mood: mood,
        averageTasksCompleted: Math.round(data.tasks / data.count),
        occurrences: data.count
      });
    });

    // Sort by productivity
    correlations.sort((a, b) => b.averageTasksCompleted - a.averageTasksCompleted);

    return correlations;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(insights, data) {
    const recommendations = [];

    // Productivity recommendations
    if (insights.productivity.completionRate < 50) {
      recommendations.push({
        category: 'productivity',
        priority: 'high',
        icon: '📉',
        title: 'Low task completion rate',
        message: 'You completed less than 50% of your tasks',
        suggestion: 'Try breaking large tasks into smaller, manageable chunks',
        action: 'review-tasks'
      });
    } else if (insights.productivity.completionRate >= 80) {
      recommendations.push({
        category: 'productivity',
        priority: 'low',
        icon: '🎯',
        title: 'Excellent productivity!',
        message: `${insights.productivity.completionRate}% task completion rate`,
        suggestion: 'Keep up the great work!',
        action: 'celebrate'
      });
    }

    // Emotional recommendations
    if (insights.emotional.dominant === 'stressed' || insights.emotional.dominant === 'tired') {
      recommendations.push({
        category: 'wellness',
        priority: 'high',
        icon: '🧘‍♀️',
        title: `You've been feeling ${insights.emotional.dominant}`,
        message: 'Your dominant mood suggests you need rest',
        suggestion: 'Schedule breaks and try meditation or a short walk',
        action: 'add-wellness-goal'
      });
    }

    // Wellness balance recommendations
    if (insights.wellness.balanceScore < 50) {
      const needMore = insights.wellness.wellnessActivities < insights.wellness.sustainabilityActivities
        ? 'wellness'
        : 'sustainability';
      
      recommendations.push({
        category: 'balance',
        priority: 'medium',
        icon: '⚖️',
        title: 'Imbalanced wellness activities',
        message: `Your ${needMore} activities need attention`,
        suggestion: `Add more ${needMore} goals to maintain balance`,
        action: 'view-wellness'
      });
    }

    // Time management recommendations
    if (insights.timeManagement.workloadPercentage > 90) {
      recommendations.push({
        category: 'time',
        priority: 'high',
        icon: '⏰',
        title: 'Schedule overloaded',
        message: 'Your day is packed at 90%+ capacity',
        suggestion: 'Consider delegating tasks or extending deadlines',
        action: 'reschedule'
      });
    }

    // Peak hours recommendation
    if (insights.productivity.peakProductivityHours.length > 0) {
      const peakStart = Math.min(...insights.productivity.peakProductivityHours);
      const peakEnd = Math.max(...insights.productivity.peakProductivityHours);
      
      recommendations.push({
        category: 'optimization',
        priority: 'medium',
        icon: '🎯',
        title: 'Optimize your schedule',
        message: `Your peak hours are ${peakStart}:00-${peakEnd}:00`,
        suggestion: 'Schedule high-priority tasks during these hours',
        action: 'optimize-schedule'
      });
    }

    // Streak maintenance
    if (insights.wellness.currentStreak >= 3) {
      recommendations.push({
        category: 'motivation',
        priority: 'medium',
        icon: '🔥',
        title: `${insights.wellness.currentStreak}-day streak!`,
        message: 'You\'re building great habits',
        suggestion: 'Complete one wellness goal today to maintain it',
        action: 'maintain-streak'
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Generate next day planning suggestions
   */
  async generateNextDayPlan(aggregatedData) {
    const suggestions = [];

    // Top 3 priorities from pending tasks
    const pendingTasks = aggregatedData.tasks?.filter(t => !t.isCompleted) || [];
    const prioritized = pendingTasks
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, 3);

    prioritized.forEach((task, index) => {
      suggestions.push({
        rank: index + 1,
        type: 'task',
        icon: '📝',
        title: task.name,
        category: task.category,
        priority: task.priority,
        reason: task.priority >= 8 
          ? 'High priority - tackle this first'
          : 'Important for your goals'
      });
    });

    // Add wellness activity if none completed today
    const wellnessToday = aggregatedData.wellness?.todayCompletions || [];
    if (wellnessToday.length === 0) {
      suggestions.push({
        rank: suggestions.length + 1,
        type: 'wellness',
        icon: '🧘‍♀️',
        title: 'Morning meditation',
        category: 'mental-health',
        reason: 'Start your day with mindfulness'
      });
    }

    // Add sustainability goal
    const sustainabilityToday = wellnessToday.filter(c => c.goal?.type === 'sustainability');
    if (sustainabilityToday.length === 0) {
      suggestions.push({
        rank: suggestions.length + 1,
        type: 'sustainability',
        icon: '🚶‍♂️',
        title: 'Walk or bike to work',
        category: 'green-commute',
        reason: 'Eco-friendly and healthy'
      });
    }

    return suggestions.slice(0, 3); // Top 3 suggestions
  }

  // Helper methods

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getRelativeTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 0) return 'overdue';
    if (diffHours < 1) return 'in less than an hour';
    if (diffHours < 24) return `in ${diffHours} hours`;
    if (diffDays === 1) return 'tomorrow';
    return `in ${diffDays} days`;
  }

  findPeakHours(hours) {
    if (hours.length === 0) return [];
    
    const frequency = {};
    hours.forEach(h => {
      frequency[h] = (frequency[h] || 0) + 1;
    });

    const maxFreq = Math.max(...Object.values(frequency));
    return Object.keys(frequency)
      .filter(h => frequency[h] === maxFreq)
      .map(Number)
      .sort((a, b) => a - b);
  }

  calculateTrend(history) {
    if (history.length < 2) return 'stable';
    
    const recent = history.slice(-3).reduce((sum, h) => sum + h.completed, 0);
    const previous = history.slice(-6, -3).reduce((sum, h) => sum + h.completed, 0);
    
    if (recent > previous * 1.1) return 'improving';
    if (recent < previous * 0.9) return 'declining';
    return 'stable';
  }

  calculateMoodTrend(emotions) {
    if (emotions.length < 2) return 'stable';
    
    const positiveEmotions = ['happy', 'energetic', 'calm'];
    const recent = emotions.slice(-3).filter(e => positiveEmotions.includes(e.emotion)).length;
    const previous = emotions.slice(-6, -3).filter(e => positiveEmotions.includes(e.emotion)).length;
    
    if (recent > previous) return 'improving';
    if (recent < previous) return 'declining';
    return 'stable';
  }

  calculateEfficiency(stats) {
    const totalTime = stats.totalTaskTime + stats.totalBreakTime;
    if (totalTime === 0) return 0;
    return Math.round((stats.totalTaskTime / totalTime) * 100);
  }

  getProductivityStatus(rate) {
    if (rate >= 80) return 'excellent';
    if (rate >= 60) return 'good';
    if (rate >= 40) return 'average';
    return 'needs-improvement';
  }

  getWellnessStatus(wellness, sustainability) {
    const total = wellness + sustainability;
    if (total === 0) return 'inactive';
    if (total >= 5) return 'active';
    if (total >= 2) return 'moderate';
    return 'low';
  }

  getTimeManagementStatus(workload) {
    if (workload > 90) return 'overloaded';
    if (workload >= 70) return 'busy';
    if (workload >= 40) return 'balanced';
    return 'light';
  }
}

module.exports = new DashboardService();
