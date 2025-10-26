# 🐙 OctoMind - AI-Powered Task Intelligence

> **Your intelligent companion for productivity, wellness, and emotional balance**

![Status](https://img.shields.io/badge/Status-Complete-success)
![Modules](https://img.shields.io/badge/Modules-5%2F5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Overview

**OctoMind** is a comprehensive AI-powered platform that combines task management, emotional tracking, intelligent scheduling, and wellness goals into one unified system. Built with React and powered by Groq AI, OctoMind acts as your personal productivity brain 🧠.

### Key Features

- 🎯 **AI Task Prioritization** - Smart task ranking based on urgency, importance, and mood
- 💭 **Emotion Tracking** - Deep emotional analysis with AI-generated insights
- 📅 **Intelligent Scheduler** - Energy-optimized daily schedules
- 🌱 **Wellness & Sustainability** - Gamified goal tracking with badges and streaks
- 🧠 **Central Brain Dashboard** - Unified insights from all modules

---

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager
- Firebase account with Firestore enabled
- Groq API key

### Installation

```bash
# Clone the repository
git clone https://github.com/cazrot335/Octo-Mind.git
cd Octo-Mind

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. **Backend Setup**:
   - Add your Firebase credentials to `backend/config/firebase.js`
   - Add your Groq API key to backend environment

2. **Frontend Setup**:
   - Frontend is pre-configured to use `http://localhost:3001`

### Running the Application

```bash
# Terminal 1: Start backend (port 3001)
cd backend
npm start

# Terminal 2: Start frontend (port 3000)
cd frontend
npm start
```

Open your browser to `http://localhost:3000` 🎉

---

## 📦 Project Structure

```
Octo-Mind/
├── backend/              # Express.js API server
│   ├── controllers/      # Request handlers (5 modules)
│   ├── services/         # Business logic & AI integration
│   ├── routes/           # API routes
│   └── config/           # Firebase configuration
│
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # 5 main modules
│   │   ├── App.js        # Main app with navigation
│   │   └── index.js      # Entry point
│   └── public/           # Static assets
│
└── docs/                 # Documentation (testing guides)
```

---

## 🎨 Modules

### 1. 🧠 Dashboard (Central Brain)
The command center that aggregates all your data into actionable insights.

**Features**:
- Time-based greetings (morning/afternoon/evening)
- Quick stats overview (tasks, mood, wellness, streaks)
- AI-generated daily summary
- Smart recommendations
- Performance analytics with charts
- Three view modes: Overview, Analytics, Insights

**Guide**: [MODULE_5_GUIDE.md](frontend/MODULE_5_GUIDE.md)

---

### 2. ✅ Task Manager
AI-powered task management with mood-aware prioritization.

**Features**:
- Create, edit, delete tasks
- AI prioritization using Groq
- Mood-based task creation
- Category filtering
- Completion tracking
- Priority scoring (1-10)

**Guide**: [MODULE_1_GUIDE.md](frontend/MODULE_1_GUIDE.md)

---

### 3. 💭 Emotion Tracker
Track and analyze your emotional patterns with AI insights.

**Features**:
- Quick mood check-in (6 moods)
- Deep text analysis
- Breathing exercises
- Emotion history with trends
- Mood distribution visualization
- AI-generated emotional insights

**Guide**: [MODULE_2_GUIDE.md](frontend/MODULE_2_GUIDE.md)

---

### 4. 📅 Scheduler
AI-optimized daily schedules based on your energy levels.

**Features**:
- Custom work preferences
- AI schedule generation
- Visual timeline (color-coded)
- Stats dashboard (focus/break time)
- Mood-based suggestions
- Schedule history

**Guide**: [MODULE_3_GUIDE.md](frontend/MODULE_3_GUIDE.md)

---

### 5. 🌱 Wellness Goals
Gamified wellness and sustainability tracking.

**Features**:
- 10 goal categories (wellness + sustainability)
- Points & leveling system
- Badge achievements (4 rarity levels)
- Dual streak tracking
- Progress dashboard
- Custom goal targets

**Guide**: [MODULE_4_GUIDE.md](frontend/MODULE_4_GUIDE.md)

---

## 🎯 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **AI**: Groq AI (llama-3.3-70b-versatile)
- **Middleware**: CORS, body-parser

### Frontend
- **Framework**: React 18.3.1
- **HTTP Client**: Axios 1.12.2
- **Icons**: React Icons 5.5.0
- **Animations**: Framer Motion 12.23.24
- **Styling**: Custom CSS3 (Dark Neural Theme)

---

## 🎨 Design System

### Dark Neural Theme
OctoMind features a consistent dark neural brain theme across all modules:

**Colors**:
- Background: Deep navy-black (#0b0f14)
- Primary Accent: Neon violet (#6C63FF)
- Secondary Accent: Cyan (#00FFFF)
- Tertiary Accent: Warm amber (#FFB84C)
- Success: Green (#00C896)
- Error: Red (#FF4C4C)

**Design Patterns**:
- Glassmorphism cards with backdrop blur
- Neon glow effects on hover
- Smooth transitions and animations
- Responsive grid layouts
- Card lift effects
- Pulse animations for key elements

---

## 📊 API Endpoints

### Tasks API (`/api/tasks`)
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/prioritize` - AI prioritize tasks

### Emotions API (`/api/emotion`)
- `POST /api/emotion/analyze` - Deep text analysis
- `POST /api/emotion/check-in` - Quick mood log
- `GET /api/emotion/breathing-exercise` - Get breathing guide
- `GET /api/emotion/history` - Fetch emotion logs

### Scheduler API (`/api/schedule`)
- `POST /api/schedule/generate` - Generate AI schedule
- `POST /api/schedule/reschedule` - Regenerate schedule
- `GET /api/schedule/history` - Fetch past schedules
- `GET /api/schedule/suggestions` - Get optimization tips

### Wellness API (`/api/wellness`)
- `POST /api/wellness/goals` - Create goal
- `GET /api/wellness/goals` - Fetch all goals
- `POST /api/wellness/complete/:goalId` - Complete goal
- `GET /api/wellness/progress` - Get user progress
- `GET /api/wellness/badges` - Fetch earned badges

### Dashboard API (`/api/dashboard`)
- `GET /api/dashboard` - Main dashboard data
- `GET /api/dashboard/summary` - Daily summary
- `GET /api/dashboard/analytics` - Performance analytics
- `GET /api/dashboard/reminders` - Smart reminders

**Total**: 27 API endpoints

---

## 🧪 Testing

Each module has a comprehensive testing guide:

1. **Module 1 Testing**: [MODULE_1_GUIDE.md](frontend/MODULE_1_GUIDE.md)
2. **Module 2 Testing**: [MODULE_2_GUIDE.md](frontend/MODULE_2_GUIDE.md)
3. **Module 3 Testing**: [MODULE_3_GUIDE.md](frontend/MODULE_3_GUIDE.md)
4. **Module 4 Testing**: [MODULE_4_GUIDE.md](frontend/MODULE_4_GUIDE.md)
5. **Module 5 Testing**: [MODULE_5_GUIDE.md](frontend/MODULE_5_GUIDE.md)

### Quick Test Flow

```bash
# 1. Start backend
cd backend && npm start

# 2. Start frontend
cd frontend && npm start

# 3. Open browser
open http://localhost:3000

# 4. Test each module
- Dashboard: View aggregated insights
- Tasks: Create and prioritize tasks
- Emotions: Log mood and get AI analysis
- Scheduler: Generate daily schedule
- Wellness: Create goals and earn badges
```

---

## 🛡️ Error Prevention

OctoMind implements comprehensive defensive coding to handle complex object responses from the backend:

```javascript
// Object type checking
typeof value === 'string' ? value : value.property

// Optional chaining
object?.nested?.property || fallback

// Array safety
Array.isArray(data) ? data : []

// Fallback values
{stat.count || 0}
```

**All modules tested and verified** ✅

---

## 📈 Performance

- **Component Code**: ~2,300+ lines
- **CSS Styling**: ~3,250+ lines
- **Total Endpoints**: 27 API routes
- **Modules**: 5 complete systems
- **Load Time**: < 2 seconds
- **Responsive**: Mobile-first design

---

## 🎓 Key Features Deep Dive

### AI Integration (Groq)
- **Task Prioritization**: Analyzes urgency, importance, dependencies
- **Emotion Analysis**: Deep sentiment analysis with insights
- **Schedule Optimization**: Energy-level based time blocking
- **Smart Recommendations**: Context-aware suggestions

### Gamification
- **Points System**: Earn points for goal completion
- **Streak Tracking**: Wellness & sustainability streaks
- **Badge System**: 4 rarity levels (Common → Legendary)
- **Leveling**: Progress through levels
- **Bonuses**: Streak multipliers

### Data Visualization
- **Progress Bars**: Task completion rates
- **Mood Charts**: Emotional distribution
- **Timeline View**: Daily schedule visualization
- **Stats Dashboard**: Multi-metric overviews
- **Trend Indicators**: Up/down/stable arrows

---

## 🚧 Troubleshooting

### Common Issues

**Port 3001 already in use**:
```bash
npx kill-port 3001
```

**Firebase connection error**:
- Check `backend/config/firebase.js` credentials
- Verify Firestore is enabled in Firebase Console

**CORS errors**:
- Backend is pre-configured for `http://localhost:3000`
- Check frontend API calls use correct base URL

**Empty data in modules**:
- Ensure backend is running
- Create test data in each module first

---

## 📝 Documentation

- **Project Complete**: [PROJECT_COMPLETE.md](PROJECT_COMPLETE.md)
- **Module Guides**: [frontend/MODULE_X_GUIDE.md](frontend/)
- **Backend Guides**: [backend/README.md](backend/README.md)
- **Code Comments**: JSDoc-style in all files

---

## 🎯 Roadmap

### Completed ✅
- [x] Backend API (5 modules)
- [x] Frontend UI (5 modules)
- [x] AI Integration (Groq)
- [x] Dark Neural Theme
- [x] Responsive Design
- [x] Error Prevention
- [x] Documentation

### Future Enhancements 🚀
- [ ] User Authentication (Firebase Auth)
- [ ] Multi-user Support
- [ ] Data Export (CSV/JSON)
- [ ] Dark/Light Theme Toggle
- [ ] Browser Notifications
- [ ] Calendar Integration (Google Calendar)
- [ ] Mobile App (React Native)
- [ ] Voice Input
- [ ] Advanced Charts (Chart.js)
- [ ] Social Features

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👏 Acknowledgments

- **Groq AI** - For powerful AI capabilities
- **Firebase** - For backend infrastructure
- **React Team** - For the amazing framework
- **React Icons** - For comprehensive icon library
- **Framer Motion** - For animation capabilities

---

## 📞 Support

For support, please:
1. Check the module testing guides
2. Review the troubleshooting section
3. Open an issue on GitHub

---

## 🎉 Getting Started

```bash
# Quick start
git clone https://github.com/cazrot335/Octo-Mind.git
cd Octo-Mind

# Backend
cd backend && npm install && npm start

# Frontend (new terminal)
cd frontend && npm install && npm start

# Open browser
open http://localhost:3000
```

**Welcome to OctoMind! Your AI-powered productivity companion awaits! 🐙🧠**

---

**Built with 🧠 by the OctoMind Team**  
**Powered by Groq AI | React | Firebase**