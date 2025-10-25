# 🧠 Smart Scheduler - Demo & Explanation

## ✅ What It Does

The **Smart Scheduler** automatically creates an optimized daily schedule by:

1. **Auto-fetching pending tasks** from your task list
2. **Auto-detecting your current mood** from emotion logs
3. **Intelligently ordering tasks** based on mood and task difficulty
4. **Adding strategic breaks** every 90 minutes
5. **Providing personalized recommendations**

---

## 🎯 How It Works

### Step 1: Automatic Data Collection

**No manual input needed!** The scheduler automatically:

```
📋 Fetches all pending tasks from database
😊 Gets your most recent mood from emotion logs
⚙️ Uses your preferences (or smart defaults)
```

### Step 2: Mood-Based Task Ordering

| Mood | Scheduling Strategy |
|------|---------------------|
| **Tired/Exhausted** | 🛋️ Easy tasks first, harder tasks later |
| **Stressed/Anxious** | ✅ Quick wins first to reduce overwhelm |
| **Energetic/Motivated** | 💪 Hardest tasks first while energy is high |
| **Frustrated** | 🎯 Mix of easy and medium tasks, avoid very hard ones |
| **Neutral/Happy** | 📊 Maintain priority order |

### Step 3: Intelligent Time Allocation

```
09:00 - 10:00  📝 Task 1 (60 min)
10:00 - 11:30  📝 Task 2 (90 min)
11:30 - 11:40  ☕ Break (10 min)
11:40 - 12:40  📝 Task 3 (60 min)
...
```

**Smart Features:**
- ⏰ Breaks every 90 minutes
- 📅 Tasks that don't fit today → flagged as overflow
- 🎯 Difficulty estimation based on category + priority
- ⚖️ Workload percentage calculation

---

## 🧪 Test Example

### Your Current State:
- **Latest Emotion:** `tired` (from emotion logs)
- **Pending Tasks:** 
  - Complete project proposal (work, 90 min)
  - Review email inbox (work, 30 min)
  - Study ML concepts (study, 120 min)
  - Grocery shopping (personal, 45 min)

### API Call:
```bash
curl -X POST http://localhost:3000/api/schedule/generate \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "workStart": "09:00",
      "workEnd": "18:00"
    }
  }'
```

### Result (When Tired):

**Task Order Changes!**
Because you're tired, the scheduler rearranged tasks from easiest to hardest:

```
✅ 09:00-10:00  Grocery shopping (personal, difficulty: 3)
✅ 10:00-11:30  Complete project proposal (work, difficulty: 6)
☕ 11:30-11:40  Break Time
✅ 11:40-12:40  Review email inbox (work, difficulty: 6)
✅ 12:40-14:40  Study ML concepts (study, difficulty: 7)
```

**Recommendations:**
```json
{
  "type": "health",
  "message": "You seem tired. I've scheduled easier tasks first. Consider taking longer breaks.",
  "icon": "😴"
}
```

---

## 📊 Statistics Provided

```json
{
  "totalTasks": 4,
  "totalTaskTime": 285,    // minutes
  "totalBreakTime": 10,
  "freeTime": 245,
  "overflowTasks": 0,
  "workloadPercentage": 54,
  "averageTaskDuration": 71
}
```

---

## 🎨 Features Comparison

### Before Smart Scheduler:
❌ User manually picks tasks  
❌ Random order, no mood consideration  
❌ Forget to take breaks  
❌ No overflow detection  

### With Smart Scheduler:
✅ Auto-fetches pending tasks  
✅ Mood-aware task ordering  
✅ Strategic break placement  
✅ Overflow detection & recommendations  
✅ Workload insights  
✅ Adaptive to mood changes  

---

## 🔄 Dynamic Rescheduling

### Complete a task and auto-reschedule:

```bash
curl -X POST http://localhost:3000/api/schedule/reschedule \
  -H "Content-Type: application/json" \
  -d '{
    "action": "remove",
    "taskId": "task123"
  }'
```

**What happens:**
1. ✅ Marks task as completed
2. 📊 Auto-detects current mood
3. 🔄 Regenerates schedule with remaining tasks
4. 📅 Returns updated timeline

---

## 🧩 Integration Points

### How It Uses Other Modules:

```
┌─────────────────┐
│  Task Module    │ ──> Provides pending tasks
└─────────────────┘

┌─────────────────┐
│ Emotion Module  │ ──> Provides current mood
└─────────────────┘

┌─────────────────┐
│ AI Prioritizer  │ ──> Task priorities (if set)
└─────────────────┘

         ↓
         
┌─────────────────┐
│ Smart Scheduler │ ──> Generates optimized daily plan
└─────────────────┘
```

---

## 🚀 Usage Tips

### 1. Just Add Tasks & Track Emotions
The scheduler does the rest automatically!

### 2. Customize Work Hours
```json
{
  "preferences": {
    "workStart": "08:00",
    "workEnd": "17:00",
    "breakDuration": 15,
    "breakInterval": 120
  }
}
```

### 3. Check History
```bash
curl http://localhost:3000/api/schedule/history?limit=7
```

### 4. Get Mood-Specific Suggestions
```bash
curl "http://localhost:3000/api/schedule/suggestions?mood=energetic"
```

---

## 🎯 Real-World Example

**Morning:**
```bash
# Log emotion
curl -X POST http://localhost:3000/api/emotion/check-in \
  -d '{"mood": "energetic"}'

# Generate schedule (auto-uses "energetic" mood)
curl -X POST http://localhost:3000/api/schedule/generate \
  -d '{"preferences": {"workStart": "09:00"}}'
```

**Result:** Hardest tasks scheduled first! 💪

**Afternoon (feeling tired):**
```bash
# Log new emotion
curl -X POST http://localhost:3000/api/emotion/check-in \
  -d '{"mood": "tired"}'

# Reschedule
curl -X POST http://localhost:3000/api/schedule/reschedule
```

**Result:** Remaining tasks reordered - easier ones moved up! 🛋️

---

## 🧠 Intelligence Features

### 1. Difficulty Estimation
```javascript
Work tasks     → difficulty 7
Study tasks    → difficulty 8
Personal tasks → difficulty 4
Exercise       → difficulty 6
Meetings       → difficulty 5
```

### 2. Mood Adjustments
- **Tired:** Easy → Hard progression
- **Stressed:** Quick wins first
- **Energetic:** Hard → Easy progression

### 3. Overflow Handling
If tasks don't fit in the workday:
- ⚠️ Flagged as overflow
- 📅 Recommendation to extend hours or move to next day

### 4. Break Intelligence
- 🕐 Every 90 minutes of work
- ☕ 10-minute breaks by default
- 🧘 Breathing exercises suggested for stressed mood

---

## 💡 Key Takeaway

**You don't need to manually plan your day anymore!**

Just:
1. ✅ Add tasks when they come up
2. 😊 Log how you feel occasionally
3. 🤖 Let OctoMind build your schedule

The scheduler adapts to your emotional state and workload automatically! 🎉
