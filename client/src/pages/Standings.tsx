import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Typography, 
  Card, 
  Tabs, 
  Badge, 
  Avatar, 
  Space 
} from 'antd';
import { 
  TrophyOutlined, 
  TeamOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import { standingsApi, teamsApi } from '@services/api';
import { TeamStanding, TopScorer, Team } from '../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface TeamStandingWithDetails extends TeamStanding {
  team: Team;
  draws: number;
  goalDifference: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

const Standings: React.FC = () => {
  const [standings, setStandings] = useState<TeamStandingWithDetails[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [standingsData, scorersData, teamsData] = await Promise.all([
        standingsApi.getAll(),
        standingsApi.getTopScorers(),
        teamsApi.getAll()
      ]);
      
      // Add team details to standings
      const standingsWithDetails = standingsData.map(standing => ({
        ...standing,
        team: teamsData.find(team => team.id === standing.teamId)!,
        draws: standing.draws,
        goalDifference: standing.goalsFor - standing.goalsAgainst,
        matchesPlayed: standing.matchesPlayed,
        wins: standing.wins,
        losses: standing.losses,
        goalsFor: standing.goalsFor,
        goalsAgainst: standing.goalsAgainst,
        points: standing.points
      }));
      
      setStandings(standingsWithDetails);
      setTopScorers(scorersData);
      setTeams(teamsData);
    } catch (error) {
      console.error('Error fetching standings data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Columns for standings table
  const standingsColumns = [
    {
      title: 'מיקום',
      dataIndex: 'position',
      key: 'position',
      render: (_: any, _record: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: 'קבוצה',
      dataIndex: 'team',
      key: 'team',
      render: (team: Team) => (
        <Space>
          <Avatar style={{ backgroundColor: getTeamColor(team.id) }}>{team.name[0]}</Avatar>
          <span>{team.name}</span>
        </Space>
      ),
    },
    {
      title: 'משחקים',
      dataIndex: 'matchesPlayed',
      key: 'matchesPlayed',
      sorter: (a: TeamStandingWithDetails, b: TeamStandingWithDetails) => a.matchesPlayed - b.matchesPlayed,
    },
    {
      title: 'ניצחונות',
      dataIndex: 'wins',
      key: 'wins',
      sorter: (a: TeamStandingWithDetails, b: TeamStandingWithDetails) => a.wins - b.wins,
    },
    {
      title: 'תיקו',
      dataIndex: 'draws',
      key: 'draws',
      sorter: (a: TeamStandingWithDetails, b: TeamStandingWithDetails) => a.draws - b.draws,
    },
    {
      title: 'הפסדים',
      dataIndex: 'losses',
      key: 'losses',
      sorter: (a: TeamStandingWithDetails, b: TeamStandingWithDetails) => a.losses - b.losses,
    },
    {
      title: 'נצחונות',
      dataIndex: 'goalsFor',
      key: 'goalsFor',
      sorter: (a: TeamStandingWithDetails, b: TeamStandingWithDetails) => a.goalsFor - b.goalsFor,
    },
    {
      title: 'נצחונות',
      dataIndex: 'goalsAgainst',
      key: 'goalsAgainst',
      sorter: (a: TeamStandingWithDetails, b: TeamStandingWithDetails) => a.goalsAgainst - b.goalsAgainst,
    },
    {
      title: 'נצחונות',
      dataIndex: 'goalDifference',
      key: 'goalDifference',
      sorter: (a: TeamStandingWithDetails, b: TeamStandingWithDetails) => a.goalDifference - b.goalDifference,
    },
    {
      title: 'נקודות',
      dataIndex: 'points',
      key: 'points',
      sorter: (a: TeamStandingWithDetails, b: TeamStandingWithDetails) => a.points - b.points,
      defaultSortOrder: 'descend' as const,
      render: (points: number) => (
        <Space>
          <TrophyOutlined style={{ color: points > 0 ? '#f0ad4e' : '#d9d9d9' }} />
          <span>{points}</span>
        </Space>
      ),
    },
  ];

  // Columns for top scorers table
  const scorersColumns = [
    {
      title: 'מיקום',
      dataIndex: 'position',
      key: 'position',
      render: (_: any, _record: any, index: number) => index + 1,
      width: 80,
    },
    {
      title: 'שחקן',
      dataIndex: 'player',
      key: 'player',
      render: (player: { firstName: string; lastName: string; teamId: string }) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <span>{`${player.firstName} ${player.lastName}`}</span>
          <span style={{ color: '#999' }}>
            ({teams.find(team => team.id === player.teamId)?.name})
          </span>
        </Space>
      ),
    },
    {
      title: 'שערים',
      dataIndex: 'goals',
      key: 'goals',
      sorter: (a: TopScorer, b: TopScorer) => a.goals - b.goals,
      defaultSortOrder: 'descend' as const,
    },
  ];

  // Helper function to get team color based on team ID
  const getTeamColor = (teamId: string): string => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1890ff'];
    const index = teams.findIndex(team => team.id === teamId);
    return colors[index % colors.length];
  };

  return (
    <div>
      <Title level={2}>טבלת דירוג</Title>
      
      <Tabs defaultActiveKey="standings">
        <TabPane tab="טבלת קבוצות" key="standings">
          <Card>
            <Table 
              columns={standingsColumns} 
              dataSource={standings} 
              rowKey="teamId"
              loading={loading}
              pagination={false}
              locale={{ emptyText: 'אין נתוני דירוג זמינים' }}
            />
          </Card>
        </TabPane>
        <TabPane tab="מלכי שערים" key="scorers">
          <Card>
            <Table 
              columns={scorersColumns} 
              dataSource={topScorers} 
              rowKey="playerId"
              loading={loading}
              pagination={false}
              locale={{ emptyText: 'אין נתוני כובשים זמינים' }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Standings; 