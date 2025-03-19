import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Typography, Modal, Form, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { matchesApi, teamsApi, groupsApi } from '@services/api';
import { Match, Team, Group } from '../types';

const { Title } = Typography;
const { Option } = Select;

const MatchManagement: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [form] = Form.useForm();
  const [messageApi] = message.useMessage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData, groupsData] = await Promise.all([
        matchesApi.getAll(),
        teamsApi.getAll(),
        groupsApi.getAll()
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
      setGroups(groupsData);
    } catch (error) {
      messageApi.error('שגיאה בטעינת נתונים');
    } finally {
      setLoading(false);
    }
  };

  const showModal = (match?: Match) => {
    setEditingMatch(match || null);
    if (match) {
      form.setFieldsValue({
        ...match,
        date: match.date ? new Date(match.date) : undefined
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingMatch) {
        await matchesApi.update(editingMatch.id, values);
        messageApi.success('המשחק עודכן בהצלחה');
      } else {
        await matchesApi.create(values);
        messageApi.success('המשחק נוצר בהצלחה');
      }
      setModalVisible(false);
      fetchData();
    } catch (error) {
      messageApi.error('שגיאה בשמירת המשחק');
    }
  };

  const columns = [
    {
      title: 'תאריך',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('he-IL'),
    },
    {
      title: 'קבוצת בית',
      dataIndex: 'homeTeamId',
      key: 'homeTeamId',
      render: (id: string) => teams.find(t => t.id === id)?.name,
    },
    {
      title: 'קבוצת חוץ',
      dataIndex: 'awayTeamId',
      key: 'awayTeamId',
      render: (id: string) => teams.find(t => t.id === id)?.name,
    },
    {
      title: 'קבוצה',
      dataIndex: 'groupId',
      key: 'groupId',
      render: (id: string) => groups.find(g => g.id === id)?.name,
    },
    {
      title: 'פעולות',
      key: 'actions',
      render: (_: any, record: Match) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>ניהול משחקים</Title>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        הוספת משחק
      </Button>
      <Table
        columns={columns}
        dataSource={matches}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingMatch ? 'עריכת משחק' : 'הוספת משחק'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="date"
            label="תאריך"
            rules={[{ required: true, message: 'נא לבחור תאריך' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="homeTeamId"
            label="קבוצת בית"
            rules={[{ required: true, message: 'נא לבחור קבוצת בית' }]}
          >
            <Select>
              {teams.map(team => (
                <Option key={team.id} value={team.id}>{team.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="awayTeamId"
            label="קבוצת חוץ"
            rules={[{ required: true, message: 'נא לבחור קבוצת חוץ' }]}
          >
            <Select>
              {teams.map(team => (
                <Option key={team.id} value={team.id}>{team.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="groupId"
            label="קבוצה"
            rules={[{ required: true, message: 'נא לבחור קבוצה' }]}
          >
            <Select>
              {groups.map(group => (
                <Option key={group.id} value={group.id}>{group.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MatchManagement; 