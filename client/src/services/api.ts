import axios from 'axios';
import { 
  Team, 
  Player, 
  Group, 
  Match, 
  Goal, 
  Announcement, 
  TeamStanding, 
  TopScorer 
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teams API
export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    const response = await api.get('/teams');
    return response.data;
  },
  getById: async (id: string): Promise<Team> => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },
  create: async (data: Omit<Team, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>): Promise<Team> => {
    const response = await api.post('/teams', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Team>): Promise<Team> => {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },
};

// Players API
export const playersApi = {
  getAll: async (): Promise<Player[]> => {
    const response = await api.get('/players');
    return response.data;
  },
  getById: async (id: string): Promise<Player> => {
    const response = await api.get(`/players/${id}`);
    return response.data;
  },
  getByTeam: async (teamId: string): Promise<Player[]> => {
    const response = await api.get(`/teams/${teamId}/players`);
    return response.data;
  },
  create: async (player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> => {
    const response = await api.post('/players', player);
    return response.data;
  },
  update: async (id: string, player: Partial<Player>): Promise<Player> => {
    const response = await api.put(`/players/${id}`, player);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/players/${id}`);
  },
  getStats: async (id: string): Promise<TopScorer> => {
    const response = await api.get(`/players/${id}/stats`);
    return response.data;
  },
};

// Groups API
export const groupsApi = {
  getAll: async (): Promise<Group[]> => {
    const response = await api.get('/groups');
    return response.data;
  },
  getById: async (id: string): Promise<Group> => {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },
  create: async (data: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>): Promise<Group> => {
    const response = await api.post('/groups', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Group>): Promise<Group> => {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}`);
  },
  createDraw: async (numberOfGroups: number): Promise<{ groups: Group[] }> => {
    const response = await api.post('/groups/draw', { numberOfGroups });
    return response.data;
  },
};

// Matches API
export const matchesApi = {
  getAll: async (): Promise<Match[]> => {
    const response = await api.get('/matches');
    return response.data;
  },
  getById: async (id: string): Promise<Match> => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },
  create: async (match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> => {
    const response = await api.post('/matches', match);
    return response.data;
  },
  update: async (id: string, match: Partial<Match>): Promise<Match> => {
    const response = await api.put(`/matches/${id}`, match);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/matches/${id}`);
  },
};

// Goals API
export const goalsApi = {
  getAll: async (): Promise<Goal[]> => {
    const response = await api.get('/goals');
    return response.data;
  },
  getById: async (id: string): Promise<Goal> => {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },
  create: async (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> => {
    const response = await api.post('/goals', goal);
    return response.data;
  },
  update: async (id: string, goal: Partial<Goal>): Promise<Goal> => {
    const response = await api.put(`/goals/${id}`, goal);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },
};

// Draw API
export const drawApi = {
  createDraw: async (numberOfGroups: number): Promise<{ groups: Group[], matches: Match[] }> => {
    const response = await api.post('/draw', { numberOfGroups });
    return response.data;
  },
};

// Standings API
export const standingsApi = {
  getAll: async (): Promise<TeamStanding[]> => {
    const response = await api.get('/standings');
    return response.data;
  },
  getTopScorers: async (): Promise<TopScorer[]> => {
    const response = await api.get('/players');
    return response.data;
  },
};

// Announcements API
export const announcementsApi = {
  getAll: async (): Promise<Announcement[]> => {
    const response = await api.get('/announcements');
    return response.data;
  },
  getById: async (id: string): Promise<Announcement> => {
    const response = await api.get(`/announcements/${id}`);
    return response.data;
  },
  create: async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> => {
    const response = await api.post('/announcements', announcement);
    return response.data;
  },
  update: async (id: string, announcement: Partial<Announcement>): Promise<Announcement> => {
    const response = await api.put(`/announcements/${id}`, announcement);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/announcements/${id}`);
  },
};

// Export API
export const exportApi = {
  teams: async (): Promise<Blob> => {
    const response = await api.get('/export/teams', { responseType: 'blob' });
    return response.data;
  },
  players: async (): Promise<Blob> => {
    const response = await api.get('/export/players', { responseType: 'blob' });
    return response.data;
  },
  matches: async (): Promise<Blob> => {
    const response = await api.get('/export/matches', { responseType: 'blob' });
    return response.data;
  },
  standings: async (): Promise<Blob> => {
    const response = await api.get('/export/standings', { responseType: 'blob' });
    return response.data;
  },
  statistics: async (): Promise<Blob> => {
    const response = await api.get('/export/statistics', { responseType: 'blob' });
    return response.data;
  },
}; 