# 🌱 Wellness & Sustainability Goals - Database Schema

## Collections in Firestore

### 1. `wellnessGoals` Collection
Stores user-defined wellness and sustainability goals.

```json
{
  "id": "goal123",
  "userId": "user_abc",
  "type": "wellness",  // "wellness" or "sustainability"
  "category": "mental-health",  // mental-health, physical-health, eco-habits, green-commute
  "name": "Daily meditation",
  "description": "Meditate for 10 minutes every morning",
  "target": {
    "frequency": "daily",  // daily, weekly, monthly
    "count": 1,  // times per frequency period
    "unit": "minutes"  // optional: minutes, km, liters, etc.
  },
  "icon": "🧘‍♀️",
  "points": 10,  // points awarded per completion
  "createdAt": "2025-10-25T10:00:00Z",
  "isActive": true
}
```

### 2. `goalCompletions` Collection
Tracks individual goal completions.

```json
{
  "id": "completion456",
  "goalId": "goal123",
  "userId": "user_abc",
  "completedAt": "2025-10-25T08:30:00Z",
  "notes": "Felt very calm today",
  "mood": "happy",  // optional: link to emotion
  "pointsEarned": 10,
  "streakDay": 5  // current streak when completed
}
```

### 3. `userProgress` Collection
Stores user's overall progress and gamification data.

```json
{
  "userId": "user_abc",
  "stats": {
    "totalPoints": 450,
    "currentLevel": 3,
    "wellnessStreak": 7,  // consecutive days
    "sustainabilityStreak": 12,
    "longestStreak": 15,
    "totalWellnessGoals": 25,
    "totalSustainabilityGoals": 18,
    "lastActivityDate": "2025-10-25"
  },
  "badges": [
    {
      "id": "calm_mind",
      "name": "Calm Mind",
      "description": "Completed 7 meditation sessions",
      "icon": "🧘‍♀️",
      "earnedAt": "2025-10-20T10:00:00Z",
      "category": "wellness"
    },
    {
      "id": "green_warrior",
      "name": "Green Warrior",
      "description": "Completed 10 eco-friendly actions",
      "icon": "🌍",
      "earnedAt": "2025-10-22T14:30:00Z",
      "category": "sustainability"
    }
  ],
  "updatedAt": "2025-10-25T10:00:00Z"
}
```

### 4. `achievements` Collection (Template)
Pre-defined achievements/badges that users can earn.

```json
{
  "id": "calm_mind",
  "name": "Calm Mind",
  "description": "Complete 7 consecutive days of meditation",
  "icon": "🧘‍♀️",
  "category": "wellness",
  "criteria": {
    "type": "streak",
    "goalCategory": "mental-health",
    "requiredCount": 7
  },
  "points": 100,
  "rarity": "common"  // common, rare, epic, legendary
}
```

## Goal Categories

### Wellness Goals 🧘‍♀️

| Category | Examples | Icon |
|----------|----------|------|
| `mental-health` | Meditation, journaling, therapy, gratitude | 🧘‍♀️ |
| `physical-health` | Exercise, yoga, walking, stretching | 💪 |
| `nutrition` | Hydration, healthy meals, vitamins | 🥗 |
| `sleep` | 8 hours sleep, consistent bedtime | 😴 |
| `breaks` | Screen breaks, walk breaks, rest | ☕ |

### Sustainability Goals 🌍

| Category | Examples | Icon |
|----------|----------|------|
| `green-commute` | Walk, bike, public transport | 🚶‍♂️ |
| `waste-reduction` | Recycling, avoiding plastic, composting | ♻️ |
| `energy-saving` | Turn off lights, unplug devices | 💡 |
| `digital-minimalism` | Reduce screen time, delete unused apps | 📱 |
| `eco-shopping` | Buy local, reusable bags, eco products | 🛒 |

## Points & Levels System

### Points Calculation
```
Base points per completion: 10 points
Streak bonus: +5 points per streak day (capped at +50)
Difficulty multiplier: 
  - Easy: 1x
  - Medium: 1.5x
  - Hard: 2x

Example:
  Daily meditation (medium) on day 5 of streak:
  = 10 × 1.5 + (5 × 5) = 15 + 25 = 40 points
```

### Level Progression
```
Level 1: 0-100 points (Beginner)
Level 2: 101-250 points (Explorer)
Level 3: 251-500 points (Achiever)
Level 4: 501-1000 points (Champion)
Level 5: 1001-2000 points (Master)
Level 6: 2001+ points (Legend)
```

## Badge Achievements

### Wellness Badges
- **🧘‍♀️ Calm Mind** - 7-day meditation streak
- **💪 Fitness Enthusiast** - 14-day exercise streak
- **💧 Hydration Hero** - 30 days of proper hydration
- **📓 Mindful Writer** - 10 journal entries
- **😴 Sleep Master** - 7 consecutive nights of good sleep

### Sustainability Badges
- **🌍 Green Warrior** - 10 eco-friendly actions
- **🚶‍♂️ Earth Walker** - Walk/bike 30 times
- **♻️ Recycling Champion** - 20 recycling actions
- **💡 Energy Saver** - 15 energy-saving actions
- **🌱 Planet Protector** - Complete all sustainability categories

### Ultimate Badges
- **🐙 OctoMind Master** - Level 5 in both wellness & sustainability
- **⭐ Balance Keeper** - Equal progress in all categories
- **🔥 Streak Legend** - 30-day overall streak

## API Endpoints Needed

### Goals Management
```
POST   /api/wellness/goals          - Create new goal
GET    /api/wellness/goals          - Get all goals
GET    /api/wellness/goals/:id      - Get specific goal
PUT    /api/wellness/goals/:id      - Update goal
DELETE /api/wellness/goals/:id      - Delete goal
```

### Goal Completion
```
POST   /api/wellness/complete/:goalId  - Mark goal as completed
GET    /api/wellness/completions        - Get completion history
GET    /api/wellness/today              - Get today's completions
```

### Progress & Gamification
```
GET    /api/wellness/progress          - Get user progress & stats
GET    /api/wellness/badges            - Get earned badges
GET    /api/wellness/leaderboard       - Get points leaderboard (optional)
GET    /api/wellness/insights          - AI-generated wellness insights
```

### Analytics
```
GET    /api/wellness/stats/weekly      - Weekly completion stats
GET    /api/wellness/stats/categories  - Stats by category
GET    /api/wellness/streak            - Current streak info
```

## Integration with Existing Modules

### 🔗 Emotion Module
- Link goal completions to mood
- Show correlation: "Meditation days = happier mood"
- Auto-suggest wellness goals based on stress patterns

### 🔗 Task Module
- Convert wellness goals to daily tasks
- Block calendar time for wellness activities
- Prioritize wellness when stressed

### 🔗 Scheduler Module
- Auto-schedule wellness breaks
- Suggest eco-commute times
- Balance work tasks with wellness activities

### 🔗 Tentacle Mode (Visualization)
- Add "Wellness" and "Sustainability" tentacles
- Node color = streak health
- Animated growth when completing goals
