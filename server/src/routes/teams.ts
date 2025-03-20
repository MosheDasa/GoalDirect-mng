import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Team } from '../types';
import { teams } from '../data/teams.json';

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
  res.json(teams);
});

// Get team by ID
router.get('/:id', (req, res) => {
  const team = teams.find(t => t.id === req.params.id);
  if (!team) {
    return res.status(404).json({ error: 'הקבוצה לא נמצאה' });
  }
  res.json(team);
});

// Create new team
router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'שם הקבוצה הוא שדה חובה' });
  }

  const team: Team = {
    id:  uuidv4(),
    name,
    groupId: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  teams.push(team);

  fs.writeFileSync(
    path.join(__dirname, '../data/teams.json'),
    JSON.stringify({ teams }, null, 2)
  );

  res.status(201).json(team);
});

// Update team
router.put('/:id', (req, res) => {
  const { name, groupId } = req.body;
  const team = teams.find(t => t.id === req.params.id);

  if (!team) {
    return res.status(404).json({ error: 'הקבוצה לא נמצאה' });
  }

  if (name) {
    team.name = name;
  }

  if (groupId !== undefined) {
    team.groupId = groupId;
  }

  team.updatedAt = new Date().toISOString();

  fs.writeFileSync(
    path.join(__dirname, '../data/teams.json'),
    JSON.stringify({ teams }, null, 2)
  );

  res.json(team);
});

// Delete team
router.delete('/:id', (req, res) => {
  const index = teams.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'הקבוצה לא נמצאה' });
  }

  teams.splice(index, 1);

  fs.writeFileSync(
    path.join(__dirname, '../data/teams.json'),
    JSON.stringify({ teams }, null, 2)
  );

  res.status(204).send();
});

export { router as teamsRouter }; 