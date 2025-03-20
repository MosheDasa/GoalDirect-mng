import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Match } from '../types';
import { matches } from '../data/matches.json';

const router = express.Router();
const dataPath = path.join(__dirname, '../data/matches.json');

// Helper function to read data
const readData = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data: any) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all matches
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.matches);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני המשחקים' });
  }
});

// Get match by ID
router.get('/:id', (req, res) => {
  try {
    const data = readData();
    const match = data.matches.find((m: any) => m.id === req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'משחק לא נמצא' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני המשחק' });
  }
});

// Create new match
router.post('/', (req, res) => {
  try {
    const data = readData();
    const newMatch = {
      id: uuidv4(),
      date: req.body.date,
      homeTeamId: req.body.homeTeamId,
      awayTeamId: req.body.awayTeamId,
      groupId: req.body.groupId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.matches.push(newMatch);
    writeData(data);
    res.status(201).json(newMatch);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת משחק חדש' });
  }
});

// Update match
router.put('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.matches.findIndex((m: any) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'משחק לא נמצא' });
    }
    data.matches[index] = {
      ...data.matches[index],
      date: req.body.date,
      homeTeamId: req.body.homeTeamId,
      awayTeamId: req.body.awayTeamId,
      groupId: req.body.groupId,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    res.json(data.matches[index]);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון המשחק' });
  }
});

// Delete match
router.delete('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.matches.findIndex((m: any) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'משחק לא נמצא' });
    }
    data.matches.splice(index, 1);
    writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת המשחק' });
  }
});

export { router as matchesRouter }; 