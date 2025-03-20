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
import { Match, Team, Player, Goal, MatchWithDetails, FormattedGoal } from '../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ResultEntry: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchWithDetails | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalFormVisible, setGoalFormVisible] = useState(false);
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
        
        setMatches(matchesData);
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
        minute: values.minute,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
      {contextHolder}
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
                      <Text type="secondary">נגד</Text>
                      <Text>{match.awayTeamName}</Text>
                    </Space>
                  }
                  extra={
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => {
                          setSelectedMatch(match);
                          showGoalForm();
                        }}
                      >
                        הוספת שער
                      </Button>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />} 
                        onClick={() => showResultForm(match)}
                      >
                        עדכון תוצאה
                      </Button>
                    </Space>
                  }
                >
                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      {match.playedAt 
                        ? `תאריך: ${new Date(match.playedAt).toLocaleDateString('he-IL')}` 
                        : 'תאריך לא נקבע'}
                    </Text>
                    <Text strong>
                      תוצאה: {match.homeScore} - {match.awayScore}
                    </Text>
                    {match.goals.length > 0 && (
                      <>
                        <Divider />
                        <Text strong>שערים:</Text>
                        <List
                          size="small"
                          dataSource={formatGoals(match.goals)}
                          renderItem={goal => (
                            <List.Item
                              actions={[
                                <Button 
                                  type="text" 
                                  danger 
                                  icon={<DeleteOutlined />} 
                                  onClick={() => handleDeleteGoal(goal.id)}
                                />
                              ]}
                            >
                              <Space>
                                <Text>{goal.playerName}</Text>
                                <Text type="secondary">({goal.teamName})</Text>
                                <Text type="secondary">{goal.minute}'</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </>
                    )}
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>

      <Modal
        title="הזנת תוצאה"
        open={modalVisible}
        onOk={form.submit}
        onCancel={() => setModalVisible(false)}
      >
        <Form
          form={form}
          onFinish={handleSaveResult}
          layout="vertical"
        >
          <Form.Item
            name="homeScore"
            label="תוצאה ביתית"
            rules={[{ required: true, message: 'נא להזין תוצאה ביתית' }]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="awayScore"
            label="תוצאה חיצונית"
            rules={[{ required: true, message: 'נא להזין תוצאה חיצונית' }]}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="הוספת שער"
        open={goalFormVisible}
        onOk={goalForm.submit}
        onCancel={() => setGoalFormVisible(false)}
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
            <Select>
              {selectedMatch && (
                <>
                  <Option value={selectedMatch.homeTeamId}>{selectedMatch.homeTeamName}</Option>
                  <Option value={selectedMatch.awayTeamId}>{selectedMatch.awayTeamName}</Option>
                </>
              )}
            </Select>
          </Form.Item>
          <Form.Item
            name="playerId"
            label="שחקן"
            rules={[{ required: true, message: 'נא לבחור שחקן' }]}
          >
            <Select>
              {players.map(player => (
                <Option key={player.id} value={player.id}>
                  {player.firstName} {player.lastName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="minute"
            label="דקה"
            rules={[{ required: true, message: 'נא להזין דקה' }]}
          >
            <InputNumber min={1} max={120} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResultEntry; 