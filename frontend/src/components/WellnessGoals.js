import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaTrophy, FaFire, FaLeaf, FaBrain, FaDumbbell, FaAppleAlt, 
  FaBed, FaCoffee, FaWalking, FaRecycle, FaLightbulb, FaMobileAlt,
  FaShoppingCart, FaMedal, FaStar, FaChartLine, FaPlus, FaTimes,
  FaCheck, FaArrowUp
} from 'react-icons/fa';
import './WellnessGoals.css';

const WellnessGoals = () => {
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';
  const API_BASE_URL = `${API_BASE}/api/wellness`;
  
  // State management
  const [goals, setGoals] = useState([]);
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [newGoal, setNewGoal] = useState({
    type: 'daily',
    category: 'mental-health',
    name: '',
    description: '',
    targetValue: 1,
    targetUnit: 'times'
  });

  // Category mapping with icons
  const categoryIcons = {
    'mental-health': <FaBrain />,
    'physical-health': <FaDumbbell />,
    'nutrition': <FaAppleAlt />,
    'sleep': <FaBed />,
    'breaks': <FaCoffee />,
    'green-commute': <FaWalking />,
    'waste-reduction': <FaRecycle />,
    'energy-saving': <FaLightbulb />,
    'digital-minimalism': <FaMobileAlt />,
    'eco-shopping': <FaShoppingCart />
  };

  const categoryLabels = {
    'mental-health': 'Mental Health',
    'physical-health': 'Physical Health',
    'nutrition': 'Nutrition',
    'sleep': 'Sleep',
    'breaks': 'Breaks',
    'green-commute': 'Green Commute',
    'waste-reduction': 'Waste Reduction',
    'energy-saving': 'Energy Saving',
    'digital-minimalism': 'Digital Minimalism',
    'eco-shopping': 'Eco Shopping'
  };

  // Fetch all wellness data
  const fetchWellnessData = async () => {
    setLoading(true);
    setError('');
    try {
      const [goalsRes, badgesRes, progressRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/goals`),
        axios.get(`${API_BASE_URL}/badges`),
        axios.get(`${API_BASE_URL}/progress`)
      ]);

      // Handle goals response - check for nested structure
      if (goalsRes.data.success && goalsRes.data.goals) {
        setGoals(goalsRes.data.goals);
      }

      // Handle badges response - could be array or object
      if (Array.isArray(badgesRes.data)) {
        setBadges(badgesRes.data);
      } else if (badgesRes.data.badges && Array.isArray(badgesRes.data.badges)) {
        setBadges(badgesRes.data.badges);
      }

      // Handle progress response - check for nested stats object
      if (progressRes.data.success && progressRes.data.progress) {
        setProgress(progressRes.data.progress);
      }
    } catch (err) {
      console.error('Error fetching wellness data:', err);
      setError(typeof err.response?.data === 'string' 
        ? err.response.data 
        : err.response?.data?.message || 'Failed to load wellness data');
    } finally {
      setLoading(false);
    }
  };

  // Create new goal
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/goals`, {
        ...newGoal,
        target: {
          value: parseInt(newGoal.targetValue),
          unit: newGoal.targetUnit
        }
      });

      if (response.data.success) {
        // Backend returns {success, message, goal: {...}}
        await fetchWellnessData();
        setShowCreateForm(false);
        setNewGoal({
          type: 'daily',
          category: 'mental-health',
          name: '',
          description: '',
          targetValue: 1,
          targetUnit: 'times'
        });
      }
    } catch (err) {
      console.error('Error creating goal:', err);
      setError(typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  // Complete a goal
  const handleCompleteGoal = async (goalId) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/complete/${goalId}`);

      if (response.data.success) {
        // Backend returns {success, message, completion, pointsBreakdown, newStreak}
        const { message, pointsBreakdown, newStreak } = response.data;
        
        // Show success message with points breakdown
        let successMsg = message || 'Goal completed! 🎉';
        if (pointsBreakdown && typeof pointsBreakdown === 'object') {
          const totalPoints = pointsBreakdown.totalPoints || 0;
          const streakBonus = pointsBreakdown.streakBonus || 0;
          successMsg += ` +${totalPoints} points`;
          if (streakBonus > 0) {
            successMsg += ` (${streakBonus} streak bonus!)`;
          }
        }
        if (newStreak) {
          successMsg += ` 🔥 ${newStreak} day streak!`;
        }

        alert(successMsg);
        await fetchWellnessData();
      }
    } catch (err) {
      console.error('Error completing goal:', err);
      setError(typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || 'Failed to complete goal');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchWellnessData();
  }, []);

  // Render progress stats - careful with nested objects
  const renderProgressStats = () => {
    if (!progress || !progress.stats) return null;

    const stats = progress.stats;
    
    return (
      <div className="progress-dashboard">
        <div className="stat-card points-card">
          <div className="stat-icon"><FaTrophy /></div>
          <div className="stat-content">
            <h3>{stats.totalPoints || 0}</h3>
            <p>Total Points</p>
          </div>
        </div>

        <div className="stat-card level-card">
          <div className="stat-icon"><FaStar /></div>
          <div className="stat-content">
            <h3>Level {stats.currentLevel || 1}</h3>
            <p>{stats.pointsToNextLevel || 0} to next level</p>
          </div>
        </div>

        <div className="stat-card wellness-streak-card">
          <div className="stat-icon"><FaFire /></div>
          <div className="stat-content">
            <h3>{stats.wellnessStreak || 0} Days</h3>
            <p>Wellness Streak</p>
          </div>
        </div>

        <div className="stat-card sustainability-streak-card">
          <div className="stat-icon"><FaLeaf /></div>
          <div className="stat-content">
            <h3>{stats.sustainabilityStreak || 0} Days</h3>
            <p>Sustainability Streak</p>
          </div>
        </div>
      </div>
    );
  };

  // Render badges - handle array of objects
  const renderBadges = () => {
    if (!badges || badges.length === 0) {
      return (
        <div className="empty-state">
          <FaMedal className="empty-icon" />
          <p>Complete goals to earn badges!</p>
        </div>
      );
    }

    return (
      <div className="badges-grid">
        {badges.map((badge, index) => {
          // Handle both string and object badge structures
          const badgeName = typeof badge === 'object' ? (badge.name || 'Badge') : badge;
          const badgeDesc = typeof badge === 'object' ? (badge.description || '') : '';
          const badgeIcon = typeof badge === 'object' ? (badge.icon || '🏆') : '🏆';
          const badgeRarity = typeof badge === 'object' ? (badge.rarity || 'common') : 'common';

          return (
            <div key={index} className={`badge-card ${badgeRarity}`}>
              <div className="badge-icon">{badgeIcon}</div>
              <h4>{badgeName}</h4>
              <p>{badgeDesc}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Render goals list - handle nested goal objects
  const renderGoals = () => {
    if (!goals || goals.length === 0) {
      return (
        <div className="empty-state">
          <FaChartLine className="empty-icon" />
          <p>No goals yet. Create your first wellness goal!</p>
        </div>
      );
    }

    return (
      <div className="goals-list">
        {goals.map((goal) => {
          // Defensive object property access
          const goalName = goal.name || 'Unnamed Goal';
          const goalDesc = goal.description || '';
          const goalCategory = goal.category || 'mental-health';
          const goalType = goal.type || 'daily';
          const goalPoints = goal.points || 10;
          const goalIcon = goal.icon || '🎯';
          
          // Handle target object carefully
          const targetValue = goal.target && typeof goal.target === 'object' 
            ? (goal.target.value || 1) 
            : 1;
          const targetUnit = goal.target && typeof goal.target === 'object'
            ? (goal.target.unit || 'times')
            : 'times';

          return (
            <div key={goal.id} className="goal-card">
              <div className="goal-header">
                <div className="goal-icon-wrapper">
                  <span className="goal-emoji">{goalIcon}</span>
                  <span className="goal-category-icon">
                    {categoryIcons[goalCategory] || <FaBrain />}
                  </span>
                </div>
                <div className="goal-info">
                  <h3>{goalName}</h3>
                  <p className="goal-description">{goalDesc}</p>
                  <div className="goal-meta">
                    <span className="goal-type">{goalType}</span>
                    <span className="goal-category">{categoryLabels[goalCategory]}</span>
                    <span className="goal-points">+{goalPoints} pts</span>
                  </div>
                </div>
              </div>

              <div className="goal-target">
                <p>Target: {targetValue} {targetUnit}</p>
              </div>

              <button 
                className="complete-btn"
                onClick={() => handleCompleteGoal(goal.id)}
                disabled={loading}
              >
                <FaCheck /> Complete
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // Render create goal form
  const renderCreateForm = () => {
    if (!showCreateForm) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
        <div className="create-goal-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Create New Goal</h2>
            <button 
              className="close-btn"
              onClick={() => setShowCreateForm(false)}
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleCreateGoal} className="goal-form">
            <div className="form-group">
              <label>Goal Type</label>
              <select
                value={newGoal.type}
                onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                required
              >
                <optgroup label="Wellness">
                  <option value="mental-health">🧘‍♀️ Mental Health</option>
                  <option value="physical-health">💪 Physical Health</option>
                  <option value="nutrition">🥗 Nutrition</option>
                  <option value="sleep">😴 Sleep</option>
                  <option value="breaks">☕ Breaks</option>
                </optgroup>
                <optgroup label="Sustainability">
                  <option value="green-commute">🚶‍♂️ Green Commute</option>
                  <option value="waste-reduction">♻️ Waste Reduction</option>
                  <option value="energy-saving">💡 Energy Saving</option>
                  <option value="digital-minimalism">📱 Digital Minimalism</option>
                  <option value="eco-shopping">🛒 Eco Shopping</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label>Goal Name</label>
              <input
                type="text"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="E.g., Morning meditation"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Describe your goal..."
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Value</label>
                <input
                  type="number"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Unit</label>
                <select
                  value={newGoal.targetUnit}
                  onChange={(e) => setNewGoal({ ...newGoal, targetUnit: e.target.value })}
                  required
                >
                  <option value="times">Times</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="glasses">Glasses</option>
                  <option value="servings">Servings</option>
                  <option value="steps">Steps</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              <FaPlus /> Create Goal
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="wellness-goals-container">
      <div className="wellness-header">
        <div className="header-content">
          <h1>
            <FaLeaf className="header-icon" />
            Wellness & Growth
          </h1>
          <p>Track your wellness journey and earn achievements</p>
        </div>
        <button 
          className="create-goal-btn"
          onClick={() => setShowCreateForm(true)}
          disabled={loading}
        >
          <FaPlus /> New Goal
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')}><FaTimes /></button>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading wellness data...</div>}

      {/* Progress Stats Dashboard */}
      <div className="section">
        <h2 className="section-title">
          <FaChartLine /> Your Progress
        </h2>
        {renderProgressStats()}
      </div>

      {/* Active Goals */}
      <div className="section">
        <h2 className="section-title">
          <FaArrowUp /> Active Goals
        </h2>
        {renderGoals()}
      </div>

      {/* Badges Section */}
      <div className="section">
        <h2 className="section-title">
          <FaMedal /> Achievements
        </h2>
        {renderBadges()}
      </div>

      {/* Create Goal Modal */}
      {renderCreateForm()}
    </div>
  );
};

export default WellnessGoals;
