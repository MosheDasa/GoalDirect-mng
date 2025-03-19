import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Typography, 
  Modal, 
  Form, 
  Input, 
  Popconfirm, 
  message, 
  Select, 
  Tag,
  Badge
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';
import { playersApi, teamsApi, standingsApi } from '@services/api';
import { Player, Team, TopScorer } from '@types';

const { Title } = Typography;
const { Option } = Select;

interface PlayerWithTeam extends Player {
  teamName: string;
  goals?: number;
}

const PlayerManagement: React.FC = () => {
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerModalVisible, setPlayerModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerForm] = Form.useForm();
  const [messageApi] = message.useMessage();

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [playersData, teamsData, topScorersData] = await Promise.all([
        playersApi.getAll(),
        teamsApi.getAll(),
        standingsApi.getTopScorers()
      ]);
      
      // Map team names to players
      const playersWithTeamNames = playersData.map(player => {
        const team = teamsData.find(team => team.id === player.teamId);
        const playerScorer = topScorersData.find(scorer => scorer.playerId === player.id);
        
        return {
          ...player,
          teamName: team ? team.name : 'לא משויך',
          goals: playerScorer ? playerScorer.goals : 0
        };
      });
      
      setPlayers(playersWithTeamNames);
      setTeams(teamsData);
      setTopScorers(topScorersData);
    } catch (error) {
      messageApi.error('שגיאה בטעינת נתוני השחקנים');
      console.error('Error fetching players data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Player form handlers
  const showAddPlayerModal = () => {
    setEditingPlayer(null);
    playerForm.resetFields();
    setPlayerModalVisible(true);
  };

  const showEditPlayerModal = (player: Player) => {
    setEditingPlayer(player);
    playerForm.setFieldsValue({
      firstName: player.firstName,
      lastName: player.lastName,
      teamId: player.teamId
    });
    setPlayerModalVisible(true);
  };

  const handlePlayerFormSubmit = async () => {
    try {
      const values = await playerForm.validateFields();
      setConfirmLoading(true);
      
      if (editingPlayer) {
        // Update existing player
        await playersApi.update(editingPlayer.id, values);
        messageApi.success('השחקן עודכן בהצלחה');
      } else {
        // Create new player
        await playersApi.create(values);
        messageApi.success('השחקן נוצר בהצלחה');
      }
      
      setPlayerModalVisible(false);
      fetchData();
    } catch (error) {
      console.error('Error submitting player form:', error);
      messageApi.error('שגיאה בשמירת השחקן');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    try {
      await playersApi.delete(playerId);
      messageApi.success('השחקן נמחק בהצלחה');
      fetchData();
    } catch (error) {
      console.error('Error deleting player:', error);
      messageApi.error('שגיאה במחיקת השחקן');
    }
  };

  // Stats modal handlers
  const showStatsModal = (player: Player) => {
    setSelectedPlayer(player);
    setStatsModalVisible(true);
  };

  // Table columns
  const columns = [
    {
      title: 'שם פרטי',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a: PlayerWithTeam, b: PlayerWithTeam) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'שם משפחה',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a: PlayerWithTeam, b: PlayerWithTeam) => a.lastName.localeCompare(b.lastName),
    },
    {
      title: 'קבוצה',
      dataIndex: 'teamName',
      key: 'teamName',
      render: (teamName: string) => (
        teamName === 'לא משויך' 
          ? <Tag color="default">לא משויך</Tag> 
          : <Tag color="blue">{teamName}</Tag>
      ),
      sorter: (a: PlayerWithTeam, b: PlayerWithTeam) => a.teamName.localeCompare(b.teamName),
    },
    {
      title: 'שערים',
      dataIndex: 'goals',
      key: 'goals',
      render: (goals: number) => (
        goals > 0 ? <Badge count={goals} style={{ backgroundColor: '#52c41a' }} /> : 0
      ),
      sorter: (a: PlayerWithTeam, b: PlayerWithTeam) => (a.goals || 0) - (b.goals || 0),
    },
    {
      title: 'פעולות',
      key: 'actions',
      render: (_: any, record: Player) => (
        <Space size="middle">
          <Button 
            icon={<TrophyOutlined />} 
            onClick={() => showStatsModal(record)}
            title="סטטיסטיקות"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditPlayerModal(record)}
            title="עריכה"
          />
          <Popconfirm
            title="האם אתה בטוח שברצונך למחוק את השחקן?"
            onConfirm={() => handleDeletePlayer(record.id)}
            okText="כן"
            cancelText="לא"
          >
            <Button 
              icon={<DeleteOutlined />} 
              danger
              title="מחיקה"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>ניהול שחקנים</Title>
      
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={showAddPlayerModal}
        style={{ marginBottom: 16 }}
      >
        הוספת שחקן חדש
      </Button>
      
      <Table 
        columns={columns} 
        dataSource={players} 
        rowKey="id" 
        loading={loading}
        locale={{ emptyText: 'אין שחקנים. צור שחקנים חדשים.' }}
      />
      
      {/* Add/Edit Player Modal */}
      <Modal
        title={editingPlayer ? 'עריכת שחקן' : 'הוספת שחקן חדש'}
        open={playerModalVisible}
        onOk={handlePlayerFormSubmit}
        confirmLoading={confirmLoading}
        onCancel={() => setPlayerModalVisible(false)}
        okText={editingPlayer ? 'שמור שינויים' : 'צור שחקן'}
        cancelText="ביטול"
      >
        <Form form={playerForm} layout="vertical">
          <Form.Item
            name="firstName"
            label="שם פרטי"
            rules={[{ required: true, message: 'נא להזין שם פרטי' }]}
          >
            <Input placeholder="הזן שם פרטי" />
          </Form.Item>
          <Form.Item
            name="lastName"
            label="שם משפחה"
            rules={[{ required: true, message: 'נא להזין שם משפחה' }]}
          >
            <Input placeholder="הזן שם משפחה" />
          </Form.Item>
          <Form.Item
            name="teamId"
            label="קבוצה"
          >
            <Select placeholder="בחר קבוצה" allowClear>
              {teams.map(team => (
                <Option key={team.id} value={team.id}>{team.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Player Stats Modal */}
      <Modal
        title={`סטטיסטיקות - ${selectedPlayer?.firstName} ${selectedPlayer?.lastName}`}
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setStatsModalVisible(false)}>
            סגור
          </Button>
        ]}
      >
        {selectedPlayer && (
          <div>
            <p><strong>שערים שהובקעו:</strong> {
              topScorers.find(scorer => scorer.playerId === selectedPlayer.id)?.goals || 0
            }</p>
            <p><strong>קבוצה:</strong> {
              teams.find(team => team.id === selectedPlayer.teamId)?.name || 'לא משויך'
            }</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PlayerManagement; 