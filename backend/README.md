# Octo-Mind Backend

AI-powered task management system using Express.js, Firebase Firestore, and Ollama (Free & Open Source AI).

## Features

- ✅ Create, Read, Update, Delete tasks
- 🧠 AI-powered task prioritization based on user mood
- 🔥 Firebase Firestore database
- 🤖 Ollama (Free & Open Source) for AI
- 📝 Task categories (work, study, personal)
- 📅 Optional due dates
- 😊 Mood-based task management

## Prerequisites

1. **Node.js** (v16 or higher)
2. **Firebase Project** with Firestore enabled
3. **Ollama** installed locally (for AI features)

## Setup Instructions

### 1. Install Ollama (Free AI)

**Windows:**
```bash
# Download from https://ollama.com/download
# Or use winget:
winget install Ollama.Ollama
```

**After installation, pull a model:**
```bash
ollama pull llama3.2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firestore Database
4. Go to Project Settings > Service Accounts
5. Click "Generate New Private Key"
6. Download the JSON file

### 4. Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Fill in your Firebase credentials from the downloaded JSON:
```env
PORT=3000

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### 5. Start Ollama Service

Make sure Ollama is running:
```bash
ollama serve
```

### 6. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Tasks

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/pending` - Get only pending (not completed) tasks
- `GET /api/tasks/completed` - Get only completed tasks
- `GET /api/tasks/:id` - Get a task by ID
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `PATCH /api/tasks/:id/done` - Mark a task as done
- `PATCH /api/tasks/:id/undone` - Mark a task as undone
- `POST /api/tasks/prioritize` - AI prioritize tasks based on mood

### Emotion Analysis

- `POST /api/emotion/analyze` - Analyze emotion from text
- `POST /api/emotion/check-in` - Quick mood check-in
- `GET /api/emotion/breathing-exercise` - Get breathing exercise
- `GET /api/emotion/history` - Get emotion history/trends

### Smart Scheduler

- `POST /api/schedule/generate` - Generate smart daily schedule
- `POST /api/schedule/reschedule` - Update schedule based on changes
- `GET /api/schedule/history` - Get schedule history
- `GET /api/schedule/suggestions` - Get scheduling suggestions based on mood

### Health Check

- `GET /health` - Server health check

## API Usage Examples

### Create a Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete project documentation",
    "dueDate": "2025-10-30T10:00:00Z",
    "category": "work",
    "mood": "focused"
  }'
```

### Get All Tasks

```bash
curl http://localhost:3000/api/tasks
```

### Get Pending Tasks Only

```bash
curl http://localhost:3000/api/tasks/pending
```

### Get Completed Tasks Only

```bash
curl http://localhost:3000/api/tasks/completed
```

### Mark Task as Done

```bash
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID/done
```

### Mark Task as Undone

```bash
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID/undone
```

### AI Prioritize Tasks

```bash
curl -X POST http://localhost:3000/api/tasks/prioritize \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "stressed"
  }'
```

**Mood options:** energetic, focused, stressed, tired, relaxed, anxious, happy, motivated, etc.

## Emotion Analysis Examples

### Analyze Emotion from Text

```bash
curl -X POST http://localhost:3000/api/emotion/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling exhausted after back-to-back meetings",
    "context": {
      "timeOfDay": "afternoon",
      "taskCount": 5
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "emotion": "tired",
  "confidence": 0.92,
  "reasoning": "AI detected exhaustion and fatigue from text",
  "suggestions": [
    "Take a 15-minute power nap if possible",
    "Reorder tasks - do critical ones now, defer others",
    "Consider rescheduling less urgent tasks for tomorrow"
  ],
  "feedback": {
    "message": "You sound exhausted. Your wellbeing comes first!",
    "actionItems": ["Take a 15-minute power nap if possible"],
    "taskRecommendation": "Do only the most critical task now, defer the rest."
  },
  "aiUsed": true
}
```

### Quick Mood Check-In

```bash
curl -X POST http://localhost:3000/api/emotion/check-in \
  -H "Content-Type: application/json" \
  -d '{"mood": "stressed"}'
```

### Get Breathing Exercise

```bash
# Normal intensity (default)
curl http://localhost:3000/api/emotion/breathing-exercise

# Light intensity
curl http://localhost:3000/api/emotion/breathing-exercise?intensity=light

# Intense (for high stress)
curl http://localhost:3000/api/emotion/breathing-exercise?intensity=intense
```

### Get Emotion History

```bash
curl http://localhost:3000/api/emotion/history?limit=10
```

---

## 📅 Smart Scheduler Examples

### Generate Daily Schedule

**Automatically uses pending tasks and recent mood:**

```bash
curl -X POST http://localhost:3000/api/schedule/generate \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "workStart": "09:00",
      "workEnd": "18:00",
      "breakDuration": 10,
      "breakInterval": 90
    }
  }'
```

> **Note:** The scheduler automatically:
> - Fetches all pending tasks from your task list
> - Detects your most recent mood from emotion logs
> - Uses `neutral` as default if no emotion logs exist
> - You can override preferences, or use defaults (9am-6pm, 10min breaks every 90min)

**Response:**
```json
{
  "success": true,
  "mood": "energetic",
  "moodSource": "auto-detected from logs",
  "workHours": "09:00 - 18:00",
  "schedule": [
    {
      "type": "task",
      "taskId": "task123",
      "title": "Complete project proposal",
      "category": "work",
      "priority": 10,
      "difficulty": 8,
      "startTime": "09:00",
      "endTime": "10:30",
      "duration": 90
    },
    {
      "type": "break",
      "startTime": "10:30",
      "endTime": "10:40",
      "duration": 10,
      "title": "☕ Break Time"
    }
  ],
  "stats": {
    "totalTasks": 5,
    "totalTaskTime": 300,
    "totalBreakTime": 30,
    "freeTime": 210,
    "overflowTasks": 2,
    "workloadPercentage": 61
  },
  "recommendations": [
    {
      "type": "productivity",
      "message": "Great energy! Your hardest tasks are scheduled first.",
      "icon": "💪"
    }
  ]
}
```

### Get Scheduling Suggestions

```bash
curl "http://localhost:3000/api/schedule/suggestions?mood=tired"
```

### Reschedule After Task Completion

**Automatically uses recent mood or you can override:**

```bash
curl -X POST http://localhost:3000/api/schedule/reschedule \
  -H "Content-Type: application/json" \
  -d '{
    "action": "remove",
    "taskId": "task123"
  }'
```

> **Note:** Mood is optional - it will auto-detect from emotion logs if not provided
    "action": "remove",
    "taskId": "task123"
  }'
```

### Get Schedule History

```bash
curl "http://localhost:3000/api/schedule/history?limit=7"
```

---

## 🎯 Complete Daily Workflow

```bash
# Morning: Check mood
curl -X POST http://localhost:3000/api/emotion/check-in \
  -H "Content-Type: application/json" \
  -d '{"mood": "energetic"}'

# Add tasks
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete project proposal",
    "category": "work",
    "estimatedDuration": 90
  }'

# Generate smart schedule
curl -X POST http://localhost:3000/api/schedule/generate \
  -H "Content-Type: application/json" \
  -d '{"mood": "energetic"}'

# Afternoon: Mood changes, reschedule
curl -X POST http://localhost:3000/api/schedule/reschedule \
  -H "Content-Type: application/json" \
  -d '{"mood": "tired"}'

# Complete task
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID/done

# Evening: Review trends
curl http://localhost:3000/api/emotion/history?limit=7
```

---


## Task Model

```javascript
{
  id: "auto-generated",
  name: "Task name",
  dueDate: "2025-10-30T10:00:00Z", // Optional
  category: "work", // work, study, personal, exercise, meeting
  mood: "focused", // Optional
  priority: 8, // 1-10, assigned by AI
  reason: "AI's reasoning for priority",
  estimatedDuration: 60, // minutes (default: 60)
  isCompleted: false, // true when task is done
  completedAt: null, // timestamp when completed
  createdAt: "2025-10-25T12:00:00Z"
}
```

## How Smart Scheduler Works

### 1. Mood-Based Task Adjustment

| Mood | Scheduling Strategy |
|------|-------------------|
| **Energetic** | Hard tasks first while energy is high |
| **Tired** | Easy tasks first, complex work later |
| **Stressed** | Quick wins first to reduce overwhelm |
| **Neutral/Happy** | Priority-based, balanced approach |

### 2. Automatic Time Allocation

- Assigns time slots based on `estimatedDuration` (default: 60 mins)
- Inserts 10-min breaks every 90 minutes of work
- Detects overflow (tasks that don't fit) and suggests moving to next day
- Respects work hours (configurable, default 9 AM - 6 PM)

### 3. Task Difficulty Estimation

Tasks are automatically rated 1-10 based on:
- **Category**: work=7, study=8, personal=4, exercise=6, meeting=5
- **Priority level**: Higher priority often = more difficult
- **Keywords**: "complex", "difficult" → +2 difficulty; "quick", "simple" → -2

### 4. Smart Recommendations

The scheduler provides context-aware suggestions:
- ⚠️ **Workload warnings** when schedule >90% full
- 💡 **Free time suggestions** when <40% utilized
- 📅 **Overflow management** for tasks that don't fit
- 😴 **Health tips** based on mood (tired → more breaks)
- 💪 **Productivity tips** based on energy levels

---

## How AI Prioritization Works

1. User sets their current mood
2. AI analyzes all tasks considering:
   - User's current mood
   - Task deadlines
   - Task categories
   - Individual task moods
3. AI assigns priority (1-10) to each task
4. Tasks are reordered by priority
5. AI provides reasoning for each priority

## Tech Stack

- **Express.js** - Web framework
- **Firebase Firestore** - NoSQL database
- **Ollama** - Free & open-source AI (runs locally)
- **Node.js** - Runtime environment

## Alternative AI Models

You can use different Ollama models:

```bash
# Install other models
ollama pull mistral
ollama pull phi3
ollama pull codellama

# Update .env
OLLAMA_MODEL=mistral
```

## Troubleshooting

**Ollama not running:**
```bash
ollama serve
```

**Firebase authentication error:**
- Check your `.env` file
- Ensure private key has proper line breaks (`\n`)

**AI not working:**
- Falls back to simple date-based prioritization
- Check Ollama is running: `ollama list`

## License

MIT
