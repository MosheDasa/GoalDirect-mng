import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  TrophyOutlined,
  NotificationOutlined,
  BarChartOutlined,
  GroupOutlined
} from '@ant-design/icons';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <Menu
      mode="horizontal"
      selectedKeys={[location.pathname]}
      style={{ marginBottom: 24 }}
    >
      <Menu.Item key="/" icon={<DashboardOutlined />}>
        <Link to="/">לוח בקרה</Link>
      </Menu.Item>
      <Menu.Item key="/group-draw" icon={<GroupOutlined />}>
        <Link to="/group-draw">הגרלת בתים</Link>
      </Menu.Item>
      <Menu.Item key="/result-entry" icon={<TrophyOutlined />}>
        <Link to="/result-entry">הזנת תוצאות</Link>
      </Menu.Item>
      <Menu.Item key="/announcements" icon={<NotificationOutlined />}>
        <Link to="/announcements">הודעות</Link>
      </Menu.Item>
      <Menu.Item key="/reports" icon={<BarChartOutlined />}>
        <Link to="/reports">דוחות</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Navigation; 