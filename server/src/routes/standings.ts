import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Standing } from '../types';
import { standings } from '../data/standings.json';

const router = express.Router();
const dataPath = path.join(__dirname, '../data/standings.json');

// Helper function to read data
const readData = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data: any) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all standings
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.standings);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני הטבלאות' });
  }
});

// Get standing by ID
router.get('/:id', (req, res) => {
  try {
    const data = readData();
    const standing = data.standings.find((s: any) => s.id === req.params.id);
    if (!standing) {
      return res.status(404).json({ error: 'טבלה לא נמצאה' });
    }
    res.json(standing);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני הטבלה' });
  }
});

// Create new standing
router.post('/', (req, res) => {
  try {
    const data = readData();
    const newStanding = {
      id: uuidv4(),
      teamId: req.body.teamId,
      matchesPlayed: req.body.matchesPlayed,
      wins: req.body.wins,
      draws: req.body.draws,
      losses: req.body.losses,
      goalsFor: req.body.goalsFor,
      goalsAgainst: req.body.goalsAgainst,
      points: req.body.points,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.standings.push(newStanding);
    writeData(data);
    res.status(201).json(newStanding);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת טבלה חדשה' });
  }
});

// Update standing
router.put('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.standings.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'טבלה לא נמצאה' });
    }
    data.standings[index] = {
      ...data.standings[index],
      teamId: req.body.teamId,
      matchesPlayed: req.body.matchesPlayed,
      wins: req.body.wins,
      draws: req.body.draws,
      losses: req.body.losses,
      goalsFor: req.body.goalsFor,
      goalsAgainst: req.body.goalsAgainst,
      points: req.body.points,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    res.json(data.standings[index]);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון הטבלה' });
  }
});

// Delete standing
router.delete('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.standings.findIndex((s: any) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'טבלה לא נמצאה' });
    }
    data.standings.splice(index, 1);
    writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת הטבלה' });
  }
});

export { router as standingsRouter }; 