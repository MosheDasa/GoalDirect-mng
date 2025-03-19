import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const dataPath = path.join(__dirname, '../data/goals.json');

// Helper function to read data
const readData = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data: any) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all goals
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.goals);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני השערים' });
  }
});

// Get goal by ID
router.get('/:id', (req, res) => {
  try {
    const data = readData();
    const goal = data.goals.find((g: any) => g.id === req.params.id);
    if (!goal) {
      return res.status(404).json({ error: 'שער לא נמצא' });
    }
    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני השער' });
  }
});

// Create new goal
router.post('/', (req, res) => {
  try {
    const data = readData();
    const newGoal = {
      id: uuidv4(),
      matchId: req.body.matchId,
      playerId: req.body.playerId,
      minute: req.body.minute,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.goals.push(newGoal);
    writeData(data);
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת שער חדש' });
  }
});

// Update goal
router.put('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.goals.findIndex((g: any) => g.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'שער לא נמצא' });
    }
    data.goals[index] = {
      ...data.goals[index],
      matchId: req.body.matchId,
      playerId: req.body.playerId,
      minute: req.body.minute,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    res.json(data.goals[index]);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון השער' });
  }
});

// Delete goal
router.delete('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.goals.findIndex((g: any) => g.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'שער לא נמצא' });
    }
    data.goals.splice(index, 1);
    writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת השער' });
  }
});

export { router as goalsRouter }; 