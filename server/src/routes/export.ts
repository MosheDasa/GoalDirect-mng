import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Export all data
router.get('/', (_req: Request, res: Response) => {
  try {
    const dataPath = path.join(__dirname, '../data');
    const exportData = {
      teams: JSON.parse(fs.readFileSync(path.join(dataPath, 'teams.json'), 'utf8')),
      players: JSON.parse(fs.readFileSync(path.join(dataPath, 'players.json'), 'utf8')),
      groups: JSON.parse(fs.readFileSync(path.join(dataPath, 'groups.json'), 'utf8')),
      matches: JSON.parse(fs.readFileSync(path.join(dataPath, 'matches.json'), 'utf8')),
      goals: JSON.parse(fs.readFileSync(path.join(dataPath, 'goals.json'), 'utf8')),
      standings: JSON.parse(fs.readFileSync(path.join(dataPath, 'standings.json'), 'utf8')),
      announcements: JSON.parse(fs.readFileSync(path.join(dataPath, 'announcements.json'), 'utf8'))
    };
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בייצוא הנתונים' });
  }
});

export { router as exportRouter }; 