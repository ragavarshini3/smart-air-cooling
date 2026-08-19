import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { FanControl } from './pages/FanControl';
import { Alerts } from './pages/Alerts';
import { AiAssistant } from './pages/AiAssistant';
import { Settings } from './pages/Settings';
import { getDashboardData } from './services/api';
import { DashboardData } from './types';

export const App: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const fetchDashboard = async () => {
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
      setIsOnline(true);
      setError(null);
    } catch (err: any) {
      setIsOnline(false);
      setError(err.message || 'Failed to connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Poll dashboard API every 3 seconds
    const interval = setInterval(fetchDashboard, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout data={data} isOnline={isOnline} />}>
          <Route index element={<Dashboard data={data} loading={loading} error={error} />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="control" element={<FanControl />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="ai-assistant" element={<AiAssistant />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
