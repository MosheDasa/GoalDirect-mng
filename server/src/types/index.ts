export interface Team {
  id: string;
  name: string;
  groupId: string ;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
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
  minute: number;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Standing {
  id: string;
  teamId: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
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

export interface MatchWithDetails extends Match {
  homeTeamName: string;
  awayTeamName: string;
  goals: Goal[];
  homeTeam?: Team;
  awayTeam?: Team;
}

export interface FormattedGoal extends Goal {
  playerName: string;
  teamName: string;
}

export interface Group {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamsData {
  teams: Team[];
}

export interface GroupsData {
  groups: Group[];
} 