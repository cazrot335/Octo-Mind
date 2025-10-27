import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaBrain,
  FaSmile,
  FaMeh,
  FaFrown,
  FaTired,
  FaFire,
  FaWind,
  FaHistory,
  FaChartLine,
  FaLightbulb,
  FaHeart
} from 'react-icons/fa';
import './EmotionTracker.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const API_BASE_URL = `${API_BASE}/api/emotion`;

const EmotionTracker = () => {
  // State
  const [textInput, setTextInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [breathingExercise, setBreathingExercise] = useState(null);
  const [showBreathing, setShowBreathing] = useState(false);

  // Quick mood options
  const QUICK_MOODS = [
    { value: 'great', label: '😄 Great', icon: FaSmile, color: '#00C896' },
    { value: 'good', label: '🙂 Good', icon: FaSmile, color: '#6C63FF' },
    { value: 'okay', label: '😐 Okay', icon: FaMeh, color: '#FFB84C' },
    { value: 'tired', label: '😴 Tired', icon: FaTired, color: '#9AA0A6' },
    { value: 'stressed', label: '😰 Stressed', icon: FaFire, color: '#FF4C4C' },
    { value: 'bad', label: '😔 Bad', icon: FaFrown, color: '#FF4C4C' }
  ];

  // Emotion colors
  const getEmotionColor = (emotion) => {
    const colors = {
      happy: '#00C896',
      excited: '#6C63FF',
      calm: '#00FFFF',
      neutral: '#9AA0A6',
      sad: '#FFB84C',
      anxious: '#FF4C4C',
      angry: '#FF4C4C',
      stressed: '#FF4C4C',
      tired: '#9AA0A6'
    };
    return colors[emotion?.toLowerCase()] || '#6C63FF';
  };

  // Fetch emotion history
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history?limit=20`);
      console.log('Emotion history response:', response.data);
      
      if (response.data.success || response.data.logs) {
        setHistory(response.data.logs || []);
        setTrends(response.data.trends || {});
      }
    } catch (error) {
      console.error('Error fetching emotion history:', error);
    }
  };

  // Analyze emotion from text
  const analyzeEmotion = async (e) => {
    e.preventDefault();
    
    if (!textInput.trim()) {
      alert('Please enter some text to analyze');
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, {
        text: textInput,
        context: {}
      });

      console.log('Emotion analysis response:', response.data);
      
      if (response.data.success || response.data.emotion) {
        setResult(response.data);
        setTextInput('');
        // Refresh history
        fetchHistory();
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      alert('Failed to analyze emotion. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Quick mood check-in
  const quickMoodCheckIn = async (mood) => {
    setAnalyzing(true);
    setResult(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/check-in`, {
        mood: mood
      });

      console.log('Quick check-in response:', response.data);
      
      if (response.data.success || response.data.emotion) {
        setResult({
          emotion: response.data.emotion,
          feedback: response.data.message,
          suggestions: response.data.suggestions || [],
          confidence: 100
        });
        // Refresh history
        fetchHistory();
      }
    } catch (error) {
      console.error('Error in quick check-in:', error);
      alert('Failed to process mood check-in. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Get breathing exercise
  const getBreathingExercise = async (intensity = 'normal') => {
    try {
      const response = await axios.get(`${API_BASE_URL}/breathing-exercise`, {
        params: { intensity }
      });

      console.log('Breathing exercise response:', response.data);
      
      if (response.data.success || response.data.exercise) {
        setBreathingExercise(response.data.exercise);
        setShowBreathing(true);
      }
    } catch (error) {
      console.error('Error getting breathing exercise:', error);
    }
  };

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="emotion-tracker">
      {/* Header */}
      <div className="emotion-header">
        <div className="header-title">
          <FaBrain className="brain-icon" />
          <h2>Emotion Tracker</h2>
        </div>
        <div className="header-actions">
          <button 
            className={`btn btn-secondary ${showHistory ? 'active' : ''}`}
            onClick={() => setShowHistory(!showHistory)}
          >
            <FaHistory /> History
          </button>
          <button 
            className="btn btn-ai"
            onClick={() => getBreathingExercise('normal')}
          >
            <FaWind /> Breathe
          </button>
        </div>
      </div>

      {/* Quick Mood Check-in */}
      <div className="quick-mood-section">
        <h3>
          <FaHeart /> Quick Mood Check-in
        </h3>
        <div className="mood-grid">
          {QUICK_MOODS.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.value}
                className="mood-btn"
                onClick={() => quickMoodCheckIn(mood.value)}
                disabled={analyzing}
                style={{ '--mood-color': mood.color }}
              >
                <Icon />
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Analysis */}
      <div className="text-analysis-section">
        <h3>
          <FaBrain /> Deep Emotion Analysis
        </h3>
        <form onSubmit={analyzeEmotion} className="analysis-form">
          <div className="form-group full-width">
            <label>How are you feeling? Share your thoughts...</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Express yourself freely... I'm here to understand and help."
              rows={5}
              disabled={analyzing}
            />
          </div>
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={analyzing || !textInput.trim()}
            >
              {analyzing ? 'Analyzing...' : <><FaBrain /> Analyze Emotion</>}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis Result */}
      {result && (
        <div className="emotion-result">
          <div className="result-header">
            <div className="emotion-badge" style={{ '--emotion-color': getEmotionColor(result.emotion) }}>
              <span className="emotion-name">{result.emotion}</span>
              {result.confidence && (
                <span className="confidence">{Math.round(result.confidence)}% confident</span>
              )}
            </div>
          </div>

      {result.feedback && (
        <div className="feedback-card">
          <h4><FaLightbulb /> AI Feedback</h4>
          {typeof result.feedback === 'string' ? (
            <p>{result.feedback}</p>
          ) : (
            <>
              <p className="feedback-message">{result.feedback.message}</p>
              
              {result.feedback.taskRecommendation && (
                <div className="task-recommendation">
                  <strong>💡 Task Recommendation:</strong>
                  <p>{result.feedback.taskRecommendation}</p>
                </div>
              )}
              
              {result.feedback.actionItems && result.feedback.actionItems.length > 0 && (
                <div className="action-items">
                  <strong>Action Items:</strong>
                  <ul>
                    {result.feedback.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}

          {result.reasoning && (
            <div className="reasoning-card">
              <h4><FaChartLine /> Analysis</h4>
              <p>{result.reasoning}</p>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div className="suggestions-card">
              <h4><FaLightbulb /> Suggestions</h4>
              <ul>
                {result.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Breathing Exercise Modal */}
      {showBreathing && breathingExercise && (
        <div className="modal-overlay" onClick={() => setShowBreathing(false)}>
          <div className="modal-content breathing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaWind /> {breathingExercise.name}</h3>
              <button className="close-btn" onClick={() => setShowBreathing(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="breathing-desc">{breathingExercise.description}</p>
              <div className="breathing-pattern">
                <div className="pattern-step">
                  <strong>Inhale:</strong> {breathingExercise.inhale} seconds
                </div>
                <div className="pattern-step">
                  <strong>Hold:</strong> {breathingExercise.hold} seconds
                </div>
                <div className="pattern-step">
                  <strong>Exhale:</strong> {breathingExercise.exhale} seconds
                </div>
                <div className="pattern-step">
                  <strong>Duration:</strong> {breathingExercise.duration}
                </div>
              </div>
              <p className="breathing-tip"><strong>Tip:</strong> {breathingExercise.tip}</p>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && (
        <div className="history-panel">
          <div className="history-header">
            <h3><FaHistory /> Emotion History</h3>
            <div className="history-stats">
              <span className="stat-badge">Total: {history.length}</span>
            </div>
          </div>

          {/* Trends */}
          {Object.keys(trends).length > 0 && (
            <div className="trends-section">
              <h4><FaChartLine /> Emotion Trends</h4>
              <div className="trend-bars">
                {Object.entries(trends)
                  .sort((a, b) => b[1] - a[1])
                  .map(([emotion, count]) => (
                    <div key={emotion} className="trend-bar">
                      <span className="trend-label">{emotion}</span>
                      <div className="trend-progress">
                        <div 
                          className="trend-fill"
                          style={{ 
                            width: `${(count / history.length) * 100}%`,
                            backgroundColor: getEmotionColor(emotion)
                          }}
                        />
                      </div>
                      <span className="trend-count">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* History List */}
          <div className="history-list">
            {history.length === 0 ? (
              <div className="empty-state">
                <p>No emotion logs yet. Start tracking your emotions!</p>
              </div>
            ) : (
              history.map((log) => (
                <div key={log.id} className="history-item">
                  <div className="history-emotion">
                    <span 
                      className="emotion-dot"
                      style={{ backgroundColor: getEmotionColor(log.emotion) }}
                    />
                    <strong>{log.emotion}</strong>
                  </div>
                  {log.text && <p className="history-text">{log.text}</p>}
                  <span className="history-time">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmotionTracker;
