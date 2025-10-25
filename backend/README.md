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
- `GET /api/tasks/:id` - Get a task by ID
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/prioritize` - AI prioritize tasks based on mood

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

### AI Prioritize Tasks

```bash
curl -X POST http://localhost:3000/api/tasks/prioritize \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "stressed"
  }'
```

**Mood options:** energetic, focused, stressed, tired, relaxed, anxious, happy, motivated, etc.

## Task Model

```javascript
{
  id: "auto-generated",
  name: "Task name",
  dueDate: "2025-10-30T10:00:00Z", // Optional
  category: "work", // work, study, personal, etc.
  mood: "focused", // Optional
  priority: 8, // 1-10, assigned by AI
  reason: "AI's reasoning for priority",
  createdAt: "2025-10-25T12:00:00Z"
}
```

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
