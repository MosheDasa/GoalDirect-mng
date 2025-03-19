import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const dataPath = path.join(__dirname, '../data/players.json');

// Helper function to read data
const readData = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data: any) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all players
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.players);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני השחקנים' });
  }
});

// Get player by ID
router.get('/:id', (req, res) => {
  try {
    const data = readData();
    const player = data.players.find((p: any) => p.id === req.params.id);
    if (!player) {
      return res.status(404).json({ error: 'שחקן לא נמצא' });
    }
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני השחקן' });
  }
});

// Create new player
router.post('/', (req, res) => {
  try {
    const data = readData();
    const newPlayer = {
      id: uuidv4(),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      teamId: req.body.teamId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.players.push(newPlayer);
    writeData(data);
    res.status(201).json(newPlayer);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת שחקן חדש' });
  }
});

// Update player
router.put('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.players.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'שחקן לא נמצא' });
    }
    data.players[index] = {
      ...data.players[index],
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      teamId: req.body.teamId,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    res.json(data.players[index]);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון השחקן' });
  }
});

// Delete player
router.delete('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.players.findIndex((p: any) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'שחקן לא נמצא' });
    }
    data.players.splice(index, 1);
    writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת השחקן' });
  }
});

export { router as playersRouter }; 