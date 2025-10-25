const ollama = require('ollama').default;
const Groq = require('groq-sdk');

/**
 * AI Service to prioritize tasks based on mood and other factors
 * Supports Groq (recommended for hosting) and Ollama (for local dev)
 */
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'groq';
    
    // Groq setup (RECOMMENDED - Fast, free, reliable)
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.groqClient = this.groqApiKey ? new Groq({ apiKey: this.groqApiKey }) : null;
    this.groqModel = 'llama-3.1-8b-instant'; // Super fast, free
    
    // Ollama setup (for local development only)
    this.ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
  }

  /**
   * Prioritize tasks using AI based on user's mood and task details
   * @param {Array} tasks - Array of task objects
   * @param {String} userMood - Current mood of the user
   * @returns {Object} - { prioritizedTasks: Array, aiUsed: Boolean }
   */
  async prioritizeTasks(tasks, userMood) {
    // Try AI based on provider
    if (this.provider === 'groq' && this.groqClient) {
      return await this.prioritizeWithGroq(tasks, userMood);
    } else if (this.provider === 'ollama') {
      return await this.prioritizeWithOllama(tasks, userMood);
    }
    
    // Fallback if no AI provider is configured
    console.log('⚠️  No AI provider configured, using fallback logic');
    return {
      prioritizedTasks: this.fallbackPrioritization(tasks),
      aiUsed: false
    };
  }

  /**
   * Prioritize using Groq (RECOMMENDED - Fast & Reliable!)
   */
  async prioritizeWithGroq(tasks, userMood) {
    try {
      console.log(`⚡ Using Groq AI (${this.groqModel})...`);
      const prompt = this.buildSimplePrompt(tasks, userMood);
      
      const response = await this.groqClient.chat.completions.create({
        model: this.groqModel,
        messages: [
          {
            role: 'system',
            content: `You are an AI productivity assistant.
Given this user mood and task list, assign a priority (1 = highest) and explain briefly.
Respond in JSON format only.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const responseText = response.choices[0].message.content.trim();
      console.log('Raw AI Response:', responseText);
      
      // Extract JSON array
      const jsonMatch = responseText.match(/\[[\s\S]*?\]/);
      
      if (jsonMatch) {
        const prioritizedTasks = JSON.parse(jsonMatch[0]);
        
        if (Array.isArray(prioritizedTasks) && prioritizedTasks.length > 0) {
          console.log('✅ Groq AI prioritization successful!');
          return {
            prioritizedTasks,
            aiUsed: true
          };
        }
      }
      
      throw new Error('Invalid AI response format');
      
    } catch (error) {
      console.error('❌ Groq Error:', error.message);
      console.log('⚠️  Falling back to simple prioritization...');
      return {
        prioritizedTasks: this.fallbackPrioritization(tasks),
        aiUsed: false
      };
    }
  }

  /**
   * Build simple prompt for AI
   */
  buildSimplePrompt(tasks, userMood) {
    const tasksList = tasks.map(task => ({
      id: task.id,
      name: task.name,
      dueDate: task.dueDate || 'No deadline',
      category: task.category || 'uncategorized'
    }));

    return `User's mood: ${userMood}

Tasks to prioritize:
${JSON.stringify(tasksList, null, 2)}

Prioritize (1-10) based on mood and deadlines.
- "${userMood}" mood: ${userMood === 'stressed' ? 'easier tasks first' : 'match energy level'}
- Closer deadlines = higher priority

Respond ONLY with JSON array:
[{"id": "task_id", "priority": 8, "reason": "brief reason"}]`;
  }

  /**
   * Prioritize using Ollama (For local development)
   */
  async prioritizeWithOllama(tasks, userMood) {
    try {
      console.log(`🔍 Attempting to use Ollama AI (${this.ollamaModel})...`);
      const prompt = this.buildPrompt(tasks, userMood);
      
      const response = await ollama.chat({
        model: this.ollamaModel,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant that helps prioritize tasks based on user mood, deadlines, and categories. Respond only with valid JSON array format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        format: 'json',
        options: {
          temperature: 0.7,
        }
      });

      const aiResponse = response.message.content;
      const prioritizedTasks = JSON.parse(aiResponse);
      
      console.log('✅ Ollama AI prioritization successful!');
      return {
        prioritizedTasks,
        aiUsed: true
      };
    } catch (error) {
      console.error('❌ Ollama Error:', error.message);
      console.log('⚠️  Falling back to simple prioritization...');
      console.log('💡 Tip: Make sure Ollama is running with: ollama serve');
      
      return {
        prioritizedTasks: this.fallbackPrioritization(tasks),
        aiUsed: false
      };
    }
  }

  /**
   * Build prompt for AI
   */
  buildPrompt(tasks, userMood) {
    const tasksList = tasks.map((task, index) => ({
      index: index,
      id: task.id,
      name: task.name,
      dueDate: task.dueDate || 'No deadline',
      category: task.category || 'uncategorized',
      mood: task.mood || 'neutral',
      currentPriority: task.priority || 0
    }));

    return `
You are a smart task prioritization assistant. The user's current mood is "${userMood}".

Here are the tasks that need to be prioritized:
${JSON.stringify(tasksList, null, 2)}

Based on the user's mood ("${userMood}"), task deadlines, categories, and individual task moods, please assign a priority score (1-10, where 10 is highest priority) to each task.

Consider:
1. User's current mood: If stressed, prioritize easier tasks first. If energetic, prioritize challenging tasks.
2. Due dates: Tasks with closer deadlines should have higher priority.
3. Category: Work tasks during work hours, personal tasks during personal time.
4. Task mood: Match tasks to the user's current emotional state.
5. Balance: Don't overwhelm with too many high-priority tasks.

Return a JSON array with the following structure:
[
  {
    "id": "task_id",
    "priority": 8,
    "reason": "Brief explanation for this priority"
  }
]

Only return the JSON array, no other text.
`;
  }

  /**
   * Fallback prioritization when AI is unavailable
   */
  fallbackPrioritization(tasks) {
    const now = new Date();
    
    return tasks.map(task => {
      let priority = 5; // Default priority
      let reason = 'Default priority';

      // Prioritize based on due date
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 1) {
          priority = 10;
          reason = 'Due very soon';
        } else if (daysUntilDue <= 3) {
          priority = 8;
          reason = 'Due in a few days';
        } else if (daysUntilDue <= 7) {
          priority = 6;
          reason = 'Due this week';
        }
      }

      // Adjust based on category
      if (task.category === 'work') {
        priority = Math.min(priority + 1, 10);
      }

      return {
        id: task.id,
        priority: priority,
        reason: reason
      };
    });
  }
}

module.exports = new AIService();
