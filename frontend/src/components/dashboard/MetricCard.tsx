import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  color?: 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
  pulse?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  subtext,
  icon: Icon,
  color = 'sky',
  pulse = false,
}) => {
  const colorStyles = {
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div className="bg-slate-850 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden transition-all duration-200 hover:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">{title}</span>
        <div className={`p-3 rounded-xl border ${colorStyles[color]} ${pulse ? 'animate-pulse' : ''}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="text-4xl sm:text-5xl font-extrabold text-slate-100 tracking-tight font-mono">{value}</span>
        {unit && <span className="text-lg font-bold text-slate-300 font-sans">{unit}</span>}
      </div>
      {subtext && <p className="text-xs sm:text-sm font-medium text-slate-400 mt-3">{subtext}</p>}
    </div>
  );
};
