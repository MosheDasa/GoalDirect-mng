import React, { useState } from 'react';
import { Layout, Menu, theme } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  TeamOutlined, 
  UserOutlined, 
  TrophyOutlined, 
  TableOutlined, 
  NotificationOutlined, 
  FileExcelOutlined,
  CalendarOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">לוח בקרה</Link>
    },
    {
      key: '/teams',
      icon: <TeamOutlined />,
      label: <Link to="/teams">ניהול קבוצות</Link>
    },
    {
      key: '/players',
      icon: <UserOutlined />,
      label: <Link to="/players">ניהול שחקנים</Link>
    },
    {
      key: '/matches',
      icon: <CalendarOutlined />,
      label: <Link to="/matches">ניהול משחקים</Link>
    },
    {
      key: '/results',
      icon: <TrophyOutlined />,
      label: <Link to="/results">הזנת תוצאות</Link>
    },
    {
      key: '/standings',
      icon: <TableOutlined />,
      label: <Link to="/standings">טבלת דירוג</Link>
    },
    {
      key: '/announcements',
      icon: <NotificationOutlined />,
      label: <Link to="/announcements">הודעות ועדכונים</Link>
    },
    {
      key: '/reports',
      icon: <FileExcelOutlined />,
      label: <Link to="/reports">ייצוא דוחות</Link>
    }
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={(value) => setCollapsed(value)}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: colorBgContainer,
      }}
    >
      <div style={{ 
        height: 32, 
        margin: 16, 
        background: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ 
          color: '#fff', 
          margin: 0,
          fontSize: collapsed ? '14px' : '18px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          GoalDirect
        </h1>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Sider>
  );
};

export default Sidebar; 