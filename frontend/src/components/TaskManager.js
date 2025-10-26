import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaCheck, 
  FaTimes, 
  FaBrain, 
  FaFilter,
  FaTrash,
  FaCalendarAlt,
  FaStar
} from 'react-icons/fa';
import axios from 'axios';
import './TaskManager.css';

const API_URL = 'http://localhost:3001/api/tasks';

const CATEGORIES = ['work', 'study', 'personal', 'health', 'other'];
const MOODS = [
  { value: 'energetic', label: '⚡ Energetic', emoji: '⚡' },
  { value: 'focused', label: '🎯 Focused', emoji: '🎯' },
  { value: 'stressed', label: '😰 Stressed', emoji: '😰' },
  { value: 'tired', label: '😴 Tired', emoji: '😴' },
  { value: 'relaxed', label: '😌 Relaxed', emoji: '😌' },
  { value: 'anxious', label: '😟 Anxious', emoji: '😟' },
  { value: 'happy', label: '😊 Happy', emoji: '😊' },
  { value: 'motivated', label: '💪 Motivated', emoji: '💪' },
  { value: 'neutral', label: '😐 Neutral', emoji: '😐' }
];

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentMood, setCurrentMood] = useState('neutral'); // Current user mood
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'work',
    priority: 5,
    dueDate: ''
  });

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Debug: Log tasks whenever they change
  useEffect(() => {
    console.log('Tasks state updated:', tasks);
    console.log('Number of tasks:', tasks.length);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      console.log('Full Response:', response);
      console.log('Response Data:', response.data);
      console.log('Tasks Array:', response.data.tasks);
      
      // Backend returns { tasks: [...] } without success field
      if (response.data && response.data.tasks) {
        setTasks(response.data.tasks || []);
        console.log('Tasks set to state:', response.data.tasks);
      } else {
        console.error('Invalid response format');
        setTasks([]);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to fetch tasks: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Task name is required!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(API_URL, {
        name: formData.name,
        category: formData.category,
        priority: parseInt(formData.priority),
        dueDate: formData.dueDate || undefined
      });

      // Backend returns { message, task } without success field
      if (response.data && response.data.task) {
        setTasks([response.data.task, ...tasks]);
        setFormData({ name: '', category: 'work', priority: 5, dueDate: '' });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    try {
      setLoading(true);
      const endpoint = currentStatus ? 'undone' : 'done';
      const response = await axios.patch(`${API_URL}/${taskId}/${endpoint}`);
      
      // Backend returns { message, task } format
      if (response.data && response.data.task) {
        setTasks(tasks.map(task => 
          task.id === taskId 
            ? response.data.task
            : task
        ));
      } else {
        // Fallback: update locally if backend doesn't return task
        setTasks(tasks.map(task => 
          task.id === taskId 
            ? { ...task, isCompleted: !currentStatus, completedAt: !currentStatus ? new Date().toISOString() : null }
            : task
        ));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const prioritizeTasks = async () => {
    if (!currentMood) {
      alert('Please select your current mood first!');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/prioritize`, {
        mood: currentMood
      });
      
      if (response.data && response.data.success) {
        const { message, totalTasks, aiUsed, userMood } = response.data;
        alert(
          `✨ AI Prioritization Complete!\n\n` +
          `${message}\n\n` +
          `Your Mood: ${userMood}\n` +
          `Tasks Prioritized: ${totalTasks}\n` +
          `AI Used: ${aiUsed ? 'Yes ✓ (Groq AI)' : 'Fallback logic'}`
        );
        fetchTasks(); // Refresh to get updated priorities
      }
    } catch (error) {
      console.error('Error prioritizing tasks:', error);
      alert('Failed to prioritize tasks: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.isCompleted;
    if (filter === 'completed') return task.isCompleted;
    return true;
  });

  console.log('Filtered tasks:', filteredTasks);
  console.log('Current filter:', filter);

  const getPriorityColor = (priority) => {
    if (priority >= 8) return '#f56565'; // Red - High
    if (priority >= 5) return '#ed8936'; // Orange - Medium
    return '#48bb78'; // Green - Low
  };

  const getPriorityLabel = (priority) => {
    if (priority >= 8) return 'High';
    if (priority >= 5) return 'Medium';
    return 'Low';
  };

  return (
    <div className="task-manager">
      {/* Mood Selector */}
      <div className="mood-selector">
        <label htmlFor="mood-select">
          😊 How are you feeling today?
        </label>
        <select 
          id="mood-select"
          value={currentMood} 
          onChange={(e) => setCurrentMood(e.target.value)}
          className="mood-dropdown"
        >
          {MOODS.map(mood => (
            <option key={mood.value} value={mood.value}>
              {mood.label}
            </option>
          ))}
        </select>
      </div>

      {/* Header Controls */}
      <div className="task-header">
        <div className="stats">
          <div className="stat-card">
            <span className="stat-number">{tasks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{tasks.filter(t => !t.isCompleted).length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{tasks.filter(t => t.isCompleted).length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <FaPlus /> Add Task
          </button>
          <button 
            className="btn btn-ai"
            onClick={prioritizeTasks}
            disabled={loading || tasks.filter(t => !t.isCompleted).length === 0}
          >
            <FaBrain /> AI Prioritize
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="add-task-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <form onSubmit={addTask}>
              <h3>✨ New Task</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Task Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Complete project proposal"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Due Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  <FaCheck /> Create Task
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowAddForm(false)}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Buttons */}
      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <FaFilter /> All ({tasks.length})
        </button>
        <button
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({tasks.filter(t => !t.isCompleted).length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          <FaCheck /> Completed ({tasks.filter(t => t.isCompleted).length})
        </button>
      </div>

      {/* Task List */}
      <div className="task-list">
        {loading && <div className="loader">Loading...</div>}
        
        {!loading && filteredTasks.length === 0 && (
          <div className="empty-state">
            <p>🎯 No tasks found!</p>
            <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
              <FaPlus /> Add Your First Task
            </button>
          </div>
        )}

        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              className={`task-card ${task.isCompleted ? 'completed' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              layout
            >
              <div className="task-content">
                <button
                  className="checkbox"
                  onClick={() => toggleTask(task.id, task.isCompleted)}
                  disabled={loading}
                >
                  {task.isCompleted && <FaCheck />}
                </button>

                <div className="task-info">
                  <h4 className={task.isCompleted ? 'strikethrough' : ''}>
                    {task.name}
                  </h4>
                  <div className="task-meta">
                    <span className="category-badge">{task.category}</span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      <FaStar /> {getPriorityLabel(task.priority)} ({task.priority})
                    </span>
                    {task.dueDate && (
                      <span className="due-date">
                        <FaCalendarAlt /> {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="delete-btn"
                onClick={() => deleteTask(task.id)}
                disabled={loading}
              >
                <FaTrash />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default TaskManager;
