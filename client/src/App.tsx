import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import TeamManagement from './pages/TeamManagement';
import PlayerManagement from './pages/PlayerManagement';
import MatchManagement from './pages/MatchManagement';
import ResultEntry from './pages/ResultEntry';
import Standings from './pages/Standings';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import GroupDraw from './pages/GroupDraw';

const { Content } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Navigation />
      <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teams" element={<TeamManagement />} />
          <Route path="/players" element={<PlayerManagement />} />
          <Route path="/matches" element={<MatchManagement />} />
          <Route path="/results" element={<ResultEntry />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/group-draw" element={<GroupDraw />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App; 