import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface Group {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupsData {
  groups: Group[];
}

const router = express.Router();
const dataPath = path.join(__dirname, '../data/groups.json');

// Helper function to read data
const readData = (): GroupsData => {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (data: GroupsData): void => {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Get all groups
router.get('/', (_req: Request, res: Response) => {
  try {
    const data = readData();
    res.json(data.groups);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני הקבוצות' });
  }
});

// Get group by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const data = readData();
    const group = data.groups.find((g) => g.id === req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'קבוצה לא נמצאה' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני הקבוצה' });
  }
});

// Create new group
router.post('/', (req: Request, res: Response) => {
  try {
    const data = readData();
    const newGroup: Group = {
      id: uuidv4(),
      name: req.body.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.groups.push(newGroup);
    writeData(data);
    res.status(201).json(newGroup);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת קבוצה חדשה' });
  }
});

// Update group
router.put('/:id', (req: Request, res: Response) => {
  try {
    const data = readData();
    const index = data.groups.findIndex((g) => g.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'קבוצה לא נמצאה' });
    }
    data.groups[index] = {
      ...data.groups[index],
      name: req.body.name,
      updatedAt: new Date().toISOString()
    };
    writeData(data);
    res.json(data.groups[index]);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון הקבוצה' });
  }
});

// Delete group
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const data = readData();
    const index = data.groups.findIndex((g) => g.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'קבוצה לא נמצאה' });
    }
    data.groups.splice(index, 1);
    writeData(data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת הקבוצה' });
  }
});

export { router as groupsRouter }; 