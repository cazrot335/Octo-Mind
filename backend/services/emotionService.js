const Groq = require('groq-sdk');

/**
 * Emotion-Aware Feedback Service
 * Analyzes user emotions from text and provides contextual suggestions
 */
class EmotionService {
  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.groqClient = this.groqApiKey ? new Groq({ apiKey: this.groqApiKey }) : null;
    this.groqModel = 'llama-3.1-8b-instant';

    // Emotion categories and their characteristics
    this.emotions = {
      stressed: {
        keywords: ['stressed', 'overwhelmed', 'anxious', 'pressure', 'deadline', 'worried', 'panic'],
        suggestions: [
          'Take a 5-minute breathing exercise',
          'Break down your tasks into smaller, manageable steps',
          'Consider doing easier tasks first to build momentum',
          'Step away for a 10-minute walk to clear your mind'
        ]
      },
      tired: {
        keywords: ['tired', 'exhausted', 'drained', 'fatigued', 'sleepy', 'worn out', 'burnout'],
        suggestions: [
          'Take a 15-minute power nap if possible',
          'Reorder tasks - do critical ones now, defer others',
          'Consider rescheduling less urgent tasks for tomorrow',
          'Have a healthy snack and stay hydrated'
        ]
      },
      energetic: {
        keywords: ['energetic', 'motivated', 'pumped', 'excited', 'ready', 'focused', 'productive'],
        suggestions: [
          'Tackle your most challenging task first!',
          'This is a great time for deep work',
          'Use this energy to make significant progress',
          'Consider batching similar tasks for efficiency'
        ]
      },
      happy: {
        keywords: ['happy', 'great', 'good', 'wonderful', 'excellent', 'pleased', 'delighted'],
        suggestions: [
          'Keep up the positive momentum!',
          'Consider helping a colleague or friend',
          'This is a good time for creative tasks',
          'Celebrate your wins, big or small'
        ]
      },
      frustrated: {
        keywords: ['frustrated', 'annoyed', 'irritated', 'stuck', 'blocked', 'difficult'],
        suggestions: [
          'Take a short break to reset your mind',
          'Try approaching the problem from a different angle',
          'Consider asking for help or a second opinion',
          'Switch to a different task and come back later'
        ]
      },
      neutral: {
        keywords: ['okay', 'fine', 'normal', 'alright', 'steady'],
        suggestions: [
          'You\'re in a good state for steady work',
          'Focus on your prioritized task list',
          'Maintain your current pace',
          'Stay organized and on track'
        ]
      }
    };
  }

  /**
   * Analyze emotion from text using AI
   * @param {String} text - User's text input
   * @param {Object} context - Optional context (recent tasks, time of day, etc.)
   * @returns {Object} - Emotion analysis with suggestions
   */
  async analyzeEmotion(text, context = {}) {
    try {
      // Try AI-based analysis first
      if (this.groqClient) {
        return await this.analyzeWithAI(text, context);
      } else {
        // Fallback to keyword-based analysis
        return this.analyzeWithKeywords(text);
      }
    } catch (error) {
      console.error('❌ Emotion analysis error:', error.message);
      // Fallback to keyword-based analysis
      return this.analyzeWithKeywords(text);
    }
  }

  /**
   * AI-based emotion analysis using Groq
   */
  async analyzeWithAI(text, context) {
    try {
      console.log('⚡ Analyzing emotion with AI...');

      const prompt = this.buildEmotionPrompt(text, context);
      
      const response = await this.groqClient.chat.completions.create({
        model: this.groqModel,
        messages: [
          {
            role: 'system',
            content: 'You are an empathetic AI assistant that analyzes emotional tone from text. Respond only with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const aiResponse = response.choices[0].message.content.trim();
      console.log('AI Response:', aiResponse);
      
      // Parse JSON response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        // Add contextual suggestions
        const suggestions = this.getSuggestionsForEmotion(result.emotion);
        
        console.log('✅ AI emotion analysis successful!');
        return {
          emotion: result.emotion,
          confidence: result.confidence || 0.8,
          reasoning: result.reasoning || 'AI detected emotion from text tone',
          suggestions: suggestions,
          aiUsed: true
        };
      }
      
      throw new Error('Invalid AI response');
      
    } catch (error) {
      console.error('AI emotion analysis failed:', error.message);
      return this.analyzeWithKeywords(text);
    }
  }

  /**
   * Build prompt for AI emotion analysis
   */
  buildEmotionPrompt(text, context) {
    let prompt = `Analyze the emotional tone of this text:\n\n"${text}"\n\n`;
    
    if (context.timeOfDay) {
      prompt += `Time of day: ${context.timeOfDay}\n`;
    }
    if (context.taskCount) {
      prompt += `Number of pending tasks: ${context.taskCount}\n`;
    }
    
    prompt += `\nDetect the primary emotion from these categories:
- stressed (overwhelmed, anxious, under pressure)
- tired (exhausted, fatigued, drained)
- energetic (motivated, pumped, ready)
- happy (positive, pleased, satisfied)
- frustrated (stuck, annoyed, irritated)
- neutral (calm, steady, normal)

Respond with ONLY this JSON format:
{
  "emotion": "emotion_name",
  "confidence": 0.85,
  "reasoning": "brief explanation"
}`;
    
    return prompt;
  }

  /**
   * Keyword-based emotion analysis (fallback)
   */
  analyzeWithKeywords(text) {
    const lowerText = text.toLowerCase();
    const scores = {};
    
    // Calculate scores for each emotion
    for (const [emotion, data] of Object.entries(this.emotions)) {
      scores[emotion] = 0;
      for (const keyword of data.keywords) {
        if (lowerText.includes(keyword)) {
          scores[emotion] += 1;
        }
      }
    }
    
    // Find emotion with highest score
    let detectedEmotion = 'neutral';
    let maxScore = 0;
    
    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion;
      }
    }
    
    // Calculate confidence based on keyword matches
    const confidence = maxScore > 0 ? Math.min(0.5 + (maxScore * 0.2), 0.95) : 0.5;
    
    const suggestions = this.getSuggestionsForEmotion(detectedEmotion);
    
    return {
      emotion: detectedEmotion,
      confidence: confidence,
      reasoning: maxScore > 0 
        ? `Detected based on keywords related to "${detectedEmotion}"` 
        : 'No strong emotional indicators found',
      suggestions: suggestions,
      aiUsed: false
    };
  }

  /**
   * Get suggestions for a specific emotion
   */
  getSuggestionsForEmotion(emotion) {
    return this.emotions[emotion]?.suggestions || this.emotions.neutral.suggestions;
  }

  /**
   * Generate personalized feedback based on emotion and context
   */
  generateFeedback(emotionResult, context = {}) {
    const { emotion, confidence, suggestions } = emotionResult;
    
    let feedback = {
      message: '',
      actionItems: [],
      taskRecommendation: ''
    };
    
    // Personalized messages based on emotion
    switch (emotion) {
      case 'stressed':
        feedback.message = "I can see you're feeling stressed. Let's help you manage this.";
        feedback.actionItems = suggestions.slice(0, 3);
        feedback.taskRecommendation = 'Focus on quick wins - tackle 1-2 easy tasks first to reduce your mental load.';
        break;
        
      case 'tired':
        feedback.message = "You sound exhausted. Your wellbeing comes first!";
        feedback.actionItems = suggestions.slice(0, 3);
        feedback.taskRecommendation = 'Do only the most critical task now, defer the rest. Consider calling it a day soon.';
        break;
        
      case 'energetic':
        feedback.message = "Great energy! Let's make the most of it! 💪";
        feedback.actionItems = suggestions.slice(0, 2);
        feedback.taskRecommendation = 'This is your power hour - tackle your most challenging task right now!';
        break;
        
      case 'happy':
        feedback.message = "Love the positive vibes! Keep it going! 😊";
        feedback.actionItems = suggestions.slice(0, 2);
        feedback.taskRecommendation = 'Your positive mood is perfect for creative or collaborative tasks.';
        break;
        
      case 'frustrated':
        feedback.message = "I hear your frustration. Let's work through this.";
        feedback.actionItems = suggestions.slice(0, 3);
        feedback.taskRecommendation = 'Sometimes the best way forward is to step back. Try a different task for now.';
        break;
        
      default:
        feedback.message = "You seem balanced. Great mindset for steady progress!";
        feedback.actionItems = suggestions.slice(0, 2);
        feedback.taskRecommendation = 'Continue with your prioritized tasks in order.';
    }
    
    return feedback;
  }

  /**
   * Get breathing exercise based on stress level
   */
  getBreathingExercise(intensity = 'normal') {
    const exercises = {
      light: {
        name: '4-4-4 Breathing',
        duration: '2 minutes',
        steps: [
          'Breathe in for 4 seconds',
          'Hold for 4 seconds',
          'Breathe out for 4 seconds',
          'Repeat 5 times'
        ]
      },
      normal: {
        name: 'Box Breathing',
        duration: '5 minutes',
        steps: [
          'Breathe in slowly for 4 seconds',
          'Hold your breath for 4 seconds',
          'Breathe out slowly for 4 seconds',
          'Hold for 4 seconds',
          'Repeat for 5 minutes'
        ]
      },
      intense: {
        name: 'Deep Relaxation Breathing',
        duration: '10 minutes',
        steps: [
          'Breathe in deeply for 4 seconds',
          'Hold for 7 seconds',
          'Breathe out slowly for 8 seconds',
          'Repeat 10 times',
          'Focus on releasing tension with each exhale'
        ]
      }
    };
    
    return exercises[intensity] || exercises.normal;
  }
}

module.exports = new EmotionService();
