import React, { useState } from 'react';
import TaskManager from './components/TaskManager';
import EmotionTracker from './components/EmotionTracker';
import './App.css';

function App() {
  const [activeModule, setActiveModule] = useState('tasks'); // tasks, emotions

  return (
    <div className="App">
      <header className="app-header">
        <h1>🐙 OctoMind</h1>
        <p className="tagline">AI-Powered Task Intelligence</p>
        
        {/* Module Navigation */}
        <nav className="module-nav">
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
            🧠 Emotions
          </button>
        </nav>
      </header>
      
      <main className="app-main">
        {activeModule === 'tasks' && <TaskManager />}
        {activeModule === 'emotions' && <EmotionTracker />}
      </main>
    </div>
  );
}

export default App;
