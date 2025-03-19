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
  Transfer,
  Spin
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';
import { teamsApi, playersApi } from '@services/api';
import { Team, Player } from '../types';

const { Title } = Typography;

interface TeamWithPlayers extends Team {
  playerCount: number;
  name: string;
}

const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamModalVisible, setTeamModalVisible] = useState(false);
  const [playerAssignModalVisible, setPlayerAssignModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedPlayerKeys, setSelectedPlayerKeys] = useState<string[]>([]);
  const [teamForm] = Form.useForm();
  const [messageApi] = message.useMessage();

  // Fetch teams and player counts
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const teamsData = await teamsApi.getAll();
      const playersData = await playersApi.getAll();
      setPlayers(playersData);
      
      // Calculate player count for each team
      const teamsWithPlayerCount = teamsData.map(team => {
        const playerCount = playersData.filter(player => player.teamId === team.id).length;
        return { ...team, playerCount };
      });
      
      setTeams(teamsWithPlayerCount);
    } catch (error) {
      messageApi.error('שגיאה בטעינת נתוני הקבוצות');
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Team form handlers
  const showAddTeamModal = () => {
    setEditingTeam(null);
    teamForm.resetFields();
    setTeamModalVisible(true);
  };

  const showEditTeamModal = (team: Team) => {
    setEditingTeam(team);
    teamForm.setFieldsValue({
      name: team.name
    });
    setTeamModalVisible(true);
  };

  const handleTeamFormSubmit = async () => {
    try {
      const values = await teamForm.validateFields();
      setConfirmLoading(true);
      
      if (editingTeam) {
        // Update existing team
        await teamsApi.update(editingTeam.id, values);
        messageApi.success('הקבוצה עודכנה בהצלחה');
      } else {
        // Create new team
        await teamsApi.create(values);
        messageApi.success('הקבוצה נוצרה בהצלחה');
      }
      
      setTeamModalVisible(false);
      fetchTeams();
    } catch (error) {
      console.error('Error submitting team form:', error);
      messageApi.error('שגיאה בשמירת הקבוצה');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await teamsApi.delete(teamId);
      messageApi.success('הקבוצה נמחקה בהצלחה');
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      messageApi.error('שגיאה במחיקת הקבוצה');
    }
  };

  // Player assignment handlers
  const showPlayerAssignModal = (team: Team) => {
    setSelectedTeam(team);
    // Set initially selected keys (players already in the team)
    const teamPlayerIds = players
      .filter(player => player.teamId === team.id)
      .map(player => player.id);
    setSelectedPlayerKeys(teamPlayerIds);
    setPlayerAssignModalVisible(true);
  };

  const handlePlayerTransferChange = (newTargetKeys: React.Key[], direction: 'left' | 'right', moveKeys: React.Key[]) => {
    setSelectedPlayerKeys(newTargetKeys as string[]);
  };

  const handleSavePlayerAssignments = async () => {
    if (!selectedTeam) return;
    
    try {
      setConfirmLoading(true);
      
      // Get all players that need to be updated
      const assignedPlayers = players.filter(player => 
        selectedPlayerKeys.includes(player.id) && player.teamId !== selectedTeam.id
      );
      
      const unassignedPlayers = players.filter(player => 
        !selectedPlayerKeys.includes(player.id) && player.teamId === selectedTeam.id
      );
      
      // Assign players to the team
      for (const player of assignedPlayers) {
        await playersApi.update(player.id, { teamId: selectedTeam.id });
      }
      
      // Unassign players from the team
      for (const player of unassignedPlayers) {
        await playersApi.update(player.id, { teamId: null });
      }
      
      messageApi.success('השחקנים שויכו בהצלחה');
      setPlayerAssignModalVisible(false);
      fetchTeams();
    } catch (error) {
      console.error('Error assigning players:', error);
      messageApi.error('שגיאה בשיוך השחקנים');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'שם הקבוצה',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: TeamWithPlayers, b: TeamWithPlayers) => a.name.localeCompare(b.name),
    },
    {
      title: 'מספר שחקנים',
      dataIndex: 'playerCount',
      key: 'playerCount',
      sorter: (a: TeamWithPlayers, b: TeamWithPlayers) => a.playerCount - b.playerCount,
    },
    {
      title: 'תאריך יצירה',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('he-IL'),
    },
    {
      title: 'פעולות',
      key: 'actions',
      render: (_: any, record: Team) => (
        <Space size="middle">
          <Button 
            icon={<TeamOutlined />} 
            onClick={() => showPlayerAssignModal(record)}
            title="שיוך שחקנים"
          />
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showEditTeamModal(record)}
            title="עריכה"
          />
          <Popconfirm
            title="האם אתה בטוח שברצונך למחוק את הקבוצה?"
            onConfirm={() => handleDeleteTeam(record.id)}
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
      <Title level={2}>ניהול קבוצות</Title>
      
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={showAddTeamModal}
        style={{ marginBottom: 16 }}
      >
        הוספת קבוצה חדשה
      </Button>
      
      <Table 
        columns={columns} 
        dataSource={teams} 
        rowKey="id" 
        loading={loading}
        locale={{ emptyText: 'אין קבוצות. צור קבוצות חדשות.' }}
      />
      
      {/* Add/Edit Team Modal */}
      <Modal
        title={editingTeam ? 'עריכת קבוצה' : 'הוספת קבוצה חדשה'}
        open={teamModalVisible}
        onOk={handleTeamFormSubmit}
        confirmLoading={confirmLoading}
        onCancel={() => setTeamModalVisible(false)}
        okText={editingTeam ? 'שמור שינויים' : 'צור קבוצה'}
        cancelText="ביטול"
      >
        <Form form={teamForm} layout="vertical">
          <Form.Item
            name="name"
            label="שם הקבוצה"
            rules={[{ required: true, message: 'נא להזין שם קבוצה' }]}
          >
            <Input placeholder="הזן שם קבוצה" />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Player Assignment Modal */}
      <Modal
        title={`שיוך שחקנים לקבוצת ${selectedTeam?.name}`}
        open={playerAssignModalVisible}
        onOk={handleSavePlayerAssignments}
        confirmLoading={confirmLoading}
        onCancel={() => setPlayerAssignModalVisible(false)}
        okText="שמור שיוך"
        cancelText="ביטול"
        width={800}
      >
        {selectedTeam ? (
          <Transfer
            dataSource={players.map(player => ({
              key: player.id,
              title: `${player.firstName} ${player.lastName}`,
              description: '',
            }))}
            titles={['שחקנים זמינים', `שחקני ${selectedTeam.name}`]}
            targetKeys={selectedPlayerKeys}
            onChange={handlePlayerTransferChange}
            render={item => item.title}
            listStyle={{ width: 300, height: 400 }}
          />
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
};

export default TeamManagement; 