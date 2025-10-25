const { getFirestore } = require('../config/firebase');
const aiService = require('../services/aiService');

const tasksCollection = 'tasks';

// Lazy load db to avoid initialization issues
const getDb = () => getFirestore();

/**
 * Create a new task
 */
const createTask = async (req, res) => {
  try {
    const { name, dueDate, category, mood, reason } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Task name is required' });
    }

    const taskData = {
      name,
      dueDate: dueDate || null,
      category: category || null,
      mood: mood || null,
      priority: null,
      reason: reason || null,
      isCompleted: false,
      completedAt: null,
      createdAt: new Date().toISOString()
    };

    const docRef = await getDb().collection(tasksCollection).add(taskData);
    
    res.status(201).json({
      message: 'Task created successfully',
      task: {
        id: docRef.id,
        ...taskData
      }
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

/**
 * Get all tasks
 */
const getAllTasks = async (req, res) => {
  try {
    const snapshot = await getDb().collection(tasksCollection).orderBy('createdAt', 'desc').get();
    
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

/**
 * Get pending tasks (not completed)
 */
const getPendingTasks = async (req, res) => {
  try {
    const snapshot = await getDb().collection(tasksCollection)
      .where('isCompleted', '==', false)
      .get();
    
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort in memory by createdAt (newest first)
    tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({ 
      count: tasks.length,
      tasks 
    });
  } catch (error) {
    console.error('Error fetching pending tasks:', error);
    res.status(500).json({ error: 'Failed to fetch pending tasks' });
  }
};

/**
 * Get completed tasks
 */
const getCompletedTasks = async (req, res) => {
  try {
    const snapshot = await getDb().collection(tasksCollection)
      .where('isCompleted', '==', true)
      .get();
    
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort in memory by completedAt (newest first)
    tasks.sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
      const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
      return dateB - dateA;
    });

    res.status(200).json({ 
      count: tasks.length,
      tasks 
    });
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ error: 'Failed to fetch completed tasks' });
  }
};

/**
 * Get a single task by ID
 */
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await getDb().collection(tasksCollection).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
};

/**
 * Update a task
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const docRef = getDb().collection(tasksCollection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await docRef.update(updates);

    const updatedDoc = await docRef.get();
    res.status(200).json({
      message: 'Task updated successfully',
      task: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

/**
 * Delete a task
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = getDb().collection(tasksCollection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await docRef.delete();
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

/**
 * Mark a task as done
 */
const markTaskDone = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = getDb().collection(tasksCollection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await docRef.update({
      isCompleted: true,
      completedAt: new Date().toISOString()
    });

    const updatedDoc = await docRef.get();
    res.status(200).json({
      message: 'Task marked as done',
      task: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error marking task as done:', error);
    res.status(500).json({ error: 'Failed to mark task as done' });
  }
};

/**
 * Mark a task as undone
 */
const markTaskUndone = async (req, res) => {
  try {
    const { id } = req.params;
    const docRef = getDb().collection(tasksCollection).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await docRef.update({
      isCompleted: false,
      completedAt: null
    });

    const updatedDoc = await docRef.get();
    res.status(200).json({
      message: 'Task marked as undone',
      task: {
        id: updatedDoc.id,
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error('Error marking task as undone:', error);
    res.status(500).json({ error: 'Failed to mark task as undone' });
  }
};

/**
 * Prioritize tasks using AI based on user's mood
 */
const prioritizeTasks = async (req, res) => {
  try {
    const { mood } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'User mood is required' });
    }

    // Fetch all tasks
    const snapshot = await getDb().collection(tasksCollection).get();
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (tasks.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'No tasks to prioritize',
        userMood: mood,
        aiUsed: false,
        tasks: [] 
      });
    }

    // Get AI prioritization
    console.log(`🤖 Using AI to prioritize ${tasks.length} tasks for mood: ${mood}`);
    const { prioritizedTasks, aiUsed } = await aiService.prioritizeTasks(tasks, mood);

    // Update tasks with new priorities
    const batch = getDb().batch();
    const updatedTasks = [];

    for (const prioritizedTask of prioritizedTasks) {
      const taskRef = getDb().collection(tasksCollection).doc(prioritizedTask.id);
      batch.update(taskRef, {
        priority: prioritizedTask.priority,
        reason: prioritizedTask.reason
      });

      const originalTask = tasks.find(t => t.id === prioritizedTask.id);
      updatedTasks.push({
        id: originalTask.id,
        name: originalTask.name,
        category: originalTask.category,
        dueDate: originalTask.dueDate,
        priority: prioritizedTask.priority,
        reason: prioritizedTask.reason
      });
    }

    await batch.commit();

    // Sort by priority
    updatedTasks.sort((a, b) => b.priority - a.priority);

    res.status(200).json({
      success: true,
      message: aiUsed ? 'Tasks prioritized by AI successfully' : 'Tasks prioritized using fallback logic',
      userMood: mood,
      aiUsed: aiUsed,
      totalTasks: updatedTasks.length,
      tasks: updatedTasks
    });
  } catch (error) {
    console.error('Error prioritizing tasks:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to prioritize tasks',
      details: error.message 
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getPendingTasks,
  getCompletedTasks,
  getTaskById,
  updateTask,
  deleteTask,
  markTaskDone,
  markTaskUndone,
  prioritizeTasks
};
