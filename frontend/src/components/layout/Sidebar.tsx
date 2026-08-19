import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Fan, 
  BellRing, 
  Bot, 
  Settings,
  Wind
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Fan Control', path: '/control', icon: Fan },
  { name: 'Alerts', path: '/alerts', icon: BellRing },
  { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center space-x-3 border-b border-slate-800/80">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-slate-100 text-base tracking-wide block">AERO-COOL</span>
            <span className="text-xs text-slate-400 font-mono block tracking-wider font-semibold">SMART PLATFORM</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-semibold">Simulation</span>
            <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            100% Software Simulated IoT Environment (No hardware required).
          </p>
        </div>
      </div>
    </aside>
  );
};
