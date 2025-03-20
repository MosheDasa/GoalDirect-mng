import React, { useState } from 'react';
import { Typography, Button, InputNumber, message, Card, List } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { teamsApi, groupsApi } from '@services/api';
import { Team, Group } from '../types';

const { Title, Text } = Typography;

const GroupDraw: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [numberOfGroups, setNumberOfGroups] = useState<number>(2);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamsApi.getAll();
        setTeams(data);
      } catch (error) {
        message.error('שגיאה בטעינת הקבוצות');
      }
    };
    fetchTeams();
  }, []);

  const handleDraw = async () => {
    if (numberOfGroups < 1) {
      message.error('מספר הקבוצות חייב להיות גדול מ-0');
      return;
    }

    if (numberOfGroups > teams.length) {
      message.error('מספר הקבוצות לא יכול להיות גדול ממספר הקבוצות');
      return;
    }

    setLoading(true);
    try {
      const result = await groupsApi.createDraw(numberOfGroups);
      setGroups(result.groups);
      // Refresh teams to get updated groupId values
      const updatedTeams = await teamsApi.getAll();
      setTeams(updatedTeams);
      message.success('הקבוצות חולקו בהצלחה');
    } catch (error) {
      message.error('שגיאה בחלוקת הקבוצות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2}>הגרלת בתים</Title>
      <div style={{ marginBottom: 24 }}>
        <Text>מספר בתים:</Text>
        <InputNumber
          min={1}
          max={teams.length}
          value={numberOfGroups}
          onChange={value => setNumberOfGroups(value || 1)}
          style={{ marginRight: 16 }}
        />
        <Button
          type="primary"
          icon={<TeamOutlined />}
          onClick={handleDraw}
          loading={loading}
        >
          בצע הגרלה
        </Button>
      </div>
      {groups.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {groups.map(group => (
            <Card key={group.id} title={group.name}>
              <List
                size="small"
                dataSource={teams.filter(team => team.groupId === group.id)}
                renderItem={team => (
                  <List.Item>
                    <TeamOutlined style={{ marginLeft: 8 }} /> {team.name}
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupDraw; 