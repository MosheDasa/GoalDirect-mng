import React, { useEffect, useState } from 'react';
import { 
  List, 
  Card, 
  Typography, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Space, 
  Popconfirm, 
  message 
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  NotificationOutlined 
} from '@ant-design/icons';
import { announcementsApi } from '@services/api';
import { Announcement } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form] = Form.useForm();
  const [messageApi] = message.useMessage();

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementsApi.getAll();
      // Sort by created date (newest first)
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAnnouncements(sortedData);
    } catch (error) {
      messageApi.error('שגיאה בטעינת ההודעות');
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [messageApi]);

  // Show add/edit form
  const showAddForm = () => {
    setEditingAnnouncement(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditForm = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    form.setFieldsValue({
      title: announcement.title,
      content: announcement.content
    });
    setModalVisible(true);
  };

  // Save announcement
  const handleSaveAnnouncement = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);
      
      if (editingAnnouncement) {
        // Update existing announcement
        await announcementsApi.update(editingAnnouncement.id, values);
        messageApi.success('ההודעה עודכנה בהצלחה');
      } else {
        // Create new announcement
        await announcementsApi.create(values);
        messageApi.success('ההודעה נוצרה בהצלחה');
      }
      
      setModalVisible(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      messageApi.error('שגיאה בשמירת ההודעה');
    } finally {
      setConfirmLoading(false);
    }
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await announcementsApi.delete(id);
      messageApi.success('ההודעה נמחקה בהצלחה');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      messageApi.error('שגיאה במחיקת ההודעה');
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <Title level={2}>הודעות ועדכונים</Title>
      
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={showAddForm}
        style={{ marginBottom: 16 }}
      >
        הוספת הודעה חדשה
      </Button>
      
      <List
        loading={loading}
        dataSource={announcements}
        renderItem={item => (
          <List.Item>
            <Card 
              title={item.title}
              extra={
                <Space>
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={() => showEditForm(item)}
                    title="עריכה"
                  />
                  <Popconfirm
                    title="האם אתה בטוח שברצונך למחוק הודעה זו?"
                    onConfirm={() => handleDeleteAnnouncement(item.id)}
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
              }
              style={{ width: '100%' }}
            >
              <Paragraph 
                style={{ 
                  whiteSpace: 'pre-line', 
                  marginBottom: 16 
                }}
              >
                {item.content}
              </Paragraph>
              <Text type="secondary">
                <NotificationOutlined style={{ marginLeft: 8 }} />
                פורסם: {formatDate(item.createdAt)}
                {item.updatedAt !== item.createdAt && 
                  ` | עודכן: ${formatDate(item.updatedAt)}`}
              </Text>
            </Card>
          </List.Item>
        )}
        locale={{ emptyText: 'אין הודעות. צור הודעה חדשה.' }}
      />
      
      {/* Add/Edit Announcement Modal */}
      <Modal
        title={editingAnnouncement ? 'עריכת הודעה' : 'הוספת הודעה חדשה'}
        open={modalVisible}
        onOk={handleSaveAnnouncement}
        confirmLoading={confirmLoading}
        onCancel={() => setModalVisible(false)}
        okText={editingAnnouncement ? 'שמור שינויים' : 'פרסם הודעה'}
        cancelText="ביטול"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="כותרת"
            rules={[{ required: true, message: 'נא להזין כותרת להודעה' }]}
          >
            <Input placeholder="הזן כותרת להודעה" />
          </Form.Item>
          <Form.Item
            name="content"
            label="תוכן"
            rules={[{ required: true, message: 'נא להזין תוכן להודעה' }]}
          >
            <TextArea 
              placeholder="הזן את תוכן ההודעה" 
              rows={6} 
              showCount 
              maxLength={1000} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Announcements; 