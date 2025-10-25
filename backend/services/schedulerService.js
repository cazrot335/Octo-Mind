const aiService = require('./aiService');
const emotionService = require('./emotionService');

/**
 * Smart Scheduler Service
 * Generates optimized daily schedules based on tasks, mood, and available time
 */
class SchedulerService {
  constructor() {
    // Default work settings
    this.defaultWorkStart = '09:00';
    this.defaultWorkEnd = '18:00';
    this.breakDuration = 10; // minutes
    this.breakInterval = 90; // minutes - take break every 90 mins
    this.defaultTaskDuration = 60; // minutes
  }

  /**
   * Generate smart daily schedule
   * @param {Array} tasks - Array of tasks to schedule
   * @param {String} userMood - Current user mood
   * @param {Object} preferences - User preferences (work hours, break settings)
   * @returns {Object} - Generated schedule with time slots
   */
  async generateSchedule(tasks, userMood, preferences = {}) {
    try {
      // Parse preferences
      const workStart = this.parseTime(preferences.workStart || this.defaultWorkStart);
      const workEnd = this.parseTime(preferences.workEnd || this.defaultWorkEnd);
      const breakDuration = preferences.breakDuration || this.breakDuration;
      const breakInterval = preferences.breakInterval || this.breakInterval;

      // Filter only incomplete tasks
      const pendingTasks = tasks.filter(task => !task.isCompleted);

      if (pendingTasks.length === 0) {
        return {
          success: true,
          message: 'No pending tasks to schedule',
          schedule: [],
          stats: this.getEmptyStats()
        };
      }

      // Adjust tasks based on mood
      const adjustedTasks = this.adjustTasksByMood(pendingTasks, userMood);

      // Sort by priority (highest first)
      adjustedTasks.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      // Generate time slots
      const schedule = this.allocateTimeSlots(
        adjustedTasks,
        workStart,
        workEnd,
        breakDuration,
        breakInterval
      );

      // Calculate statistics
      const stats = this.calculateStats(schedule, workStart, workEnd);

      return {
        success: true,
        mood: userMood,
        workHours: `${preferences.workStart || this.defaultWorkStart} - ${preferences.workEnd || this.defaultWorkEnd}`,
        schedule: schedule,
        stats: stats,
        recommendations: this.getRecommendations(userMood, stats)
      };

    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  }

  /**
   * Adjust tasks based on user mood
   */
  adjustTasksByMood(tasks, mood) {
    const adjustedTasks = tasks.map(task => {
      const adjustedTask = { ...task };
      
      // Estimate task difficulty (based on category and priority)
      const difficulty = this.estimateTaskDifficulty(task);
      adjustedTask.difficulty = difficulty;
      adjustedTask.estimatedDuration = task.estimatedDuration || this.defaultTaskDuration;

      return adjustedTask;
    });

    // Reorder based on mood
    switch (mood.toLowerCase()) {
      case 'tired':
      case 'exhausted':
        // Easy tasks first, hard tasks later (or next day)
        adjustedTasks.sort((a, b) => a.difficulty - b.difficulty);
        break;

      case 'stressed':
      case 'anxious':
        // Quick wins first (shorter, easier tasks)
        adjustedTasks.sort((a, b) => {
          const scoreA = a.estimatedDuration + (a.difficulty * 10);
          const scoreB = b.estimatedDuration + (b.difficulty * 10);
          return scoreA - scoreB;
        });
        break;

      case 'energetic':
      case 'motivated':
        // Hard tasks first while energy is high
        adjustedTasks.sort((a, b) => b.difficulty - a.difficulty);
        break;

      case 'frustrated':
        // Mix of easy and medium tasks, avoid very hard ones
        adjustedTasks.sort((a, b) => {
          if (a.difficulty >= 8) return 1; // Push hard tasks down
          if (b.difficulty >= 8) return -1;
          return (a.priority || 0) - (b.priority || 0);
        });
        break;

      default: // neutral, happy
        // Keep priority order but balance difficulty
        // Already sorted by priority
        break;
    }

    return adjustedTasks;
  }

  /**
   * Estimate task difficulty (1-10 scale)
   */
  estimateTaskDifficulty(task) {
    let difficulty = 5; // Default medium

    // Category-based difficulty
    const categoryDifficulty = {
      'work': 7,
      'study': 8,
      'personal': 4,
      'exercise': 6,
      'meeting': 5
    };

    difficulty = categoryDifficulty[task.category] || 5;

    // Adjust by priority (higher priority often = more difficult)
    if (task.priority >= 9) difficulty += 1;
    if (task.priority <= 3) difficulty -= 1;

    // Adjust by mood keywords in task name
    const taskName = task.name.toLowerCase();
    if (taskName.includes('difficult') || taskName.includes('complex')) difficulty += 2;
    if (taskName.includes('quick') || taskName.includes('simple')) difficulty -= 2;

    return Math.max(1, Math.min(10, difficulty)); // Clamp 1-10
  }

  /**
   * Allocate time slots for tasks
   */
  allocateTimeSlots(tasks, workStart, workEnd, breakDuration, breakInterval) {
    const schedule = [];
    let currentTime = workStart;
    let workMinutes = 0; // Track time since last break
    let taskIndex = 0;

    const totalWorkMinutes = this.getMinutesDifference(workStart, workEnd);

    while (taskIndex < tasks.length) {
      const task = tasks[taskIndex];
      const duration = task.estimatedDuration || this.defaultTaskDuration;

      // Check if we need a break
      if (workMinutes >= breakInterval && workMinutes > 0) {
        const breakSlot = {
          type: 'break',
          startTime: this.formatTime(currentTime),
          endTime: this.formatTime(this.addMinutes(currentTime, breakDuration)),
          duration: breakDuration,
          title: '☕ Break Time',
          description: 'Take a short break to recharge'
        };
        schedule.push(breakSlot);
        currentTime = this.addMinutes(currentTime, breakDuration);
        workMinutes = 0;
        continue;
      }

      // Check if task fits in remaining time
      const remainingMinutes = this.getMinutesDifference(currentTime, workEnd);
      
      if (remainingMinutes < duration) {
        // Task doesn't fit today
        const overflowSlot = {
          type: 'overflow',
          task: task,
          message: `Task "${task.name}" moved to next day (needs ${duration} mins, only ${remainingMinutes} mins left)`
        };
        schedule.push(overflowSlot);
        taskIndex++;
        continue;
      }

      // Allocate task to schedule
      const taskSlot = {
        type: 'task',
        taskId: task.id,
        title: task.name,
        category: task.category,
        priority: task.priority,
        difficulty: task.difficulty,
        startTime: this.formatTime(currentTime),
        endTime: this.formatTime(this.addMinutes(currentTime, duration)),
        duration: duration,
        dueDate: task.dueDate,
        mood: task.mood
      };

      schedule.push(taskSlot);
      currentTime = this.addMinutes(currentTime, duration);
      workMinutes += duration;
      taskIndex++;
    }

    return schedule;
  }

  /**
   * Calculate schedule statistics
   */
  calculateStats(schedule, workStart, workEnd) {
    const tasks = schedule.filter(slot => slot.type === 'task');
    const breaks = schedule.filter(slot => slot.type === 'break');
    const overflow = schedule.filter(slot => slot.type === 'overflow');

    const totalTaskTime = tasks.reduce((sum, task) => sum + task.duration, 0);
    const totalBreakTime = breaks.reduce((sum, br) => sum + br.duration, 0);
    const totalWorkMinutes = this.getMinutesDifference(workStart, workEnd);
    const freeTime = totalWorkMinutes - totalTaskTime - totalBreakTime;

    return {
      totalTasks: tasks.length,
      completedSlots: tasks.length,
      totalTaskTime: totalTaskTime,
      totalBreakTime: totalBreakTime,
      freeTime: Math.max(0, freeTime),
      overflowTasks: overflow.length,
      workloadPercentage: Math.round((totalTaskTime / totalWorkMinutes) * 100),
      averageTaskDuration: tasks.length > 0 ? Math.round(totalTaskTime / tasks.length) : 0
    };
  }

  /**
   * Get empty stats
   */
  getEmptyStats() {
    return {
      totalTasks: 0,
      completedSlots: 0,
      totalTaskTime: 0,
      totalBreakTime: 0,
      freeTime: 0,
      overflowTasks: 0,
      workloadPercentage: 0,
      averageTaskDuration: 0
    };
  }

  /**
   * Get recommendations based on mood and stats
   */
  getRecommendations(mood, stats) {
    const recommendations = [];

    // Workload recommendations
    if (stats.workloadPercentage > 90) {
      recommendations.push({
        type: 'warning',
        message: 'Your schedule is packed! Consider delegating or rescheduling some tasks.',
        icon: '⚠️'
      });
    } else if (stats.workloadPercentage < 40) {
      recommendations.push({
        type: 'info',
        message: 'You have plenty of free time. Great opportunity to learn something new!',
        icon: '💡'
      });
    }

    // Mood-based recommendations
    switch (mood.toLowerCase()) {
      case 'tired':
      case 'exhausted':
        recommendations.push({
          type: 'health',
          message: 'You seem tired. I\'ve scheduled easier tasks first. Consider taking longer breaks.',
          icon: '😴'
        });
        break;

      case 'stressed':
      case 'anxious':
        recommendations.push({
          type: 'health',
          message: 'Take it one task at a time. I\'ve prioritized quick wins to reduce stress.',
          icon: '🧘'
        });
        break;

      case 'energetic':
      case 'motivated':
        recommendations.push({
          type: 'productivity',
          message: 'Great energy! Your hardest tasks are scheduled first to maximize productivity.',
          icon: '💪'
        });
        break;
    }

    // Overflow recommendations
    if (stats.overflowTasks > 0) {
      recommendations.push({
        type: 'planning',
        message: `${stats.overflowTasks} task(s) won't fit today. Consider extending work hours or moving them to tomorrow.`,
        icon: '📅'
      });
    }

    // Break recommendations
    if (stats.totalBreakTime < 30 && stats.totalTaskTime > 240) {
      recommendations.push({
        type: 'health',
        message: 'Remember to take breaks! Scheduled breaks will help maintain focus.',
        icon: '☕'
      });
    }

    return recommendations;
  }

  /**
   * Parse time string to minutes since midnight
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Format minutes to HH:MM
   */
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }

  /**
   * Add minutes to time
   */
  addMinutes(time, minutesToAdd) {
    return time + minutesToAdd;
  }

  /**
   * Get difference in minutes between two times
   */
  getMinutesDifference(startTime, endTime) {
    return endTime - startTime;
  }
}

module.exports = new SchedulerService();
