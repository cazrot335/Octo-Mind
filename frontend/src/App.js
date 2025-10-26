import React, { useState } from 'react';
import TaskManager from './components/TaskManager';
import EmotionTracker from './components/EmotionTracker';
import Scheduler from './components/Scheduler';
import WellnessGoals from './components/WellnessGoals';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard'); // dashboard, tasks, emotions, scheduler, wellness

  return (
    <div className="App">
      <header className="app-header">
        <h1>🐙 OctoMind</h1>
        <p className="tagline">AI-Powered Task Intelligence</p>
        
        {/* Module Navigation */}
        <nav className="module-nav">
          <button 
            className={`nav-btn ${activeModule === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveModule('dashboard')}
          >
            🧠 Dashboard
          </button>
          <button 
            className={`nav-btn ${activeModule === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveModule('tasks')}
          >
            ✅ Tasks
          </button>
          <button 
            className={`nav-btn ${activeModule === 'emotions' ? 'active' : ''}`}
            onClick={() => setActiveModule('emotions')}
          >
            💭 Emotions
          </button>
          <button 
            className={`nav-btn ${activeModule === 'scheduler' ? 'active' : ''}`}
            onClick={() => setActiveModule('scheduler')}
          >
            📅 Scheduler
          </button>
          <button 
            className={`nav-btn ${activeModule === 'wellness' ? 'active' : ''}`}
            onClick={() => setActiveModule('wellness')}
          >
            🌱 Wellness
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeModule === 'dashboard' && <Dashboard />}
        {activeModule === 'tasks' && <TaskManager />}
        {activeModule === 'emotions' && <EmotionTracker />}
        {activeModule === 'scheduler' && <Scheduler />}
        {activeModule === 'wellness' && <WellnessGoals />}
      </main>
    </div>
  );
}

export default App;
