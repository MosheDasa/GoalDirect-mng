import express from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Match, MatchWithDetails, Team, Goal } from '../types';
import { matches } from '../data/matches.json';
import { teams } from '../data/teams.json';
import { goals } from '../data/goals.json';

const router = express.Router();
const matchesPath = path.join(__dirname, '../data/matches.json');
const teamsPath = path.join(__dirname, '../data/teams.json');
const goalsPath = path.join(__dirname, '../data/goals.json');

// Helper function to read data
const readData = (filePath: string) => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write data
const writeData = (filePath: string, data: any) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Helper function to enrich match with team details and goals
const enrichMatch = (match: Match): MatchWithDetails => {
  const homeTeam = teams.find(t => t.id === match.homeTeamId);
  const awayTeam = teams.find(t => t.id === match.awayTeamId);
  const matchGoals = goals.filter(g => g.matchId === match.id).map(goal => ({
    ...goal,
    timestamp: goal.createdAt // Use createdAt as timestamp
  }));

  return {
    ...match,
    homeTeamName: homeTeam?.name || 'לא ידוע',
    awayTeamName: awayTeam?.name || 'לא ידוע',
    goals: matchGoals,
    homeTeam: homeTeam || undefined,
    awayTeam: awayTeam || undefined
  };
};

// Get all matches
router.get('/', (req, res) => {
  try {
    const data = readData(matchesPath);
    const enrichedMatches = data.matches.map(enrichMatch);
    res.json(enrichedMatches);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני המשחקים' });
  }
});

// Get match by ID
router.get('/:id', (req, res) => {
  try {
    const data = readData(matchesPath);
    const match = data.matches.find((m: Match) => m.id === req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'משחק לא נמצא' });
    }
    res.json(enrichMatch(match));
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני המשחק' });
  }
});

// Get match goals
router.get('/:id/goals', (req, res) => {
  try {
    const data = readData(goalsPath);
    const matchGoals = data.goals.filter((g: Goal) => g.matchId === req.params.id);
    res.json(matchGoals);
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בטעינת נתוני השערים' });
  }
});

// Create new match
router.post('/', (req, res) => {
  try {
    const data = readData(matchesPath);
    const newMatch: Match = {
      id: uuidv4(),
      date: req.body.date,
      homeTeamId: req.body.homeTeamId,
      awayTeamId: req.body.awayTeamId,
      groupId: req.body.groupId,
      homeScore: null,
      awayScore: null,
      playedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.matches.push(newMatch);
    writeData(matchesPath, data);
    res.status(201).json(enrichMatch(newMatch));
  } catch (error) {
    res.status(500).json({ error: 'שגיאה ביצירת משחק חדש' });
  }
});

// Update match
router.put('/:id', (req, res) => {
  try {
    const data = readData(matchesPath);
    const index = data.matches.findIndex((m: Match) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'משחק לא נמצא' });
    }
    data.matches[index] = {
      ...data.matches[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    writeData(matchesPath, data);
    res.json(enrichMatch(data.matches[index]));
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בעדכון המשחק' });
  }
});

// Delete match
router.delete('/:id', (req, res) => {
  try {
    const data = readData(matchesPath);
    const index = data.matches.findIndex((m: Match) => m.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'משחק לא נמצא' });
    }
    data.matches.splice(index, 1);
    writeData(matchesPath, data);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'שגיאה במחיקת המשחק' });
  }
});

export { router as matchesRouter }; 