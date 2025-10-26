import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCalendarAlt,
  FaClock,
  FaPlay,
  FaRedo,
  FaHistory,
  FaLightbulb,
  FaCoffee,
  FaTasks,
  FaBrain,
  FaChartBar,
  FaCog
} from 'react-icons/fa';
import './Scheduler.css';

const API_BASE_URL = 'http://localhost:3001/api/schedule';

const Scheduler = () => {
  // State
  const [schedule, setSchedule] = useState([]);
  const [stats, setStats] = useState(null);
  const [mood, setMood] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  // Preferences
  const [preferences, setPreferences] = useState({
    workStart: '09:00',
    workEnd: '18:00',
    breakDuration: 10,
    breakInterval: 90
  });

  // Fetch schedule history
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history?limit=7`);
      console.log('Schedule history response:', response.data);
      
      if (response.data.success || response.data.schedules) {
        setHistory(response.data.schedules || []);
      }
    } catch (error) {
      console.error('Error fetching schedule history:', error);
    }
  };

  // Generate schedule
  const generateSchedule = async () => {
    setGenerating(true);
    setSchedule([]);
    setStats(null);
    setRecommendations([]);

    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, {
        preferences: preferences
      });

      console.log('Schedule generation response:', response.data);
      
      if (response.data.success || response.data.schedule) {
        setSchedule(response.data.schedule || []);
        setStats(response.data.stats || null);
        setMood(response.data.mood || 'neutral');
        setWorkHours(response.data.workHours || '');
        setRecommendations(response.data.recommendations || []);
        
        // Refresh history
        fetchHistory();
      }
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert('Failed to generate schedule. Make sure you have pending tasks!');
    } finally {
      setGenerating(false);
    }
  };

  // Reschedule
  const reschedule = async () => {
    setGenerating(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/reschedule`, {
        preferences: preferences
      });

      console.log('Reschedule response:', response.data);
      
      if (response.data.success || response.data.schedule) {
        setSchedule(response.data.schedule || []);
        setStats(response.data.stats || null);
        setMood(response.data.mood || 'neutral');
        setWorkHours(response.data.workHours || '');
        setRecommendations(response.data.recommendations || []);
        
        fetchHistory();
      }
    } catch (error) {
      console.error('Error rescheduling:', error);
      alert('Failed to reschedule.');
    } finally {
      setGenerating(false);
    }
  };

  // Get suggestions for a specific mood
  const getSuggestions = async (moodValue) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/suggestions`, {
        params: { mood: moodValue }
      });

      console.log('Suggestions response:', response.data);
      
      if (response.data.success || response.data.suggestions) {
        setSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    }
  };

  // Get color for task type
  const getTypeColor = (type) => {
    const colors = {
      task: '#6C63FF',
      break: '#00FFFF',
      buffer: '#FFB84C'
    };
    return colors[type] || '#9AA0A6';
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Get suggestions when mood changes
  useEffect(() => {
    if (mood) {
      getSuggestions(mood);
    }
  }, [mood]);

  return (
    <div className="scheduler">
      {/* Header */}
      <div className="scheduler-header">
        <div className="header-title">
          <FaCalendarAlt className="calendar-icon" />
          <h2>Smart Scheduler</h2>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowSettings(!showSettings)}
          >
            <FaCog /> Settings
          </button>
          <button 
            className={`btn btn-secondary ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            <FaHistory /> History
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3><FaCog /> Schedule Preferences</h3>
          <div className="settings-grid">
            <div className="setting-group">
              <label>Work Start</label>
              <input
                type="time"
                value={preferences.workStart}
                onChange={(e) => setPreferences({...preferences, workStart: e.target.value})}
              />
            </div>
            <div className="setting-group">
              <label>Work End</label>
              <input
                type="time"
                value={preferences.workEnd}
                onChange={(e) => setPreferences({...preferences, workEnd: e.target.value})}
              />
            </div>
            <div className="setting-group">
              <label>Break Duration (min)</label>
              <input
                type="number"
                value={preferences.breakDuration}
                onChange={(e) => setPreferences({...preferences, breakDuration: parseInt(e.target.value)})}
                min="5"
                max="30"
              />
            </div>
            <div className="setting-group">
              <label>Break Interval (min)</label>
              <input
                type="number"
                value={preferences.breakInterval}
                onChange={(e) => setPreferences({...preferences, breakInterval: parseInt(e.target.value)})}
                min="30"
                max="180"
              />
            </div>
          </div>
        </div>
      )}

      {/* Generate Controls */}
      <div className="generate-section">
        <div className="generate-info">
          <p className="info-text">
            <FaBrain /> AI will analyze your pending tasks and current mood to create an optimized schedule
          </p>
        </div>
        <div className="generate-actions">
          <button 
            className="btn btn-primary btn-large"
            onClick={generateSchedule}
            disabled={generating}
          >
            {generating ? 'Generating...' : <><FaPlay /> Generate Schedule</>}
          </button>
          {schedule.length > 0 && (
            <button 
              className="btn btn-ai"
              onClick={reschedule}
              disabled={generating}
            >
              <FaRedo /> Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Schedule Display */}
      {schedule.length > 0 && (
        <div className="schedule-container">
          {/* Schedule Header */}
          <div className="schedule-info-bar">
            <div className="info-item">
              <FaClock />
              <span>{workHours}</span>
            </div>
            <div className="info-item mood-indicator">
              <FaBrain />
              <span>Mood: <strong>{mood}</strong></span>
            </div>
            {stats && (
              <div className="info-item">
                <FaTasks />
                <span>{stats.totalTasks} tasks scheduled</span>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="timeline">
            {schedule.map((slot, index) => (
              <div 
                key={index} 
                className={`timeline-item ${slot.type}`}
                style={{ '--item-color': getTypeColor(slot.type) }}
              >
                <div className="time-marker">
                  <FaClock />
                  <span className="time-text">{formatTime(slot.startTime)}</span>
                </div>
                
                <div className="item-content">
                  {slot.type === 'task' && slot.task && (
                    <>
                      <div className="item-header">
                        <h4>{slot.task.title || 'Untitled Task'}</h4>
                        <span className="duration">{slot.duration} min</span>
                      </div>
                      {slot.task.category && (
                        <span className="category-badge">{slot.task.category}</span>
                      )}
                      {slot.task.difficulty && (
                        <div className="difficulty-bar">
                          <span className="difficulty-label">Difficulty:</span>
                          <div className="difficulty-fill" style={{ width: `${slot.task.difficulty * 10}%` }} />
                        </div>
                      )}
                    </>
                  )}
                  
                  {slot.type === 'break' && (
                    <div className="break-content">
                      <FaCoffee />
                      <span>Break Time</span>
                      <span className="duration">{slot.duration} min</span>
                    </div>
                  )}
                  
                  {slot.type === 'buffer' && (
                    <div className="buffer-content">
                      <span>Buffer Time / Prep</span>
                      <span className="duration">{slot.duration} min</span>
                    </div>
                  )}
                </div>
                
                <div className="item-end-time">
                  {formatTime(slot.endTime)}
                </div>
              </div>
            ))}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="stats-cards">
              <div className="stat-card">
                <FaTasks className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats.totalTasks}</span>
                  <span className="stat-label">Tasks</span>
                </div>
              </div>
              <div className="stat-card">
                <FaClock className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats.totalWorkMinutes} min</span>
                  <span className="stat-label">Work Time</span>
                </div>
              </div>
              <div className="stat-card">
                <FaCoffee className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats.totalBreaks}</span>
                  <span className="stat-label">Breaks</span>
                </div>
              </div>
              <div className="stat-card">
                <FaChartBar className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-value">{stats.utilizationRate}%</span>
                  <span className="stat-label">Utilization</span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <div className="recommendations-card">
              <h3><FaLightbulb /> AI Recommendations</h3>
              <ul>
                {recommendations.map((rec, index) => (
                  <li key={index}>
                    {rec.icon && <span className="rec-icon">{rec.icon}</span>}
                    {typeof rec === 'string' ? rec : rec.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mood-Based Suggestions */}
          {suggestions && (
            <div className="suggestions-panel">
              <h3><FaBrain /> Suggestions for {suggestions.mood} mood</h3>
              
              {suggestions.workSchedule && (
                <div className="suggestion-item">
                  <strong>Work Schedule:</strong>
                  <p>{suggestions.workSchedule.suggestion}</p>
                  <p className="suggestion-detail">
                    <FaClock /> {suggestions.workSchedule.recommended}
                  </p>
                  <p className="suggestion-reason">{suggestions.workSchedule.reason}</p>
                </div>
              )}
              
              {suggestions.breakPattern && (
                <div className="suggestion-item">
                  <strong>Break Pattern:</strong>
                  <p><FaCoffee /> {suggestions.breakPattern.frequency} for {suggestions.breakPattern.duration}</p>
                  <p className="suggestion-reason">{suggestions.breakPattern.reason}</p>
                </div>
              )}
              
              {suggestions.taskOrdering && (
                <div className="suggestion-item">
                  <strong>Task Ordering:</strong>
                  <p>{suggestions.taskOrdering}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!generating && schedule.length === 0 && (
        <div className="empty-state">
          <FaCalendarAlt className="empty-icon" />
          <p>No schedule generated yet</p>
          <p className="empty-hint">Click "Generate Schedule" to create your optimized daily plan</p>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="history-panel">
          <div className="history-header">
            <h3><FaHistory /> Schedule History</h3>
            <span className="history-count">{history.length} schedules</span>
          </div>
          
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <p>No schedule history yet</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-date">
                    <FaCalendarAlt />
                    <strong>{new Date(item.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div className="history-details">
                    <span className="history-mood">Mood: {item.mood}</span>
                    <span className="history-tasks">{item.totalSlots} slots</span>
                    <span className="history-time">{item.workHours}</span>
                  </div>
                  <div className="history-time-ago">
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
