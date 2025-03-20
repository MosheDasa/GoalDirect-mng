import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Team, Player, Group, Match, Goal, Announcement, Standing } from '../types';

const router = express.Router();

// Export all data
router.get('/', (_req: Request, res: Response) => {
  try {
    const dataPath = path.join(__dirname, '../data');
    
    // Read and parse all data files
    const teams = JSON.parse(fs.readFileSync(path.join(dataPath, 'teams.json'), 'utf8')).teams as Team[];
    const players = JSON.parse(fs.readFileSync(path.join(dataPath, 'players.json'), 'utf8')).players as Player[];
    const groups = JSON.parse(fs.readFileSync(path.join(dataPath, 'groups.json'), 'utf8')).groups as Group[];
    const matches = JSON.parse(fs.readFileSync(path.join(dataPath, 'matches.json'), 'utf8')).matches as Match[];
    const goals = JSON.parse(fs.readFileSync(path.join(dataPath, 'goals.json'), 'utf8')).goals as Goal[];
    const standings = JSON.parse(fs.readFileSync(path.join(dataPath, 'standings.json'), 'utf8')).standings as Standing[];
    const announcements = JSON.parse(fs.readFileSync(path.join(dataPath, 'announcements.json'), 'utf8')).announcements as Announcement[];

    // Enrich matches with team names and goals
    const enrichedMatches = matches.map(match => {
      const homeTeam = teams.find(t => t.id === match.homeTeamId);
      const awayTeam = teams.find(t => t.id === match.awayTeamId);
      const matchGoals = goals.filter(g => g.matchId === match.id);

      return {
        ...match,
        homeTeamName: homeTeam?.name || 'לא ידוע',
        awayTeamName: awayTeam?.name || 'לא ידוע',
        goals: matchGoals,
        homeTeam,
        awayTeam
      };
    });

    // Enrich goals with player and team names
    const enrichedGoals = goals.map(goal => {
      const player = players.find(p => p.id === goal.playerId);
      const team = teams.find(t => t.id === goal.teamId);
      
      return {
        ...goal,
        playerName: player ? `${player.firstName} ${player.lastName}` : 'לא ידוע',
        teamName: team?.name || 'לא ידוע'
      };
    });

    // Return enriched data
    res.json({
      teams,
      players,
      groups,
      matches: enrichedMatches,
      goals: enrichedGoals,
      standings,
      announcements
    });
  } catch (error) {
    res.status(500).json({ error: 'שגיאה בייצוא הנתונים' });
  }
});

export { router as exportRouter }; 