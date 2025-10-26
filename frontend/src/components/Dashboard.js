import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaBrain, FaChartLine, FaTasks, FaHeart, FaClock, FaLeaf,
  FaTrophy, FaFire, FaBolt, FaLightbulb, FaCheckCircle,
  FaExclamationTriangle, FaStar, FaCalendarDay, FaArrowUp,
  FaArrowDown, FaMinus, FaSmile, FaMeh, FaFrown, FaChartBar,
  FaBullseye, FaRocket, FaCoffee, FaSun, FaMoon, FaCloud
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const API_BASE_URL = 'http://localhost:3001/api/dashboard';
  
  // State management
  const [dashboard, setDashboard] = useState(null);
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedView, setSelectedView] = useState('overview'); // overview, analytics, insights

  // Fetch dashboard data
  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboardRes, summaryRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}`),
        axios.get(`${API_BASE_URL}/summary`),
        axios.get(`${API_BASE_URL}/analytics`)
      ]);

      // Handle dashboard response
      if (dashboardRes.data.success && dashboardRes.data.dashboard) {
        setDashboard(dashboardRes.data.dashboard);
      }

      // Handle summary response
      if (summaryRes.data.success && summaryRes.data.summary) {
        setSummary(summaryRes.data.summary);
      }

      // Handle analytics response
      if (analyticsRes.data.success && analyticsRes.data.analytics) {
        setAnalytics(analyticsRes.data.analytics);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(typeof err.response?.data === 'string' 
        ? err.response.data 
        : err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Get time-based greeting icon
  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <FaSun className="greeting-icon morning" />;
    if (hour < 18) return <FaCloud className="greeting-icon afternoon" />;
    return <FaMoon className="greeting-icon evening" />;
  };

  // Get mood icon
  const getMoodIcon = (mood) => {
    const moodIcons = {
      'happy': <FaSmile className="mood-icon happy" />,
      'energetic': <FaBolt className="mood-icon energetic" />,
      'calm': <FaHeart className="mood-icon calm" />,
      'stressed': <FaExclamationTriangle className="mood-icon stressed" />,
      'tired': <FaCoffee className="mood-icon tired" />,
      'frustrated': <FaFrown className="mood-icon frustrated" />,
      'neutral': <FaMeh className="mood-icon neutral" />
    };
    return moodIcons[mood] || moodIcons['neutral'];
  };

  // Get trend icon
  const getTrendIcon = (trend) => {
    if (!trend) return <FaMinus className="trend-neutral" />;
    const trendLower = trend.toLowerCase();
    if (trendLower.includes('up') || trendLower.includes('improv') || trendLower.includes('increas')) {
      return <FaArrowUp className="trend-up" />;
    }
    if (trendLower.includes('down') || trendLower.includes('decreas') || trendLower.includes('declin')) {
      return <FaArrowDown className="trend-down" />;
    }
    return <FaMinus className="trend-neutral" />;
  };

  // Render greeting section
  const renderGreeting = () => {
    if (!dashboard) return null;

    const greeting = dashboard.greeting || 'Welcome back';
    const date = dashboard.date || new Date().toISOString().split('T')[0];

    return (
      <div className="greeting-section">
        <div className="greeting-content">
          <div className="greeting-header">
            {getGreetingIcon()}
            <div>
              <h1>{greeting}</h1>
              <p className="date-display">{new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render quick stats
  const renderQuickStats = () => {
    if (!dashboard || !dashboard.quickStats) return null;

    const stats = dashboard.quickStats;

    return (
      <div className="quick-stats-grid">
        <div className="stat-card tasks-stat">
          <div className="stat-icon-wrapper">
            <FaTasks className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>{stats.tasksCompleted || 0}/{stats.tasksToday || 0}</h3>
            <p>Tasks Today</p>
          </div>
          <div className="stat-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${stats.tasksToday > 0 ? (stats.tasksCompleted / stats.tasksToday * 100) : 0}%` 
              }}
            />
          </div>
        </div>

        <div className="stat-card wellness-stat">
          <div className="stat-icon-wrapper">
            <FaLeaf className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>{stats.wellnessActivities || 0}</h3>
            <p>Wellness Activities</p>
          </div>
        </div>

        <div className="stat-card mood-stat">
          <div className="stat-icon-wrapper">
            {getMoodIcon(stats.currentMood)}
          </div>
          <div className="stat-content">
            <h3>{stats.currentMood || 'Neutral'}</h3>
            <p>Current Mood</p>
          </div>
        </div>

        <div className="stat-card streak-stat">
          <div className="stat-icon-wrapper">
            <FaFire className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>{stats.streakDays || 0} Days</h3>
            <p>Wellness Streak</p>
          </div>
        </div>
      </div>
    );
  };

  // Render insights
  const renderInsights = () => {
    if (!dashboard || !dashboard.insights) return null;

    const insights = dashboard.insights;

    return (
      <div className="insights-section">
        <h2 className="section-title">
          <FaLightbulb /> AI Insights
        </h2>

        <div className="insights-grid">
          {/* Productivity Insight */}
          {insights.productivity && (
            <div className="insight-card productivity-insight">
              <div className="insight-header">
                <FaChartLine className="insight-icon" />
                <h3>Productivity</h3>
              </div>
              <div className="insight-content">
                <div className="metric">
                  <span className="metric-label">Completion Rate</span>
                  <span className="metric-value">
                    {insights.productivity.completionRate || 0}%
                    {getTrendIcon(insights.productivity.trend)}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Peak Hours</span>
                  <span className="metric-value">
                    {insights.productivity.peakProductivityHours || 'N/A'}
                  </span>
                </div>
                <p className="insight-text">
                  {insights.productivity.trend || 'Keep up the good work!'}
                </p>
              </div>
            </div>
          )}

          {/* Emotional Insight */}
          {insights.emotional && (
            <div className="insight-card emotional-insight">
              <div className="insight-header">
                <FaHeart className="insight-icon" />
                <h3>Emotional State</h3>
              </div>
              <div className="insight-content">
                <div className="metric">
                  <span className="metric-label">Dominant Mood</span>
                  <span className="metric-value">
                    {getMoodIcon(insights.emotional.dominant)}
                    {insights.emotional.dominant || 'Neutral'}
                  </span>
                </div>
                {insights.emotional.distribution && (
                  <div className="mood-distribution">
                    {Object.entries(insights.emotional.distribution).slice(0, 3).map(([mood, count]) => (
                      <div key={mood} className="mood-item">
                        <span>{mood}</span>
                        <span className="mood-count">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="insight-text">
                  {insights.emotional.moodTrend || 'Your emotional patterns are balanced'}
                </p>
              </div>
            </div>
          )}

          {/* Wellness Insight */}
          {insights.wellness && (
            <div className="insight-card wellness-insight">
              <div className="insight-header">
                <FaLeaf className="insight-icon" />
                <h3>Wellness</h3>
              </div>
              <div className="insight-content">
                <div className="metric">
                  <span className="metric-label">Status</span>
                  <span className="metric-value">
                    {insights.wellness.status || 'Active'}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Engagement</span>
                  <span className="metric-value">
                    {insights.wellness.engagementLevel || 'Good'}
                  </span>
                </div>
                <p className="insight-text">
                  {insights.wellness.message || 'Maintain your wellness routine'}
                </p>
              </div>
            </div>
          )}

          {/* Time Management Insight */}
          {insights.timeManagement && (
            <div className="insight-card time-insight">
              <div className="insight-header">
                <FaClock className="insight-icon" />
                <h3>Time Management</h3>
              </div>
              <div className="insight-content">
                <div className="metric">
                  <span className="metric-label">Efficiency</span>
                  <span className="metric-value">
                    {insights.timeManagement.efficiency || 'Good'}
                  </span>
                </div>
                <p className="insight-text">
                  {typeof insights.timeManagement === 'string' 
                    ? insights.timeManagement 
                    : insights.timeManagement.message || 'You\'re managing time well'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render recommendations
  const renderRecommendations = () => {
    if (!dashboard || !dashboard.insights || !dashboard.insights.recommendations) return null;

    const recommendations = dashboard.insights.recommendations;
    if (!Array.isArray(recommendations) || recommendations.length === 0) return null;

    return (
      <div className="recommendations-section">
        <h2 className="section-title">
          <FaBullseye /> Smart Recommendations
        </h2>
        <div className="recommendations-list">
          {recommendations.slice(0, 5).map((rec, index) => {
            // Handle both string and object recommendations
            const recText = typeof rec === 'string' ? rec : (rec.text || rec.message || rec);
            const recCategory = typeof rec === 'object' ? rec.category : 'general';
            const recPriority = typeof rec === 'object' ? rec.priority : 'medium';

            return (
              <div key={index} className={`recommendation-card priority-${recPriority}`}>
                <div className="rec-icon">
                  <FaRocket />
                </div>
                <div className="rec-content">
                  <p>{recText}</p>
                  {recCategory && recCategory !== 'general' && (
                    <span className="rec-category">{recCategory}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render smart reminders
  const renderReminders = () => {
    if (!dashboard || !dashboard.reminders) return null;

    const reminders = dashboard.reminders;
    if (!Array.isArray(reminders) || reminders.length === 0) return null;

    return (
      <div className="reminders-section">
        <h2 className="section-title">
          <FaClock /> Smart Reminders
        </h2>
        <div className="reminders-list">
          {reminders.map((reminder, index) => {
            // Handle both string and object reminders
            const reminderText = typeof reminder === 'string' 
              ? reminder 
              : (reminder.message || reminder.text || reminder);
            const reminderType = typeof reminder === 'object' ? reminder.type : 'info';

            return (
              <div key={index} className={`reminder-item ${reminderType}`}>
                <FaCheckCircle className="reminder-icon" />
                <p>{reminderText}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render daily summary
  const renderDailySummary = () => {
    if (!summary) return null;

    return (
      <div className="daily-summary-section">
        <h2 className="section-title">
          <FaCalendarDay /> Today's Summary
        </h2>
        <div className="summary-card">
          <p className="summary-text">{summary.text || 'No summary available'}</p>
          
          {summary.stats && (
            <div className="summary-stats">
              <div className="summary-stat">
                <FaCheckCircle />
                <span>{summary.stats.tasksCompleted || 0} tasks completed</span>
              </div>
              <div className="summary-stat">
                <FaLeaf />
                <span>{summary.stats.wellnessActivities || 0} wellness activities</span>
              </div>
              <div className="summary-stat">
                <FaHeart />
                <span>{summary.stats.emotionLogs || 0} emotion check-ins</span>
              </div>
            </div>
          )}

          {summary.breakdown && summary.breakdown.pointsEarned > 0 && (
            <div className="points-earned">
              <FaTrophy />
              <span>+{summary.breakdown.pointsEarned} points earned today!</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render analytics view
  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="analytics-view">
        <h2 className="section-title">
          <FaChartBar /> Performance Analytics
        </h2>

        <div className="analytics-grid">
          {/* Productivity Analytics */}
          {analytics.productivity && (
            <div className="analytics-card">
              <h3><FaChartLine /> Productivity Metrics</h3>
              <div className="analytics-content">
                <div className="metric-row">
                  <span>Completion Rate</span>
                  <strong>{analytics.productivity.completionRate || 0}%</strong>
                </div>
                <div className="metric-row">
                  <span>Total Completed</span>
                  <strong>{analytics.productivity.totalCompleted || 0}</strong>
                </div>
                <div className="metric-row">
                  <span>Average Priority</span>
                  <strong>{analytics.productivity.averagePriority || 0}/10</strong>
                </div>
                <div className="trend-indicator">
                  {getTrendIcon(analytics.productivity.trend)}
                  <span>{analytics.productivity.trend || 'Stable'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Emotional Analytics */}
          {analytics.emotional && (
            <div className="analytics-card">
              <h3><FaHeart /> Emotional Patterns</h3>
              <div className="analytics-content">
                <div className="metric-row">
                  <span>Dominant Mood</span>
                  <strong>{analytics.emotional.dominant || 'Neutral'}</strong>
                </div>
                {analytics.emotional.distribution && (
                  <div className="mood-chart">
                    {Object.entries(analytics.emotional.distribution).map(([mood, count]) => (
                      <div key={mood} className="mood-bar">
                        <span className="mood-label">{mood}</span>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${(count / Math.max(...Object.values(analytics.emotional.distribution))) * 100}%` }}
                          />
                        </div>
                        <span className="mood-value">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wellness Analytics */}
          {analytics.wellness && (
            <div className="analytics-card">
              <h3><FaLeaf /> Wellness Engagement</h3>
              <div className="analytics-content">
                <div className="metric-row">
                  <span>Status</span>
                  <strong>{analytics.wellness.status || 'Active'}</strong>
                </div>
                <div className="metric-row">
                  <span>Engagement Level</span>
                  <strong>{analytics.wellness.engagementLevel || 'Good'}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {/* Header with Brain Icon */}
      <div className="dashboard-header">
        <div className="brain-icon-wrapper">
          <FaBrain className="central-brain" />
          <div className="pulse-ring"></div>
          <div className="pulse-ring delayed"></div>
        </div>
        <h1>Central Brain</h1>
        <p>Your AI-powered command center</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {loading && <div className="loading-spinner">Initializing Central Brain...</div>}

      {/* View Selector */}
      <div className="view-selector">
        <button 
          className={`view-btn ${selectedView === 'overview' ? 'active' : ''}`}
          onClick={() => setSelectedView('overview')}
        >
          <FaBrain /> Overview
        </button>
        <button 
          className={`view-btn ${selectedView === 'analytics' ? 'active' : ''}`}
          onClick={() => setSelectedView('analytics')}
        >
          <FaChartBar /> Analytics
        </button>
        <button 
          className={`view-btn ${selectedView === 'insights' ? 'active' : ''}`}
          onClick={() => setSelectedView('insights')}
        >
          <FaStar /> Insights
        </button>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {selectedView === 'overview' && (
          <>
            {renderGreeting()}
            {renderQuickStats()}
            {renderDailySummary()}
            {renderReminders()}
          </>
        )}

        {selectedView === 'analytics' && (
          <>
            {renderAnalytics()}
          </>
        )}

        {selectedView === 'insights' && (
          <>
            {renderInsights()}
            {renderRecommendations()}
          </>
        )}
      </div>

      {/* Refresh Button */}
      <button className="refresh-btn" onClick={fetchDashboard} disabled={loading}>
        <FaBolt /> Refresh Brain
      </button>
    </div>
  );
};

export default Dashboard;
