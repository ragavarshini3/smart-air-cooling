import React from 'react';
import { Fan, Activity, AlertTriangle, Cpu } from 'lucide-react';
import { DashboardData } from '../../types';

interface HeaderProps {
  data: DashboardData | null;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ data, isOnline }) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            Smart Workspace Zone A
            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30">
              SOFTWARE SIMULATED
            </span>
          </h1>
          <p className="text-xs text-slate-400">Automated Climate & Cooling Management</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* System Online Status */}
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
          <span className="font-medium text-slate-300">
            {isOnline ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Operating Mode Indicator */}
        {data && (
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Mode:</span>
            <span className="font-semibold text-sky-300">{data.operating_mode}</span>
          </div>
        )}

        {/* Fan Quick Status Indicator */}
        {data && (
          <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs">
            <Fan className={`w-3.5 h-3.5 ${data.fan_status === 'ON' ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
            <span className="text-slate-400">Fan:</span>
            <span className={`font-semibold ${data.fan_status === 'ON' ? 'text-emerald-300' : 'text-slate-400'}`}>
              {data.fan_status} ({data.fan_speed}%)
            </span>
          </div>
        )}

        {/* Active Alert Flag */}
        {data?.current_alert && (
          <div className="flex items-center space-x-1.5 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-full text-xs text-rose-400 animate-bounce">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="font-semibold">HIGH TEMP ALERT</span>
          </div>
        )}
      </div>
    </header>
  );
};
