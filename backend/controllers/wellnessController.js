const wellnessService = require('../services/wellnessService');
const { getFirestore } = require('../config/firebase');

const getDb = () => getFirestore();
const goalsCollection = 'wellnessGoals';
const completionsCollection = 'goalCompletions';
const progressCollection = 'userProgress';

/**
 * Create a new wellness/sustainability goal
 */
const createGoal = async (req, res) => {
  try {
    const { type, category, name, description, target, icon, points } = req.body;

    // Validate required fields
    if (!type || !category || !name) {
      return res.status(400).json({
        success: false,
        error: 'Type, category, and name are required'
      });
    }

    // Validate category
    if (!wellnessService.categories[category]) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Must be one of: ${Object.keys(wellnessService.categories).join(', ')}`
      });
    }

    const goalData = {
      userId: 'default_user', // TODO: Add actual user auth
      type: type, // wellness or sustainability
      category: category,
      name: name,
      description: description || '',
      target: target || { frequency: 'daily', count: 1 },
      icon: icon || wellnessService.categories[category].icon,
      points: points || 10,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const docRef = await getDb().collection(goalsCollection).add(goalData);

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal: {
        id: docRef.id,
        ...goalData
      }
    });

  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create goal',
      details: error.message
    });
  }
};

/**
 * Get all goals
 */
const getAllGoals = async (req, res) => {
  try {
    const { type, category, isActive } = req.query;

    let query = getDb().collection(goalsCollection);

    // Apply filters
    if (type) {
      query = query.where('type', '==', type);
    }
    if (category) {
      query = query.where('category', '==', category);
    }
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query.get();
    const goals = [];

    snapshot.forEach(doc => {
      goals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      count: goals.length,
      goals: goals
    });

  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch goals'
    });
  }
};

/**
 * Complete a goal
 */
const completeGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { notes, mood } = req.body;

    // Get the goal
    const goalDoc = await getDb().collection(goalsCollection).doc(goalId).get();
    
    if (!goalDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Goal not found'
      });
    }

    const goal = { id: goalDoc.id, ...goalDoc.data() };

    // Get user progress to calculate streak
    const progressDoc = await getDb().collection(progressCollection)
      .doc('default_user')
      .get();

    const currentProgress = progressDoc.exists ? progressDoc.data() : {
      stats: { wellnessStreak: 0, sustainabilityStreak: 0 }
    };

    // Calculate points with streak bonus
    const currentStreak = goal.type === 'wellness' ? 
      currentProgress.stats.wellnessStreak : 
      currentProgress.stats.sustainabilityStreak;

    const pointsCalc = wellnessService.calculatePoints(goal, currentStreak);

    // Create completion record
    const completionData = {
      goalId: goalId,
      userId: 'default_user',
      completedAt: new Date().toISOString(),
      notes: notes || '',
      mood: mood || null,
      pointsEarned: pointsCalc.totalPoints,
      streakDay: currentStreak + 1,
      goal: goal // Store goal data for easy querying
    };

    const completionRef = await getDb().collection(completionsCollection).add(completionData);

    // Update user progress
    await updateUserProgress('default_user', pointsCalc.totalPoints, goal.type);

    res.status(200).json({
      success: true,
      message: 'Goal completed! 🎉',
      completion: {
        id: completionRef.id,
        ...completionData
      },
      pointsBreakdown: pointsCalc,
      newStreak: currentStreak + 1
    });

  } catch (error) {
    console.error('Error completing goal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete goal',
      details: error.message
    });
  }
};

/**
 * Get user progress and stats
 */
const getProgress = async (req, res) => {
  try {
    const userId = 'default_user'; // TODO: Add auth

    // Get progress document
    const progressDoc = await getDb().collection(progressCollection).doc(userId).get();
    
    if (!progressDoc.exists) {
      return res.status(200).json({
        success: true,
        progress: {
          stats: {
            totalPoints: 0,
            currentLevel: 1,
            wellnessStreak: 0,
            sustainabilityStreak: 0,
            longestStreak: 0,
            totalWellnessGoals: 0,
            totalSustainabilityGoals: 0
          },
          badges: [],
          level: wellnessService.getUserLevel(0)
        }
      });
    }

    const progress = progressDoc.data();
    const levelInfo = wellnessService.getUserLevel(progress.stats.totalPoints);

    res.status(200).json({
      success: true,
      progress: {
        ...progress,
        level: levelInfo
      }
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress'
    });
  }
};

/**
 * Get completion history
 */
const getCompletions = async (req, res) => {
  try {
    const { limit = 50, type, category, startDate, endDate } = req.query;

    let query = getDb().collection(completionsCollection)
      .where('userId', '==', 'default_user')
      .orderBy('completedAt', 'desc')
      .limit(parseInt(limit));

    const snapshot = await query.get();
    const completions = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Filter by type if specified
      if (type && data.goal?.type !== type) return;
      
      // Filter by category if specified
      if (category && data.goal?.category !== category) return;
      
      // Filter by date range
      const completedAt = new Date(data.completedAt);
      if (startDate && completedAt < new Date(startDate)) return;
      if (endDate && completedAt > new Date(endDate)) return;

      completions.push({
        id: doc.id,
        ...data
      });
    });

    res.status(200).json({
      success: true,
      count: completions.length,
      completions: completions
    });

  } catch (error) {
    console.error('Error fetching completions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch completions'
    });
  }
};

/**
 * Get today's completions
 */
const getTodayCompletions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all user completions and filter in-memory to avoid index requirement
    const snapshot = await getDb().collection(completionsCollection)
      .where('userId', '==', 'default_user')
      .get();

    const completions = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const completedAt = new Date(data.completedAt);
      
      // Filter for today's completions
      if (completedAt >= today && completedAt < tomorrow) {
        completions.push({
          id: doc.id,
          ...data
        });
      }
    });

    // Sort by completion time
    completions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    res.status(200).json({
      success: true,
      count: completions.length,
      completions: completions,
      date: today.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Error fetching today\'s completions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s completions',
      details: error.message
    });
  }
};

/**
 * Get category statistics
 */
const getCategoryStats = async (req, res) => {
  try {
    const snapshot = await getDb().collection(completionsCollection)
      .where('userId', '==', 'default_user')
      .get();

    const completions = [];
    snapshot.forEach(doc => {
      completions.push(doc.data());
    });

    const stats = wellnessService.getCategoryStats(completions);

    res.status(200).json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category stats'
    });
  }
};

/**
 * Get AI-generated insights
 */
const getInsights = async (req, res) => {
  try {
    // Get completions (without orderBy to avoid index)
    const completionsSnapshot = await getDb().collection(completionsCollection)
      .where('userId', '==', 'default_user')
      .limit(100)
      .get();

    const completions = [];
    completionsSnapshot.forEach(doc => {
      completions.push(doc.data());
    });

    // Sort in-memory
    completions.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    // Get user progress
    const progressDoc = await getDb().collection(progressCollection)
      .doc('default_user')
      .get();

    const userProgress = progressDoc.exists ? progressDoc.data() : { stats: {} };

    // Get recent mood
    let mood = 'neutral';
    try {
      const emotionSnapshot = await getDb().collection('emotionLogs')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      
      if (!emotionSnapshot.empty) {
        mood = emotionSnapshot.docs[0].data().emotion;
      }
    } catch (err) {
      console.log('Could not fetch mood, using neutral');
    }

    // Generate insights
    const insights = await wellnessService.generateInsights(completions, userProgress, mood);

    res.status(200).json({
      success: true,
      mood: mood,
      insights: insights
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      details: error.message
    });
  }
};

/**
 * Get earned badges
 */
const getBadges = async (req, res) => {
  try {
    const progressDoc = await getDb().collection(progressCollection)
      .doc('default_user')
      .get();

    const badges = progressDoc.exists ? progressDoc.data().badges || [] : [];

    res.status(200).json({
      success: true,
      count: badges.length,
      badges: badges,
      availableBadges: Object.keys(wellnessService.badges).length,
      progress: `${badges.length}/${Object.keys(wellnessService.badges).length}`
    });

  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch badges'
    });
  }
};

/**
 * Helper: Update user progress
 */
const updateUserProgress = async (userId, pointsEarned, goalType) => {
  const progressRef = getDb().collection(progressCollection).doc(userId);
  const progressDoc = await progressRef.get();

  let progressData;
  
  if (!progressDoc.exists) {
    // Initialize new progress
    progressData = {
      userId: userId,
      stats: {
        totalPoints: pointsEarned,
        currentLevel: 1,
        wellnessStreak: goalType === 'wellness' ? 1 : 0,
        sustainabilityStreak: goalType === 'sustainability' ? 1 : 0,
        longestStreak: 1,
        totalWellnessGoals: goalType === 'wellness' ? 1 : 0,
        totalSustainabilityGoals: goalType === 'sustainability' ? 1 : 0,
        lastActivityDate: new Date().toISOString().split('T')[0]
      },
      badges: [],
      updatedAt: new Date().toISOString()
    };
  } else {
    progressData = progressDoc.data();
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progressData.stats.lastActivityDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Update streaks
    if (lastActivity === today) {
      // Already completed today, don't increment streak
    } else if (lastActivity === yesterdayStr) {
      // Consecutive day, increment streak
      if (goalType === 'wellness') {
        progressData.stats.wellnessStreak++;
      } else {
        progressData.stats.sustainabilityStreak++;
      }
    } else {
      // Streak broken, reset
      if (goalType === 'wellness') {
        progressData.stats.wellnessStreak = 1;
      } else {
        progressData.stats.sustainabilityStreak = 1;
      }
    }

    // Update total points and counts
    progressData.stats.totalPoints += pointsEarned;
    if (goalType === 'wellness') {
      progressData.stats.totalWellnessGoals++;
    } else {
      progressData.stats.totalSustainabilityGoals++;
    }

    // Update longest streak
    const currentStreak = Math.max(
      progressData.stats.wellnessStreak,
      progressData.stats.sustainabilityStreak
    );
    progressData.stats.longestStreak = Math.max(
      progressData.stats.longestStreak || 0,
      currentStreak
    );

    progressData.stats.lastActivityDate = today;
    progressData.stats.currentLevel = wellnessService.getUserLevel(progressData.stats.totalPoints).currentLevel;
    progressData.updatedAt = new Date().toISOString();

    // Check for new badges
    const completionsSnapshot = await getDb().collection(completionsCollection)
      .where('userId', '==', userId)
      .get();

    const completions = [];
    completionsSnapshot.forEach(doc => completions.push(doc.data()));

    const newBadges = wellnessService.checkBadgeEligibility(progressData, completions);
    
    if (newBadges.length > 0) {
      progressData.badges = [...(progressData.badges || []), ...newBadges];
      console.log(`🏅 User earned ${newBadges.length} new badge(s)!`);
    }
  }

  await progressRef.set(progressData);
  return progressData;
};

module.exports = {
  createGoal,
  getAllGoals,
  completeGoal,
  getProgress,
  getCompletions,
  getTodayCompletions,
  getCategoryStats,
  getInsights,
  getBadges
};
