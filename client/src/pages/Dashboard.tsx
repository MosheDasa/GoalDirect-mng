import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Statistic, List, Typography, Button } from 'antd';
import { 
  TeamOutlined, 
  UserOutlined, 
  TrophyOutlined, 
  NotificationOutlined 
} from '@ant-design/icons';
import { teamsApi, playersApi, matchesApi, announcementsApi } from '@services/api';
import { Team, Player, Match, Announcement } from '@types';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsData, playersData, matchesData, announcementsData] = await Promise.all([
          teamsApi.getAll(),
          playersApi.getAll(),
          matchesApi.getAll(),
          announcementsApi.getAll()
        ]);
        
        setTeams(teamsData);
        setPlayers(playersData);
        setMatches(matchesData);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate stats
  const teamCount = teams.length;
  const playerCount = players.length;
  const completedMatches = matches.filter(match => match.homeScore !== null && match.awayScore !== null).length;
  const pendingMatches = matches.length - completedMatches;

  // Upcoming matches (showing only first 5)
  const upcomingMatches = matches
    .filter(match => match.homeScore === null && match.awayScore === null)
    .slice(0, 5)
    .map(match => {
      const homeTeam = teams.find(team => team.id === match.homeTeamId)?.name || 'לא ידוע';
      const awayTeam = teams.find(team => team.id === match.awayTeamId)?.name || 'לא ידוע';
      return {
        id: match.id,
        title: `${homeTeam} נגד ${awayTeam}`,
        date: match.playedAt ? new Date(match.playedAt).toLocaleDateString('he-IL') : 'תאריך לא נקבע'
      };
    });

  // Recent announcements (showing only first 3)
  const recentAnnouncements = announcements
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div>
      <Title level={2}>לוח בקרה</Title>
      
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="קבוצות"
              value={teamCount}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="שחקנים"
              value={playerCount}
              prefix={<UserOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="משחקים שהסתיימו"
              value={completedMatches}
              prefix={<TrophyOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="משחקים מתוכננים"
              value={pendingMatches}
              prefix={<TrophyOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Action Buttons */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Button type="primary" block size="large">
            <Link to="/teams">ניהול קבוצות</Link>
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button type="primary" block size="large">
            <Link to="/players">ניהול שחקנים</Link>
          </Button>
        </Col>
        <Col xs={24} sm={8}>
          <Button type="primary" block size="large">
            <Link to="/results">הזנת תוצאות</Link>
          </Button>
        </Col>
      </Row>

      {/* Lists Section */}
      <Row gutter={16}>
        {/* Upcoming Matches */}
        <Col xs={24} md={12} style={{ marginBottom: 16 }}>
          <Card title="משחקים קרובים" extra={<Link to="/results">הכל</Link>}>
            <List
              loading={loading}
              dataSource={upcomingMatches}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.date}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'אין משחקים מתוכננים' }}
            />
          </Card>
        </Col>

        {/* Recent Announcements */}
        <Col xs={24} md={12}>
          <Card title="הודעות אחרונות" extra={<Link to="/announcements">הכל</Link>}>
            <List
              loading={loading}
              dataSource={recentAnnouncements}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={new Date(item.createdAt).toLocaleDateString('he-IL')}
                  />
                </List.Item>
              )}
              locale={{ emptyText: 'אין הודעות' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 