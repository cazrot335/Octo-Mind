# Module 2: Emotion Tracker - Testing Guide

## Overview
The **Emotion Tracker** module helps users track their emotional state through AI-powered text analysis and quick mood check-ins. It provides personalized feedback, breathing exercises, and historical emotion trends.

## Features Implemented

### 1. Quick Mood Check-in
- **6 Mood Buttons**: Great, Good, Okay, Tired, Stressed, Bad
- **Color-coded** with neural theme
- **Instant AI feedback** based on mood selection
- **Suggestions** for mood improvement

### 2. Deep Emotion Analysis
- **Text Input**: Users can express themselves freely
- **AI Analysis** using Groq AI
- **Detailed Results**:
  - Detected emotion with confidence level
  - AI reasoning for the emotion detection
  - Personalized feedback
  - Actionable suggestions

### 3. Breathing Exercises
- **Guided breathing patterns** based on intensity
- **Modal display** with:
  - Inhale/Hold/Exhale timing
  - Duration recommendation
  - Helpful tips

### 4. Emotion History
- **Timeline view** of all logged emotions
- **Trend analysis** with visual bars
- **Emotion frequency** statistics
- **Searchable history** (most recent 20 entries)

### 5. UI Features
- **Dark Neural Theme** consistent with TaskManager
- **Glassmorphism** effects
- **Neon glows** and animations
- **Responsive design** for mobile/tablet
- **Smooth transitions** and hover effects

## API Endpoints Used

### Backend Running on: `http://localhost:3001`

1. **POST** `/api/emotions/analyze`
   - Analyzes emotion from text input
   - Returns: emotion, confidence, reasoning, suggestions, feedback

2. **POST** `/api/emotions/check-in`
   - Quick mood check-in
   - Returns: emotion, message, suggestions

3. **GET** `/api/emotions/breathing-exercise?intensity=normal`
   - Gets breathing exercise recommendation
   - Params: intensity (light, normal, intense)
   - Returns: exercise details

4. **GET** `/api/emotions/history?limit=20`
   - Fetches emotion history
   - Returns: logs array, trends object

## Testing Steps

### Step 1: Start Backend
```bash
cd backend
node app.js
# Backend should be running on port 3001
```

### Step 2: Start Frontend
```bash
cd frontend
npm start
# Frontend should open on http://localhost:3000
```

### Step 3: Navigate to Emotion Tracker
- Click the **🧠 Emotions** button in the navigation

### Step 4: Test Quick Mood Check-in
1. Click any mood button (e.g., "😄 Great")
2. Verify:
   - ✅ Emotion badge appears with detected emotion
   - ✅ AI feedback message displays
   - ✅ Suggestions are shown (2 items)
   - ✅ Result card animates in smoothly

### Step 5: Test Deep Emotion Analysis
1. Type in the textarea: "I'm feeling overwhelmed with all my tasks and deadlines"
2. Click **Analyze Emotion**
3. Verify:
   - ✅ Loading state shows ("Analyzing...")
   - ✅ Emotion is detected (e.g., "stressed" or "anxious")
   - ✅ Confidence percentage displays
   - ✅ AI reasoning explains the detection
   - ✅ Personalized feedback is shown
   - ✅ Multiple suggestions appear

### Step 6: Test Breathing Exercise
1. Click **Breathe** button in header
2. Verify:
   - ✅ Modal overlay appears
   - ✅ Breathing pattern details show (Inhale/Hold/Exhale)
   - ✅ Duration and tip are displayed
   - ✅ Close button (×) works
   - ✅ Clicking outside modal closes it

### Step 7: Test Emotion History
1. Click **History** button in header
2. Verify:
   - ✅ History panel slides in
   - ✅ Total count badge shows
   - ✅ Trend bars display emotion frequencies
   - ✅ History items show with:
     - Color-coded emotion dots
     - Emotion name
     - Original text (if available)
     - Timestamp
   - ✅ Scrollable list if > 10 items

### Step 8: Test UI Theme
Verify the dark neural theme:
- ✅ Dark glassmorphic backgrounds
- ✅ Neon violet/cyan accents
- ✅ Smooth hover effects
- ✅ Pulsating brain icon
- ✅ Animated mood buttons
- ✅ Glowing emotion badges
- ✅ Neural rotation effect in background

### Step 9: Test Responsive Design
1. Resize browser to mobile width (< 768px)
2. Verify:
   - ✅ Mood grid becomes 2 columns
   - ✅ Navigation stacks vertically
   - ✅ History panel is readable
   - ✅ Modal adjusts to 95% width

## Expected Backend Responses

### Analyze Emotion Response:
```json
{
  "success": true,
  "emotion": "stressed",
  "confidence": 85,
  "reasoning": "Text indicates overwhelm and pressure from multiple responsibilities",
  "suggestions": [
    "Break tasks into smaller, manageable chunks",
    "Practice the 2-minute breathing exercise"
  ],
  "feedback": "I understand you're feeling stressed. Let's tackle this together!",
  "aiUsed": true
}
```

### Quick Check-in Response:
```json
{
  "success": true,
  "emotion": "happy",
  "message": "Awesome! Keep that positive energy flowing! 🌟",
  "suggestions": [
    "Share your positivity with others",
    "Document what made you happy today"
  ]
}
```

### History Response:
```json
{
  "success": true,
  "count": 8,
  "logs": [
    {
      "id": "abc123",
      "text": "I'm feeling overwhelmed...",
      "emotion": "stressed",
      "confidence": 85,
      "timestamp": "2025-10-26T10:30:00.000Z"
    }
  ],
  "trends": {
    "stressed": 3,
    "happy": 2,
    "neutral": 2,
    "tired": 1
  }
}
```

## Troubleshooting

### Issue: "Failed to analyze emotion"
**Solution**: 
- Check backend is running on port 3001
- Verify Groq API key is configured in backend
- Check browser console for CORS errors

### Issue: History not loading
**Solution**:
- Ensure Firebase is initialized in backend
- Check Firestore collection `emotionLogs` exists
- Verify network tab shows successful API call

### Issue: Breathing modal not appearing
**Solution**:
- Check browser console for JavaScript errors
- Verify modal CSS is loaded
- Try hard refresh (Ctrl+Shift+R)

## Color Palette Reference

- **Primary Accent**: `#6C63FF` (Neon Violet)
- **Secondary Accent**: `#00FFFF` (Cyan)
- **Tertiary Accent**: `#FFB84C` (Amber)
- **Success**: `#00C896` (Green)
- **Error/Stressed**: `#FF4C4C` (Red)
- **Background**: `#0b0f14` (Deep Navy)
- **Text Primary**: `#E5E5E5`
- **Text Secondary**: `#9AA0A6`

## Next Steps

After testing Module 2, we'll build:
- **Module 3**: Smart Scheduler (Calendar + AI scheduling)
- **Module 4**: Wellness Goals (Habit tracking)
- **Module 5**: Dashboard (Overview + Analytics)

## Notes
- All emotions are logged to Firebase Firestore
- AI analysis uses Groq LLM (via backend)
- Breathing exercises are predefined (light/normal/intense)
- History limited to 20 most recent entries for performance
