import React, { useEffect, useState } from 'react';
import { 
  Button, 
  Card, 
  Divider, 
  Form, 
  InputNumber, 
  List, 
  message, 
  Result, 
  Space, 
  Spin, 
  Steps, 
  Typography 
} from 'antd';
import { 
  GroupOutlined, 
  SyncOutlined, 
  CheckCircleOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { teamsApi, drawApi } from '@services/api';
import { Team, Group, Match } from '@types';

const { Title, Text } = Typography;

const GroupDraw: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawLoading, setDrawLoading] = useState(false);
  const [drawCompleted, setDrawCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [messageApi] = message.useMessage();
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const teamsData = await teamsApi.getAll();
        setTeams(teamsData);
      } catch (error) {
        messageApi.error('שגיאה בטעינת נתוני הקבוצות');
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [messageApi]);

  const handleDraw = async (values: { numberOfGroups: number }) => {
    try {
      setDrawLoading(true);
      
      const { numberOfGroups } = values;
      
      if (teams.length < numberOfGroups) {
        messageApi.error(`לא ניתן לחלק ${teams.length} קבוצות ל-${numberOfGroups} בתים`);
        return;
      }
      
      const result = await drawApi.createDraw(numberOfGroups);
      
      setGroups(result.groups);
      setMatches(result.matches);
      setDrawCompleted(true);
      setCurrentStep(1);
      messageApi.success('ההגרלה בוצעה בהצלחה!');
    } catch (error) {
      messageApi.error('שגיאה בביצוע ההגרלה');
      console.error('Error performing draw:', error);
    } finally {
      setDrawLoading(false);
    }
  };

  const resetDraw = () => {
    setGroups([]);
    setMatches([]);
    setDrawCompleted(false);
    setCurrentStep(0);
    form.resetFields();
  };

  // Helper functions for displaying group information
  const getTeamsInGroup = (groupId: string) => {
    return teams.filter(team => {
      return matches.some(match => 
        (match.homeTeamId === team.id || match.awayTeamId === team.id) && match.groupId === groupId
      );
    });
  };

  const getMatchesInGroup = (groupId: string) => {
    return matches
      .filter(match => match.groupId === groupId)
      .map(match => {
        const homeTeam = teams.find(team => team.id === match.homeTeamId);
        const awayTeam = teams.find(team => team.id === match.awayTeamId);
        return {
          ...match,
          homeTeamName: homeTeam?.name || 'לא ידוע',
          awayTeamName: awayTeam?.name || 'לא ידוע'
        };
      });
  };

  const steps = [
    {
      title: 'הגרלה',
      description: 'בחירת מספר הבתים',
      icon: <GroupOutlined />
    },
    {
      title: 'תוצאות',
      description: 'צפייה בתוצאות ההגרלה',
      icon: <CheckCircleOutlined />
    }
  ];

  return (
    <div>
      <Title level={2}>הגרלת שלב הבתים</Title>
      
      <Steps
        current={currentStep}
        items={steps.map(item => ({
          title: item.title,
          description: item.description,
          icon: item.icon
        }))}
        style={{ marginBottom: 24 }}
      />
      
      {currentStep === 0 && (
        <Card title="הגרלת בתים">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <p>טוען קבוצות...</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 16 }}>
                <Text>קבוצות זמינות להגרלה ({teams.length}):</Text>
                <List
                  size="small"
                  bordered
                  dataSource={teams}
                  renderItem={team => (
                    <List.Item>
                      <TeamOutlined style={{ marginLeft: 8 }} /> {team.name}
                    </List.Item>
                  )}
                  style={{ marginTop: 8 }}
                />
              </div>
              
              <Divider />
              
              <Form 
                form={form}
                onFinish={handleDraw}
                layout="vertical"
                initialValues={{ numberOfGroups: 2 }}
              >
                <Form.Item
                  name="numberOfGroups"
                  label="מספר בתים"
                  rules={[
                    { required: true, message: 'נא לבחור מספר בתים' },
                    { 
                      validator: (_, value) => {
                        if (value < 1) {
                          return Promise.reject('מספר הבתים חייב להיות לפחות 1');
                        }
                        if (value > teams.length) {
                          return Promise.reject(`מספר הבתים לא יכול להיות גדול ממספר הקבוצות (${teams.length})`);
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <InputNumber min={1} max={teams.length} style={{ width: '100%' }} />
                </Form.Item>
                
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={drawLoading}
                  disabled={teams.length < 2}
                  icon={<SyncOutlined />}
                  style={{ marginTop: 8 }}
                >
                  בצע הגרלה
                </Button>
              </Form>
            </>
          )}
        </Card>
      )}
      
      {currentStep === 1 && (
        <>
          <Result
            status="success"
            title="ההגרלה בוצעה בהצלחה!"
            subTitle={`חולקו ${teams.length} קבוצות ל-${groups.length} בתים`}
            extra={[
              <Button key="reset" onClick={resetDraw}>
                בצע הגרלה חדשה
              </Button>
            ]}
            style={{ marginBottom: 24 }}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
            {groups.map(group => (
              <Card 
                key={group.id} 
                title={group.name}
                extra={<Text type="secondary">{getTeamsInGroup(group.id).length} קבוצות</Text>}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text strong>קבוצות בבית:</Text>
                  <List
                    size="small"
                    dataSource={getTeamsInGroup(group.id)}
                    renderItem={team => (
                      <List.Item>
                        <TeamOutlined style={{ marginLeft: 8 }} /> {team.name}
                      </List.Item>
                    )}
                    style={{ marginTop: 8 }}
                  />
                </div>
                
                <Divider />
                
                <div>
                  <Text strong>לוח משחקים בבית:</Text>
                  <List
                    size="small"
                    dataSource={getMatchesInGroup(group.id)}
                    renderItem={match => (
                      <List.Item>
                        <Space>
                          {match.homeTeamName} נגד {match.awayTeamName}
                        </Space>
                      </List.Item>
                    )}
                    style={{ marginTop: 8 }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GroupDraw; 