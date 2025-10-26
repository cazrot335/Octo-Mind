# Module 4: Wellness Goals - Testing Guide

## Overview
Module 4 implements a comprehensive wellness and sustainability tracking system with goals, badges, streaks, and progress visualization.

## Features Implemented

### 1. **Progress Dashboard**
- **Total Points Tracker**: Shows accumulated points from goal completions
- **Level System**: Display current level and points to next level
- **Wellness Streak**: Consecutive days of wellness goal completions
- **Sustainability Streak**: Consecutive days of sustainability goal completions
- **Visual Stats**: Glassmorphism cards with color-coded icons

### 2. **Goal Management**
- **Create Goals**: Modal form with comprehensive options
  - Goal Type: Daily, Weekly, Custom
  - Category Selection: 10 categories across wellness and sustainability
  - Target Configuration: Custom value and unit (times, minutes, hours, etc.)
  - Rich descriptions and naming
- **Active Goals Display**: Grid view of all active goals
  - Category icons and emojis
  - Target information
  - Points value display
  - Quick completion button
- **Goal Completion**: 
  - One-click completion
  - Points breakdown display
  - Streak bonus notification
  - Automatic progress update

### 3. **Achievement System**
- **Badge Display**: Grid of earned badges
- **Rarity Levels**: Common, Rare, Epic, Legendary
- **Badge Details**: Name, description, icon, rarity-based styling
- **Animated Effects**: Shimmer effects for legendary badges

### 4. **Category System**
**Wellness Categories:**
- 🧘‍♀️ Mental Health (meditation, mindfulness)
- 💪 Physical Health (exercise, fitness)
- 🥗 Nutrition (healthy eating, hydration)
- 😴 Sleep (sleep tracking, quality)
- ☕ Breaks (rest, recovery)

**Sustainability Categories:**
- 🚶‍♂️ Green Commute (walking, biking)
- ♻️ Waste Reduction (recycling, composting)
- 💡 Energy Saving (conservation)
- 📱 Digital Minimalism (screen time reduction)
- 🛒 Eco Shopping (sustainable purchasing)

## API Endpoints Used

### GET /api/wellness/goals
Fetches all active goals for the user.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "goals": [
    {
      "id": "goal123",
      "userId": "user123",
      "type": "daily",
      "category": "mental-health",
      "name": "Morning meditation",
      "description": "10 minutes of mindfulness",
      "target": {
        "value": 10,
        "unit": "minutes"
      },
      "icon": "🧘‍♀️",
      "points": 15,
      "createdAt": "2025-01-20T10:00:00Z",
      "isActive": true
    }
  ]
}
```

### POST /api/wellness/goals
Creates a new wellness goal.

**Request:**
```json
{
  "type": "daily",
  "category": "physical-health",
  "name": "Morning run",
  "description": "30 minute jog",
  "target": {
    "value": 30,
    "unit": "minutes"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Goal created successfully",
  "goal": {
    "id": "goal456",
    "userId": "user123",
    "type": "daily",
    "category": "physical-health",
    "name": "Morning run",
    "description": "30 minute jog",
    "target": {
      "value": 30,
      "unit": "minutes"
    },
    "icon": "💪",
    "points": 30,
    "createdAt": "2025-01-20T11:00:00Z",
    "isActive": true
  }
}
```

### POST /api/wellness/complete/:goalId
Completes a specific goal.

**Response:**
```json
{
  "success": true,
  "message": "Goal completed! 🎉",
  "completion": {
    "goalId": "goal123",
    "completedAt": "2025-01-20T15:30:00Z",
    "points": 23
  },
  "pointsBreakdown": {
    "basePoints": 15,
    "streakBonus": 8,
    "totalPoints": 23
  },
  "newStreak": 5
}
```

### GET /api/wellness/progress
Fetches user's overall progress statistics.

**Response:**
```json
{
  "success": true,
  "progress": {
    "stats": {
      "totalPoints": 450,
      "currentLevel": 3,
      "pointsToNextLevel": 50,
      "wellnessStreak": 7,
      "sustainabilityStreak": 3,
      "totalGoalsCompleted": 28,
      "activeGoals": 5
    }
  }
}
```

### GET /api/wellness/badges
Fetches earned badges.

**Response:**
```json
[
  {
    "name": "Calm Mind",
    "description": "Complete 7 consecutive days of meditation/mindfulness",
    "icon": "🧘‍♀️",
    "category": "wellness",
    "rarity": "common",
    "points": 100,
    "earnedAt": "2025-01-19T12:00:00Z"
  }
]
```

## Object Error Prevention

This module was built with careful attention to prevent object rendering errors discovered in previous modules:

### 1. **Goal Object Handling**
```javascript
// Defensive property access
const goalName = goal.name || 'Unnamed Goal';
const targetValue = goal.target && typeof goal.target === 'object' 
  ? (goal.target.value || 1) 
  : 1;
```

### 2. **Badge Array Handling**
```javascript
// Handle both array and object responses
if (Array.isArray(badgesRes.data)) {
  setBadges(badgesRes.data);
} else if (badgesRes.data.badges && Array.isArray(badgesRes.data.badges)) {
  setBadges(badgesRes.data.badges);
}
```

### 3. **Progress Stats Handling**
```javascript
// Check for nested stats object
if (progressRes.data.success && progressRes.data.progress) {
  setProgress(progressRes.data.progress);
}

// Safe rendering with fallbacks
<h3>{stats.totalPoints || 0}</h3>
```

### 4. **Completion Response Handling**
```javascript
// Extract nested objects safely
const { message, pointsBreakdown, newStreak } = response.data;

if (pointsBreakdown && typeof pointsBreakdown === 'object') {
  const totalPoints = pointsBreakdown.totalPoints || 0;
  const streakBonus = pointsBreakdown.streakBonus || 0;
  // Use values safely
}
```

## Testing Instructions

### Test 1: View Progress Dashboard
1. Navigate to Wellness module (🌱 button)
2. **Expected Result**: See 4 stat cards showing:
   - Total Points (with trophy icon)
   - Current Level (with star icon)
   - Wellness Streak (with fire icon)
   - Sustainability Streak (with leaf icon)
3. **Verify**: Stats load without "Objects are not valid as a React child" errors

### Test 2: Create Wellness Goal
1. Click "New Goal" button (top right)
2. Fill in the form:
   - Type: Daily
   - Category: Mental Health
   - Name: "Morning meditation"
   - Description: "10 minutes of mindfulness"
   - Target: 10 minutes
3. Click "Create Goal"
4. **Expected Result**: 
   - Modal closes
   - New goal appears in Active Goals section
   - Goal shows correct emoji (🧘‍♀️), category icon, and target
5. **Verify**: Goal object properties render correctly

### Test 3: Create Sustainability Goal
1. Click "New Goal"
2. Fill in:
   - Type: Daily
   - Category: Green Commute
   - Name: "Walk to work"
   - Target: 1 times
3. Create goal
4. **Expected Result**: Goal appears with 🚶‍♂️ emoji and walking icon
5. **Verify**: Different category handles correctly

### Test 4: Complete a Goal
1. Click "Complete" button on any goal
2. **Expected Result**: 
   - Alert shows: "Goal completed! 🎉 +X points"
   - If streak exists: Shows streak bonus
   - If multi-day streak: Shows "🔥 X day streak!"
   - Goal disappears from active list (or stays if recurring)
   - Progress stats update automatically
3. **Verify**: Points breakdown object renders properly in alert

### Test 5: View Badges
1. Scroll to "Achievements" section
2. **Expected Result**:
   - If no badges: Shows empty state with medal icon
   - If badges exist: Grid of badge cards with:
     - Badge icon/emoji
     - Badge name
     - Badge description
     - Rarity-based border colors
3. **Verify**: Badge object properties render without errors

### Test 6: Earn a Badge (Integration Test)
1. Complete 7 consecutive daily mental-health goals
2. Refresh wellness data
3. **Expected Result**: "Calm Mind" badge appears in achievements
4. **Verify**: Badge object displays correctly

### Test 7: Streak System
1. Complete wellness goals on consecutive days
2. Check wellness streak counter
3. Complete sustainability goals
4. Check sustainability streak counter
5. **Expected Result**: Separate streaks for wellness vs sustainability
6. **Verify**: Streak numbers update correctly

### Test 8: Points and Leveling
1. Complete multiple goals
2. Watch total points increase
3. **Expected Result**: 
   - Points accumulate
   - Level increases at thresholds
   - "Points to next level" updates
4. **Verify**: All numeric values display correctly

### Test 9: Error Handling
1. Disconnect internet or stop backend
2. Try to create a goal
3. **Expected Result**: Red error message appears at top
4. Close error with X button
5. **Verify**: Error message displays and closes properly

### Test 10: Modal Form Validation
1. Click "New Goal"
2. Try to submit empty form
3. **Expected Result**: Browser validation prevents submission
4. Fill required fields
5. **Expected Result**: Form submits successfully
6. Click outside modal
7. **Expected Result**: Modal closes

### Test 11: Category Dropdown
1. Open create goal modal
2. Click category dropdown
3. **Expected Result**: 
   - Two optgroups: "Wellness" and "Sustainability"
   - 5 wellness categories with emojis
   - 5 sustainability categories with emojis
4. Select different categories
5. **Expected Result**: Correct category saves to goal

### Test 12: Target Unit Options
1. In create goal form, click "Target Unit" dropdown
2. **Expected Result**: See options:
   - Times
   - Minutes
   - Hours
   - Glasses
   - Servings
   - Steps
3. Select different units
4. **Expected Result**: Goal saves with correct unit

## UI Theme Verification

### Dark Neural Theme Elements
- **Background**: Deep navy-black (#0b0f14)
- **Cards**: Glassmorphism with rgba backgrounds and backdrop blur
- **Borders**: Neon violet (#6C63FF) with hover glow effects
- **Accents**: 
  - Violet #6C63FF (primary)
  - Cyan #00FFFF (secondary)
  - Amber #FFB84C (points)
  - Green #00C896 (success/completion)
  - Red #FF4C4C (errors)
- **Animations**: 
  - Pulse on header icon
  - Hover lifts on cards
  - Shimmer on legendary badges
  - Smooth transitions throughout

### Responsive Design
1. Resize browser to mobile width
2. **Expected Result**:
   - Header stacks vertically
   - Stats grid becomes single column
   - Goals list remains readable
   - Badges grid adjusts
   - Modal stays scrollable
   - Form inputs stack properly

## Troubleshooting

### Issue: "Objects are not valid as a React child"
**Solution**: Already prevented! But if it occurs:
- Check console for which property is causing issue
- Add object type check: `typeof value === 'string' ? value : value.property`
- Add optional chaining: `object?.nested?.property || fallback`

### Issue: Empty progress stats
**Cause**: No completed goals yet
**Solution**: Normal behavior - stats start at 0

### Issue: No badges showing
**Cause**: Haven't met badge criteria yet
**Solution**: 
- Complete 7 consecutive mental-health goals for "Calm Mind"
- Check badge requirements in wellness service

### Issue: Goal not appearing after creation
**Cause**: API error or validation failure
**Solution**: 
- Check browser console for error
- Verify backend is running on port 3001
- Check network tab for response

### Issue: Streak not increasing
**Cause**: Need to complete goals on consecutive days
**Solution**: 
- Check completion timestamps
- Verify goal category matches streak type
- Ensure no days were skipped

## Backend Dependency Check

Before testing, ensure backend is running:

```bash
cd backend
npm start
```

Backend should show:
```
🚀 Server running on port 3001
✅ Firebase connected successfully
```

## Next Steps

After Module 4 is verified:
1. Test all goal categories
2. Earn different badges
3. Build up streaks
4. Reach level 2+
5. Move to Module 5: Dashboard (final module)

## Object Handling Patterns Used

This module demonstrates best practices learned from previous modules:

1. **Always check object existence before accessing properties**
   ```javascript
   goal.target && typeof goal.target === 'object' ? goal.target.value : 1
   ```

2. **Use optional chaining for nested objects**
   ```javascript
   err.response?.data?.message || 'Default message'
   ```

3. **Provide fallbacks for all displayed values**
   ```javascript
   stats.totalPoints || 0
   ```

4. **Handle both array and object response formats**
   ```javascript
   Array.isArray(data) ? data : data.items || []
   ```

5. **Type check before rendering complex data**
   ```javascript
   typeof value === 'string' ? value : value.toString()
   ```

These patterns ensure robust rendering without errors! 🎯
