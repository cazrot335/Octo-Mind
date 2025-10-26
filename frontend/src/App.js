import React from 'react';
import TaskManager from './components/TaskManager';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>🐙 OctoMind</h1>
        <p className="tagline">AI-Powered Task Intelligence</p>
      </header>
      <main className="app-main">
        <TaskManager />
      </main>
    </div>
  );
}

export default App;
