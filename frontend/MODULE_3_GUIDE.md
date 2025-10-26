# Module 3: Smart Scheduler - Testing Guide

## Overview
The **Smart Scheduler** module automatically generates optimized daily schedules based on your pending tasks, current mood, and work preferences. It uses AI to intelligently arrange tasks considering difficulty, priority, and your emotional state.

## Features Implemented

### 1. AI-Powered Schedule Generation
- **Automatic Task Fetching**: Pulls all pending tasks from database
- **Mood Detection**: Auto-detects recent mood from emotion logs
- **Intelligent Task Ordering**: Arranges tasks based on mood
  - **Tired**: Easy tasks first
  - **Stressed**: Quick wins first
  - **Energetic**: Hard tasks first while energy is high
  - **Neutral/Happy**: Priority-based ordering
- **Break Scheduling**: Automatically inserts breaks based on work intervals

### 2. Customizable Work Preferences
- **Work Hours**: Set custom start/end times
- **Break Duration**: Configure break length (5-30 min)
- **Break Interval**: Set how often breaks occur (30-180 min)
- **Real-time Regeneration**: Update schedule with new preferences

### 3. Visual Timeline
- **Time-based Display**: Shows start time → end time for each slot
- **Color-coded Items**:
  - **Tasks** (Violet): Scheduled work items
  - **Breaks** (Cyan): Rest periods
  - **Buffer** (Amber): Prep/transition time
- **Task Details**:
  - Category badge
  - Difficulty bar (visual indicator)
  - Duration in minutes

### 4. Schedule Statistics
- **Total Tasks** scheduled
- **Total Work Time** in minutes
- **Break Count**
- **Utilization Rate** (% of work hours used)

### 5. AI Recommendations
- Personalized suggestions based on:
  - Current mood
  - Task distribution
  - Work-life balance

### 6. Mood-Based Suggestions
- **Work Schedule** recommendations
- **Break Pattern** suggestions
- **Task Ordering** strategies
- Tailored to current emotional state

### 7. Schedule History
- **7 Days** of past schedules
- Shows mood, slots, and work hours
- Timestamps for tracking

## API Endpoints Used

### Backend Running on: `http://localhost:3001`

1. **POST** `/api/schedule/generate`
   - Generates optimized schedule from pending tasks
   - Auto-detects mood from emotion logs
   - Body: `{ preferences: { workStart, workEnd, breakDuration, breakInterval } }`
   - Returns: schedule array, stats, mood, recommendations

2. **POST** `/api/schedule/reschedule`
   - Regenerates schedule with updated preferences
   - Body: `{ preferences: {...}, mood: 'optional' }`
   - Returns: updated schedule

3. **GET** `/api/schedule/history?limit=7`
   - Fetches past schedules
   - Returns: schedules array with metadata

4. **GET** `/api/schedule/suggestions?mood=stressed`
   - Gets mood-based scheduling advice
   - Returns: work schedule, break pattern, task ordering suggestions

## Testing Steps

### Step 1: Ensure Prerequisites
Make sure you have:
- ✅ Backend running on port 3001
- ✅ At least 3-5 pending tasks in database (from Tasks module)
- ✅ At least 1 emotion log (from Emotions module) for mood detection

### Step 2: Navigate to Scheduler
- Click **📅 Scheduler** in the navigation

### Step 3: Test Default Schedule Generation
1. Click **Generate Schedule** button
2. Verify:
   - ✅ Loading state shows ("Generating...")
   - ✅ Schedule timeline appears
   - ✅ Info bar shows work hours, detected mood, task count
   - ✅ Timeline items display with:
     - Start time (e.g., "9:00 AM")
     - Task title and category
     - Difficulty bar
     - Duration
     - End time
   - ✅ Break slots appear (cyan-colored)
   - ✅ Stats cards show metrics
   - ✅ AI recommendations list appears

### Step 4: Test Custom Preferences
1. Click **Settings** button
2. Modify preferences:
   - Change **Work Start** to `08:00`
   - Change **Work End** to `17:00`
   - Set **Break Duration** to `15` minutes
   - Set **Break Interval** to `60` minutes
3. Click **Generate Schedule** again
4. Verify:
   - ✅ Timeline reflects new work hours
   - ✅ Breaks occur every 60 minutes
   - ✅ Break duration is 15 minutes
   - ✅ Stats update accordingly

### Step 5: Test Regeneration
1. After generating a schedule, click **Regenerate**
2. Verify:
   - ✅ New schedule generated
   - ✅ Different task ordering (if mood allows)
   - ✅ Stats recalculated
   - ✅ History updates

### Step 6: Test Mood-Based Suggestions
1. Generate a schedule
2. Look at "Suggestions for [mood] mood" panel
3. Verify:
   - ✅ Work schedule suggestion displays
   - ✅ Recommended hours shown
   - ✅ Break pattern recommendation
   - ✅ Task ordering strategy explained

### Step 7: Test Schedule History
1. Generate multiple schedules (2-3 times)
2. Click **History** button
3. Verify:
   - ✅ History panel slides in
   - ✅ Shows past schedules
   - ✅ Each item shows: date, mood, slots, work hours, timestamp
   - ✅ Hover effects work

### Step 8: Test Empty State
1. Complete all tasks in Task Manager
2. Try to generate schedule
3. Verify:
   - ✅ Message: "No pending tasks to schedule"
   - ✅ Empty schedule array
   - ✅ Appropriate UI feedback

### Step 9: Test UI Theme
Verify the dark neural theme:
- ✅ Glassmorphic backgrounds
- ✅ Neon violet/cyan accents
- ✅ Timeline hover effects (shimmer animation)
- ✅ Pulsating calendar icon
- ✅ Breathing animation on stat cards
- ✅ Color-coded timeline items
- ✅ Smooth transitions

### Step 10: Test Responsive Design
1. Resize browser to mobile width (< 768px)
2. Verify:
   - ✅ Timeline stacks vertically
   - ✅ Stats cards become 2 columns
   - ✅ Settings grid becomes single column
   - ✅ Navigation buttons stack

## Expected Backend Response

### Generate Schedule Response:
```json
{
  "success": true,
  "mood": "energetic",
  "workHours": "09:00 - 18:00",
  "schedule": [
    {
      "type": "task",
      "task": {
        "id": "abc123",
        "title": "Complete project proposal",
        "category": "work",
        "priority": 3,
        "difficulty": 8,
        "estimatedDuration": 120
      },
      "startTime": "09:00",
      "endTime": "11:00",
      "duration": 120
    },
    {
      "type": "break",
      "startTime": "11:00",
      "endTime": "11:10",
      "duration": 10
    }
  ],
  "stats": {
    "totalTasks": 5,
    "totalWorkMinutes": 420,
    "totalBreaks": 4,
    "utilizationRate": 78
  },
  "recommendations": [
    "You're energetic - great time for challenging work!",
    "Consider tackling your hardest tasks first"
  ],
  "moodSource": "auto-detected from logs"
}
```

## How Schedule Generation Works

1. **Task Collection**: Fetches all pending (incomplete) tasks
2. **Mood Detection**: Pulls most recent emotion from emotion logs
3. **Task Adjustment**: 
   - Estimates difficulty (1-10) based on category and priority
   - Reorders tasks based on mood strategy
4. **Time Allocation**:
   - Creates time slots for tasks
   - Inserts breaks at specified intervals
   - Adds buffer time between complex tasks
5. **Statistics Calculation**: 
   - Counts tasks, work time, breaks
   - Calculates utilization percentage
6. **Recommendations**: AI generates personalized advice

## Troubleshooting

### Issue: "No pending tasks to schedule"
**Solution**: 
- Go to Tasks module
- Add at least 3-5 tasks
- Make sure they're not marked as completed
- Try generating schedule again

### Issue: Mood shows as "neutral" always
**Solution**:
- Use Emotions module to log your mood
- Generate schedule after logging emotion
- Backend auto-detects from latest emotion log

### Issue: Schedule not generating
**Solution**:
- Check backend is running on port 3001
- Verify tasks collection has data in Firestore
- Check browser console for errors
- Ensure CORS is enabled

### Issue: Timeline items overlapping
**Solution**:
- Adjust break interval in settings
- Reduce number of pending tasks
- Extend work hours

## Color Palette Reference

- **Tasks**: `#6C63FF` (Neon Violet)
- **Breaks**: `#00FFFF` (Cyan)
- **Buffer**: `#FFB84C` (Amber)
- **Background**: `#0b0f14` (Deep Navy)
- **Text Primary**: `#E5E5E5`
- **Text Secondary**: `#9AA0A6`

## Next Steps

After testing Module 3, we'll build:
- **Module 4**: Wellness Goals (Habit tracking + Progress insights)
- **Module 5**: Dashboard (Complete overview + Analytics)

## Notes
- Schedule generation is **AI-powered** using mood-aware algorithms
- All schedules saved to Firestore `schedules` collection
- Difficulty estimation based on task category and priority
- Break intervals use Pomodoro-style timing by default (90 min)
- Utilization rate calculated as: (work time / total available time) × 100
