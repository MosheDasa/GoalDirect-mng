import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Group, GroupsData, TeamsData } from '../types';
import { groups } from '../data/groups.json';
import { teams } from '../data/teams.json';

const router = express.Router();

// Get all groups
router.get('/', (req, res) => {
  res.json(groups);
});

// Get group by ID
router.get('/:id', (req, res) => {
  const group = groups.find(g => g.id === req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'הבית לא נמצא' });
  }
  res.json(group);
});

// Create new group
router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'שם הבית הוא שדה חובה' });
  }

  const group: Group = {
    id: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  groups.push(group);

  const data: GroupsData = { groups };
  fs.writeFileSync(
    path.join(__dirname, '../data/groups.json'),
    JSON.stringify(data, null, 2)
  );

  res.status(201).json(group);
});

// Update group
router.put('/:id', (req, res) => {
  const { name } = req.body;
  const group = groups.find(g => g.id === req.params.id);

  if (!group) {
    return res.status(404).json({ error: 'הבית לא נמצא' });
  }

  if (name) {
    group.name = name;
  }

  group.updatedAt = new Date().toISOString();

  const data: GroupsData = { groups };
  fs.writeFileSync(
    path.join(__dirname, '../data/groups.json'),
    JSON.stringify(data, null, 2)
  );

  res.json(group);
});

// Delete group
router.delete('/:id', (req, res) => {
  const index = groups.findIndex(g => g.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'הבית לא נמצא' });
  }

  // Remove group from teams
  teams.forEach(team => {
    if (team.groupId === groups[index].id) {
      team.groupId = "";
    }
  });

  groups.splice(index, 1);

  const groupsData: GroupsData = { groups };
  fs.writeFileSync(
    path.join(__dirname, '../data/groups.json'),
    JSON.stringify(groupsData, null, 2)
  );

  const teamsData: TeamsData = { teams };
  fs.writeFileSync(
    path.join(__dirname, '../data/teams.json'),
    JSON.stringify(teamsData, null, 2)
  );

  res.status(204).send();
});

router.post('/draw', (req, res) => {
  const { numberOfGroups } = req.body;
  
  if (!numberOfGroups || numberOfGroups < 1) {
    return res.status(400).json({ error: 'מספר הקבוצות חייב להיות גדול מ-0' });
  }

  // Clear existing groups
  groups.length = 0;

  // Create new groups
  for (let i = 0; i < numberOfGroups; i++) {
    const group: Group = {
      id: uuidv4(),
      name: `בית ${String.fromCharCode(65 + i)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    groups.push(group);
  }

  // Reset all teams' groupId to null
  teams.forEach(team => {
    team.groupId = "";
  });

  // Distribute teams randomly
  const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
  const teamsPerGroup = Math.floor(shuffledTeams.length / numberOfGroups);
  const remainingTeams = shuffledTeams.length % numberOfGroups;

  let currentTeamIndex = 0;
  groups.forEach((group, groupIndex) => {
    const teamsInGroup = teamsPerGroup + (groupIndex < remainingTeams ? 1 : 0);
    const groupTeams = shuffledTeams.slice(currentTeamIndex, currentTeamIndex + teamsInGroup);
    groupTeams.forEach(team => {
      const teamIndex = teams.findIndex(t => t.id === team.id);
      if (teamIndex !== -1) {
        teams[teamIndex].groupId = group.id;
      }
    });
    currentTeamIndex += teamsInGroup;
  });

  // Save changes to files
  const groupsData: GroupsData = { groups };
  fs.writeFileSync(
    path.join(__dirname, '../data/groups.json'),
    JSON.stringify(groupsData, null, 2)
  );

  const teamsData: TeamsData = { teams };
  fs.writeFileSync(
    path.join(__dirname, '../data/teams.json'),
    JSON.stringify(teamsData, null, 2)
  );

  res.json({ groups });
});

export { router as groupsRouter }; 