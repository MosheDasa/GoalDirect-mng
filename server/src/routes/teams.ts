import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const dataPath = path.join(__dirname, '../data/teams.json');

// Helper function to read data
const readData = () => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data: any) => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all teams
router.get('/', (req, res) => {
  try {
    const data = readData();
    res.json(data.teams);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני הקבוצות' });
  }
});

// Get team by ID
router.get('/:id', (req, res) => {
  try {
    const data = readData();
    const team = data.teams.find((t: any) => t.id === req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'קבוצה לא נמצאה' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני הקבוצה' });
  }
});

// Create new team
router.post('/', (req, res) => {
  try {
    const data = readData();
    const newTeam = {
      id: uuidv4(),
      name: req.body.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.teams.push(newTeam);
    writeData(data);
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת קבוצה חדשה' });
  }
});

// Update team
router.put('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.teams.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'קבוצה לא נמצאה' });
    }
    data.teams[index] = {
      ...data.teams[index],
      name: req.body.name,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    res.json(data.teams[index]);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון הקבוצה' });
  }
});

// Delete team
router.delete('/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.teams.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'קבוצה לא נמצאה' });
    }
    data.teams.splice(index, 1);
    writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת הקבוצה' });
  }
});

export { router as teamsRouter }; 