import React, { useEffect, useState } from 'react';
import { 
  Button, 
  Card, 
  Col, 
  Divider, 
  Form, 
  InputNumber, 
  List, 
  message, 
  Modal, 
  Row, 
  Select, 
  Space, 
  Tabs, 
  Typography 
} from 'antd';
import { 
  SaveOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  TrophyOutlined
} from '@ant-design/icons';
import { matchesApi, teamsApi, playersApi, goalsApi } from '@services/api';
import { Match, Team, Player, Goal } from '@types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface MatchWithDetails extends Match {
  homeTeamName: string;
  awayTeamName: string;
  goals: Goal[];
  homeTeam?: Team;
  awayTeam?: Team;
}

interface FormattedGoal extends Goal {
  playerName: string;
  teamName: string;
}

const ResultEntry: React.FC = () => {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalFormVisible, setGoalFormVisible] = useState(false);
  const [messageApi] = message.useMessage();
  const [form] = Form.useForm();
  const [goalForm] = Form.useForm();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [matchesData, teamsData, playersData] = await Promise.all([
          matchesApi.getAll(),
          teamsApi.getAll(),
          playersApi.getAll()
        ]);
        
        // Enrich matches with team names and goals
        const enrichedMatches = matchesData.map(match => {
          const homeTeam = teamsData.find(team => team.id === match.homeTeamId);
          const awayTeam = teamsData.find(team => team.id === match.awayTeamId);
          
          return {
            ...match,
            homeTeamName: homeTeam?.name || 'לא ידוע',
            awayTeamName: awayTeam?.name || 'לא ידוע',
            goals: [],
            homeTeam,
            awayTeam
          };
        });
        
        setMatches(enrichedMatches);
        setTeams(teamsData);
        setPlayers(playersData);
      } catch (error) {
        messageApi.error('שגיאה בטעינת נתוני המשחקים');
        console.error('Error fetching match data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [messageApi]);

  // Split matches by status (completed and pending)
  const completedMatches = matches.filter(match => match.homeScore !== null && match.awayScore !== null);
  const pendingMatches = matches.filter(match => match.homeScore === null || match.awayScore === null);

  // Open the form
  const showResultForm = (match: MatchWithDetails) => {
    setSelectedMatch(match);
    form.setFieldsValue({
      homeScore: match.homeScore || 0,
      awayScore: match.awayScore || 0
    });
    setModalVisible(true);
  };

  // Save the match result
  const handleSaveResult = async (values: any) => {
    if (!selectedMatch) return;
    
    try {
      await matchesApi.update(selectedMatch.id, values);
      
      // Update local state
      setMatches(prev => 
        prev.map(match => 
          match.id === selectedMatch.id 
            ? { ...match, ...values } 
            : match
        )
      );
      
      messageApi.success('תוצאת המשחק נשמרה בהצלחה');
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving match result:', error);
      messageApi.error('שגיאה בשמירת תוצאת המשחק');
    }
  };

  // Show goal form
  const showGoalForm = () => {
    goalForm.resetFields();
    setGoalFormVisible(true);
  };

  // Add a goal to the match
  const handleAddGoal = async (values: any) => {
    if (!selectedMatch) return;
    
    try {
      const newGoal = {
        matchId: selectedMatch.id,
        playerId: values.playerId,
        teamId: values.teamId,
        timestamp: new Date().toISOString()
      };
      
      const addedGoal = await goalsApi.create(newGoal);
      
      // Update local state
      setSelectedMatch(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          goals: [...prev.goals, addedGoal]
        };
      });
      
      messageApi.success('השער נוסף בהצלחה');
      setGoalFormVisible(false);
    } catch (error) {
      console.error('Error adding goal:', error);
      messageApi.error('שגיאה בהוספת השער');
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (goalId: string) => {
    if (!selectedMatch) return;
    
    try {
      await goalsApi.delete(goalId);
      
      // Update local state
      setSelectedMatch(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          goals: prev.goals.filter(goal => goal.id !== goalId)
        };
      });
      
      messageApi.success('השער הוסר בהצלחה');
    } catch (error) {
      console.error('Error deleting goal:', error);
      messageApi.error('שגיאה בהסרת השער');
    }
  };

  // Format goals for display
  const formatGoals = (goals: Goal[]): FormattedGoal[] => {
    return goals.map(goal => {
      const player = players.find(p => p.id === goal.playerId);
      const team = teams.find(t => t.id === goal.teamId);
      
      return {
        ...goal,
        playerName: player ? `${player.firstName} ${player.lastName}` : 'לא ידוע',
        teamName: team?.name || 'לא ידוע'
      };
    });
  };

  return (
    <div>
      <Title level={2}>הזנת תוצאות</Title>
      
      <Tabs defaultActiveKey="pending">
        <TabPane tab={`משחקים ממתינים (${pendingMatches.length})`} key="pending">
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={pendingMatches}
            renderItem={match => (
              <List.Item>
                <Card 
                  title={
                    <Space size="large">
                      <Text>{match.homeTeamName}</Text>
                      <Text type="secondary">נגד</Text>
                      <Text>{match.awayTeamName}</Text>
                    </Space>
                  }
                  extra={
                    <Button 
                      type="primary" 
                      icon={<SaveOutlined />} 
                      onClick={() => showResultForm(match)}
                    >
                      הזנת תוצאה
                    </Button>
                  }
                >
                  <Text type="secondary">
                    {match.playedAt 
                      ? `תאריך: ${new Date(match.playedAt).toLocaleDateString('he-IL')}` 
                      : 'תאריך לא נקבע'}
                  </Text>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab={`משחקים שהסתיימו (${completedMatches.length})`} key="completed">
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={completedMatches}
            renderItem={match => (
              <List.Item>
                <Card 
                  title={
                    <Space size="large">
                      <Text>{match.homeTeamName}</Text>
                      <Text strong>{match.homeScore} - {match.awayScore}</Text>
                      <Text>{match.awayTeamName}</Text>
                    </Space>
                  }
                  extra={
                    <Button 
                      icon={<TrophyOutlined />} 
                      onClick={() => showResultForm(match)}
                    >
                      עריכת פרטים
                    </Button>
                  }
                >
                  <Text type="secondary">
                    {match.playedAt 
                      ? `תאריך: ${new Date(match.playedAt).toLocaleDateString('he-IL')}` 
                      : 'תאריך לא נקבע'}
                  </Text>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
      
      {/* Result Modal */}
      <Modal
        title={`הזנת תוצאה: ${selectedMatch?.homeTeamName} נגד ${selectedMatch?.awayTeamName}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          onFinish={handleSaveResult}
          layout="vertical"
          initialValues={{
            homeScore: selectedMatch?.homeScore || 0,
            awayScore: selectedMatch?.awayScore || 0
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="homeScore"
                label={selectedMatch?.homeTeamName}
                rules={[{ required: true, message: 'נא להזין תוצאה' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="awayScore"
                label={selectedMatch?.awayTeamName}
                rules={[{ required: true, message: 'נא להזין תוצאה' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider>שערים</Divider>
          
          <List
            size="small"
            bordered
            dataSource={selectedMatch?.goals ? formatGoals(selectedMatch.goals) : []}
            locale={{ emptyText: 'לא הוזנו שערים למשחק זה' }}
            renderItem={goal => (
              <List.Item
                actions={[
                  <Button 
                    key="delete" 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteGoal(goal.id)}
                  />
                ]}
              >
                <Text>{goal.playerName}</Text>
                <Text type="secondary"> ({goal.teamName})</Text>
              </List.Item>
            )}
          />
          
          <Button 
            icon={<PlusOutlined />} 
            onClick={showGoalForm}
            style={{ marginTop: 16, marginBottom: 16 }}
          >
            הוסף שער
          </Button>
          
          <div style={{ textAlign: 'left', marginTop: 16 }}>
            <Space>
              <Button type="primary" htmlType="submit">
                שמור תוצאה
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                ביטול
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
      
      {/* Goal Modal */}
      <Modal
        title="הוספת שער"
        open={goalFormVisible}
        onCancel={() => setGoalFormVisible(false)}
        footer={null}
      >
        <Form
          form={goalForm}
          onFinish={handleAddGoal}
          layout="vertical"
        >
          <Form.Item
            name="teamId"
            label="קבוצה"
            rules={[{ required: true, message: 'נא לבחור קבוצה' }]}
          >
            <Select placeholder="בחר קבוצה">
              {selectedMatch && [
                <Option key={selectedMatch.homeTeamId} value={selectedMatch.homeTeamId}>
                  {selectedMatch.homeTeamName}
                </Option>,
                <Option key={selectedMatch.awayTeamId} value={selectedMatch.awayTeamId}>
                  {selectedMatch.awayTeamName}
                </Option>
              ]}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="playerId"
            label="שחקן"
            rules={[{ required: true, message: 'נא לבחור שחקן' }]}
            dependencies={['teamId']}
          >
            <Select 
              placeholder="בחר שחקן"
              disabled={!goalForm.getFieldValue('teamId')}
            >
              {goalForm.getFieldValue('teamId') && players
                .filter(player => player.teamId === goalForm.getFieldValue('teamId'))
                .map(player => (
                  <Option key={player.id} value={player.id}>
                    {player.firstName} {player.lastName}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
          
          <div style={{ textAlign: 'left' }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit"
                disabled={!goalForm.getFieldValue('teamId') || !goalForm.getFieldValue('playerId')}
              >
                הוסף שער
              </Button>
              <Button onClick={() => setGoalFormVisible(false)}>
                ביטול
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ResultEntry; 