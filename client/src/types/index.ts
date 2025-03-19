export interface Team {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  teamId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupTeam {
  id: string;
  groupId: string;
  teamId: string;
}

export interface Match {
  id: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  groupId: string;
  playedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  matchId: string;
  playerId: string;
  teamId: string;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamStanding {
  teamId: string;
  position: number;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface TopScorer {
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
} 