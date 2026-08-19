import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardData } from '../../types';

interface AppLayoutProps {
  data: DashboardData | null;
  isOnline: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ data, isOnline }) => {
  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header data={data} isOnline={isOnline} />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
