import React from 'react';
import { Card, Button, Space, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { exportApi } from '@services/api';

const Reports: React.FC = () => {
  const [messageApi] = message.useMessage();

  const handleExport = async (type: string) => {
    try {
      const blob = await exportApi[type as keyof typeof exportApi]();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      messageApi.success('הדוח יוצא בהצלחה');
    } catch (error) {
      messageApi.error('שגיאה בייצוא הדוח');
    }
  };

  return (
    <div>
      <h2>דוחות</h2>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="ייצוא דוחות">
          <Space wrap>
            <Button icon={<DownloadOutlined />} onClick={() => handleExport('teams')}>דוח קבוצות</Button>
            <Button icon={<DownloadOutlined />} onClick={() => handleExport('players')}>דוח שחקנים</Button>
            <Button icon={<DownloadOutlined />} onClick={() => handleExport('matches')}>דוח משחקים</Button>
            <Button icon={<DownloadOutlined />} onClick={() => handleExport('standings')}>דוח דירוג</Button>
            <Button icon={<DownloadOutlined />} onClick={() => handleExport('statistics')}>דוח סטטיסטיקות</Button>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default Reports; 