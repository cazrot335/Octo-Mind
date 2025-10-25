/**
 * Wellness & Sustainability Service
 * Handles goal tracking, gamification, badges, and insights
 */

class WellnessService {
  constructor() {
    // Goal categories and their base difficulty
    this.categories = {
      'mental-health': { difficulty: 1.5, icon: '🧘‍♀️', type: 'wellness' },
      'physical-health': { difficulty: 2, icon: '💪', type: 'wellness' },
      'nutrition': { difficulty: 1, icon: '🥗', type: 'wellness' },
      'sleep': { difficulty: 1.5, icon: '😴', type: 'wellness' },
      'breaks': { difficulty: 1, icon: '☕', type: 'wellness' },
      'green-commute': { difficulty: 1.5, icon: '🚶‍♂️', type: 'sustainability' },
      'waste-reduction': { difficulty: 1, icon: '♻️', type: 'sustainability' },
      'energy-saving': { difficulty: 1, icon: '💡', type: 'sustainability' },
      'digital-minimalism': { difficulty: 2, icon: '📱', type: 'sustainability' },
      'eco-shopping': { difficulty: 1.5, icon: '🛒', type: 'sustainability' }
    };

    // Badge definitions
    this.badges = {
      // Wellness badges
      calm_mind: {
        name: 'Calm Mind',
        description: 'Complete 7 consecutive days of meditation/mindfulness',
        icon: '🧘‍♀️',
        category: 'wellness',
        criteria: { type: 'streak', category: 'mental-health', count: 7 },
        points: 100,
        rarity: 'common'
      },
      fitness_enthusiast: {
        name: 'Fitness Enthusiast',
        description: 'Complete 14 consecutive days of exercise',
        icon: '💪',
        category: 'wellness',
        criteria: { type: 'streak', category: 'physical-health', count: 14 },
        points: 150,
        rarity: 'rare'
      },
      hydration_hero: {
        name: 'Hydration Hero',
        description: 'Track hydration for 30 days',
        icon: '💧',
        category: 'wellness',
        criteria: { type: 'total', category: 'nutrition', count: 30 },
        points: 200,
        rarity: 'rare'
      },
      sleep_master: {
        name: 'Sleep Master',
        description: 'Maintain healthy sleep for 7 consecutive nights',
        icon: '😴',
        category: 'wellness',
        criteria: { type: 'streak', category: 'sleep', count: 7 },
        points: 100,
        rarity: 'common'
      },

      // Sustainability badges
      green_warrior: {
        name: 'Green Warrior',
        description: 'Complete 10 eco-friendly actions',
        icon: '🌍',
        category: 'sustainability',
        criteria: { type: 'total', category: 'sustainability', count: 10 },
        points: 100,
        rarity: 'common'
      },
      earth_walker: {
        name: 'Earth Walker',
        description: 'Walk or bike 30 times instead of driving',
        icon: '🚶‍♂️',
        category: 'sustainability',
        criteria: { type: 'total', category: 'green-commute', count: 30 },
        points: 200,
        rarity: 'rare'
      },
      recycling_champion: {
        name: 'Recycling Champion',
        description: 'Complete 20 recycling/waste reduction actions',
        icon: '♻️',
        category: 'sustainability',
        criteria: { type: 'total', category: 'waste-reduction', count: 20 },
        points: 150,
        rarity: 'rare'
      },
      energy_saver: {
        name: 'Energy Saver',
        description: 'Complete 15 energy-saving actions',
        icon: '💡',
        category: 'sustainability',
        criteria: { type: 'total', category: 'energy-saving', count: 15 },
        points: 150,
        rarity: 'rare'
      },

      // Ultimate badges
      octomind_master: {
        name: 'OctoMind Master',
        description: 'Reach level 5 in both wellness and sustainability',
        icon: '🐙',
        category: 'ultimate',
        criteria: { type: 'level', wellness: 5, sustainability: 5 },
        points: 500,
        rarity: 'legendary'
      },
      balance_keeper: {
        name: 'Balance Keeper',
        description: 'Maintain equal progress across all categories',
        icon: '⭐',
        category: 'ultimate',
        criteria: { type: 'balanced', variance: 0.2 },
        points: 300,
        rarity: 'epic'
      },
      streak_legend: {
        name: 'Streak Legend',
        description: 'Maintain a 30-day overall streak',
        icon: '🔥',
        category: 'ultimate',
        criteria: { type: 'streak', count: 30 },
        points: 400,
        rarity: 'epic'
      }
    };

    // Level thresholds
    this.levels = [
      { level: 1, minPoints: 0, maxPoints: 100, title: 'Beginner' },
      { level: 2, minPoints: 101, maxPoints: 250, title: 'Explorer' },
      { level: 3, minPoints: 251, maxPoints: 500, title: 'Achiever' },
      { level: 4, minPoints: 501, maxPoints: 1000, title: 'Champion' },
      { level: 5, minPoints: 1001, maxPoints: 2000, title: 'Master' },
      { level: 6, minPoints: 2001, maxPoints: Infinity, title: 'Legend' }
    ];
  }

  /**
   * Calculate points for a goal completion
   */
  calculatePoints(goal, currentStreak = 0) {
    const basePoints = goal.points || 10;
    const categoryInfo = this.categories[goal.category] || { difficulty: 1 };
    const difficultyMultiplier = categoryInfo.difficulty;

    // Streak bonus (capped at +50)
    const streakBonus = Math.min(currentStreak * 5, 50);

    const totalPoints = Math.round((basePoints * difficultyMultiplier) + streakBonus);
    
    return {
      basePoints,
      difficultyMultiplier,
      streakBonus,
      totalPoints
    };
  }

  /**
   * Get user level from total points
   */
  getUserLevel(totalPoints) {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      const level = this.levels[i];
      if (totalPoints >= level.minPoints) {
        const nextLevel = this.levels[i + 1];
        return {
          currentLevel: level.level,
          title: level.title,
          currentPoints: totalPoints,
          pointsInLevel: totalPoints - level.minPoints,
          pointsToNextLevel: nextLevel ? nextLevel.minPoints - totalPoints : 0,
          progress: nextLevel ? 
            ((totalPoints - level.minPoints) / (nextLevel.minPoints - level.minPoints) * 100).toFixed(1) : 
            100
        };
      }
    }
    return this.levels[0];
  }

  /**
   * Check if user earned any new badges
   */
  checkBadgeEligibility(userProgress, completions) {
    const earnedBadges = [];
    const existingBadgeIds = userProgress.badges?.map(b => b.id) || [];

    for (const [badgeId, badge] of Object.entries(this.badges)) {
      // Skip if already earned
      if (existingBadgeIds.includes(badgeId)) continue;

      let eligible = false;

      switch (badge.criteria.type) {
        case 'streak':
          // Check category-specific streak
          if (badge.criteria.category) {
            const categoryStreak = this.getCategoryStreak(completions, badge.criteria.category);
            eligible = categoryStreak >= badge.criteria.count;
          } else {
            // Overall streak
            eligible = (userProgress.stats?.longestStreak || 0) >= badge.criteria.count;
          }
          break;

        case 'total':
          // Total completions in a category
          const categoryCount = completions.filter(c => {
            const goal = c.goal;
            return goal && (
              goal.category === badge.criteria.category ||
              this.categories[goal.category]?.type === badge.criteria.category
            );
          }).length;
          eligible = categoryCount >= badge.criteria.count;
          break;

        case 'level':
          // Level-based badges
          // This would need wellness/sustainability level tracking
          // For now, simplified check
          eligible = userProgress.stats?.currentLevel >= 5;
          break;

        case 'balanced':
          // Check balance across categories
          eligible = this.isBalanced(completions);
          break;
      }

      if (eligible) {
        earnedBadges.push({
          id: badgeId,
          ...badge,
          earnedAt: new Date().toISOString()
        });
      }
    }

    return earnedBadges;
  }

  /**
   * Get streak for a specific category
   */
  getCategoryStreak(completions, category) {
    // Sort by date descending
    const sorted = completions
      .filter(c => c.goal?.category === category)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (sorted.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const completion of sorted) {
      const completionDate = new Date(completion.completedAt);
      completionDate.setHours(0, 0, 0, 0);

      const daysDiff = Math.floor((currentDate - completionDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  }

  /**
   * Check if progress is balanced across categories
   */
  isBalanced(completions) {
    const categoryCounts = {};
    
    completions.forEach(c => {
      const cat = c.goal?.category;
      if (cat) {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    });

    const counts = Object.values(categoryCounts);
    if (counts.length < 3) return false; // Need at least 3 categories

    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - avg, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    // Balanced if standard deviation is less than 20% of average
    return (stdDev / avg) < 0.2;
  }

  /**
   * Calculate overall streak (any goal completion)
   */
  calculateOverallStreak(completions) {
    if (completions.length === 0) return 0;

    // Get unique completion dates
    const dates = [...new Set(completions.map(c => {
      const d = new Date(c.completedAt);
      return d.toISOString().split('T')[0];
    }))].sort().reverse();

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];

      if (dates[i] === expectedDateStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Generate AI insights based on wellness data
   */
  async generateInsights(completions, userProgress, mood) {
    const insights = [];

    // Welcome message for new users
    if (completions.length === 0) {
      insights.push({
        type: 'welcome',
        category: 'getting-started',
        message: 'Welcome to OctoMind Wellness! Start your journey by completing your first goal.',
        suggestion: 'Create a simple goal like "5-minute meditation" or "Walk 10 minutes"',
        icon: '🌟',
        priority: 'high'
      });
      return insights;
    }

    // Early achievement
    if (completions.length === 1) {
      insights.push({
        type: 'achievement',
        category: 'motivation',
        message: '🎉 First goal completed! You\'re off to a great start!',
        suggestion: 'Complete one more goal today to build momentum',
        icon: '🎉',
        priority: 'high'
      });
    }

    // Check for break patterns
    const breakCompletions = completions.filter(c => c.goal?.category === 'breaks');
    if (breakCompletions.length < 3 && completions.length > 10) {
      insights.push({
        type: 'warning',
        category: 'wellness',
        message: 'You\'ve been skipping breaks. Regular breaks improve focus and prevent burnout.',
        suggestion: 'Try setting a goal for 3 short breaks per day',
        icon: '⚠️',
        priority: 'high'
      });
    }

    // Check sustainability balance
    const wellnessCount = completions.filter(c => 
      this.categories[c.goal?.category]?.type === 'wellness'
    ).length;
    const sustainabilityCount = completions.filter(c => 
      this.categories[c.goal?.category]?.type === 'sustainability'
    ).length;

    // Encourage balance for early users
    if (completions.length >= 2 && completions.length < 10) {
      if (wellnessCount > 0 && sustainabilityCount === 0) {
        insights.push({
          type: 'suggestion',
          category: 'sustainability',
          message: 'Great start on wellness! How about adding an eco-friendly goal?',
          suggestion: 'Try: Walk instead of drive, Use reusable bottle, or Recycle today',
          icon: '🌍',
          priority: 'medium'
        });
      } else if (sustainabilityCount > 0 && wellnessCount === 0) {
        insights.push({
          type: 'suggestion',
          category: 'wellness',
          message: 'Love your eco-efforts! Don\'t forget to take care of yourself too.',
          suggestion: 'Try: 5-min meditation, Short walk, or Hydration tracking',
          icon: '🧘‍♀️',
          priority: 'medium'
        });
      }
    }

    // Balance for experienced users
    if (completions.length >= 10) {
      if (wellnessCount > sustainabilityCount * 3) {
        insights.push({
          type: 'suggestion',
          category: 'sustainability',
          message: 'You\'re doing great with wellness! Consider adding some eco-friendly habits too.',
          suggestion: 'Try walking/biking instead of driving, or start recycling',
          icon: '🌍',
          priority: 'medium'
        });
      } else if (sustainabilityCount > wellnessCount * 3) {
        insights.push({
          type: 'suggestion',
          category: 'wellness',
          message: 'Amazing eco-efforts! Don\'t forget your personal wellness too.',
          suggestion: 'Add meditation or exercise to your routine',
          icon: '🧘‍♀️',
          priority: 'medium'
        });
      }
    }

    // Streak encouragement
    const currentStreak = userProgress.stats?.wellnessStreak || userProgress.stats?.sustainabilityStreak || 0;
    if (currentStreak >= 3 && currentStreak < 7) {
      insights.push({
        type: 'motivation',
        category: 'streak',
        message: `🔥 ${currentStreak}-day streak! You\'re building a habit!`,
        suggestion: 'Keep going! 7 days unlocks your first streak badge',
        icon: '🔥',
        priority: 'high'
      });
    } else if (currentStreak >= 7) {
      insights.push({
        type: 'achievement',
        category: 'streak',
        message: `🔥 ${currentStreak}-day streak! You\'re building amazing habits!`,
        suggestion: 'Amazing consistency! Can you reach 30 days?',
        icon: '🔥',
        priority: 'high'
      });
    }

    // Mood-based recommendations
    if (mood) {
      switch (mood.toLowerCase()) {
        case 'stressed':
        case 'anxious':
          const mindfulnessGoals = completions.filter(c => 
            c.goal?.category === 'mental-health'
          ).length;
          
          if (mindfulnessGoals < 2) {
            insights.push({
              type: 'recommendation',
              category: 'wellness',
              message: 'Feeling stressed? Mindfulness practices can help calm your mind.',
              suggestion: 'Try 5 minutes of meditation or deep breathing',
              icon: '🧘‍♀️',
              priority: 'high'
            });
          }
          break;

        case 'tired':
        case 'exhausted':
          insights.push({
            type: 'recommendation',
            category: 'wellness',
            message: 'Feeling tired? Rest is productive too!',
            suggestion: 'Consider a short nap or early bedtime goal',
            icon: '😴',
            priority: 'high'
          });
          break;

        case 'energetic':
        case 'motivated':
          insights.push({
            type: 'motivation',
            category: 'wellness',
            message: 'Great energy! Perfect time to tackle a challenging goal.',
            suggestion: 'Try a workout or tackle that difficult task',
            icon: '💪',
            priority: 'medium'
          });
          break;
      }
    }

    // Celebration for balanced progress
    if (completions.length >= 5 && this.isBalanced(completions)) {
      insights.push({
        type: 'achievement',
        category: 'balance',
        message: 'Perfect balance across all wellness areas! You\'re doing amazing!',
        suggestion: 'Maintain this rhythm for the "Balance Keeper" badge',
        icon: '⭐',
        priority: 'medium'
      });
    }

    // Points milestone
    const totalPoints = userProgress.stats?.totalPoints || 0;
    if (totalPoints >= 50 && totalPoints < 100) {
      insights.push({
        type: 'progress',
        category: 'level',
        message: `You have ${totalPoints} points! Almost to Level 2!`,
        suggestion: `${100 - totalPoints} more points to unlock "Explorer" level`,
        icon: '⬆️',
        priority: 'low'
      });
    }

    // Sort by priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    insights.sort((a, b) => {
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    return insights;
  }

  /**
   * Get category statistics
   */
  getCategoryStats(completions) {
    const stats = {};

    Object.keys(this.categories).forEach(category => {
      const categoryCompletions = completions.filter(c => c.goal?.category === category);
      
      stats[category] = {
        category: category,
        icon: this.categories[category].icon,
        type: this.categories[category].type,
        totalCompletions: categoryCompletions.length,
        streak: this.getCategoryStreak(completions, category),
        lastCompleted: categoryCompletions.length > 0 ? 
          categoryCompletions.sort((a, b) => 
            new Date(b.completedAt) - new Date(a.completedAt)
          )[0].completedAt : null,
        totalPoints: categoryCompletions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0)
      };
    });

    return stats;
  }
}

module.exports = new WellnessService();
