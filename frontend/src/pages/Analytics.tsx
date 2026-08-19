import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Thermometer, 
  Droplets, 
  Fan, 
  Clock, 
  TrendingUp, 
  Zap, 
  Activity,
  Calendar
} from 'lucide-react';
import { getAnalyticsSummary } from '../services/api';
import { AnalyticsSummary } from '../types';
import { MetricCard } from '../components/dashboard/MetricCard';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export const Analytics: React.FC = () => {
  const [filter, setFilter] = useState<string>('today');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAnalytics = async () => {
    try {
      const res = await getAnalyticsSummary(filter);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch analytics summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  if (loading && !data) {
    return <LoadingSpinner message="Calculating performance analytics..." />;
  }

  if (!data) return null;

  const timeFilterLabels: Record<string, string> = {
    '1h': 'Last 1 Hour',
    '6h': 'Last 6 Hours',
    'today': 'Today (24h)',
    '7d': 'Last 7 Days',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-850 border border-slate-800 rounded-xl p-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">Performance Analytics & Insights</h2>
            <p className="text-xs text-slate-400">Historical environmental trends, thermal stats, and fan activity</p>
          </div>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
          {['1h', '6h', 'today', '7d'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {timeFilterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* 1. Temperature Analytics Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-sky-400" />
          Temperature Performance ({timeFilterLabels[filter]})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Current Temperature"
            value={data.current_temp}
            unit="°C"
            subtext="Latest Sensor Snapshot"
            icon={Thermometer}
            color="sky"
          />
          <MetricCard
            title="Average Temperature"
            value={data.avg_temp}
            unit="°C"
            subtext="Period Mean Thermal Value"
            icon={Activity}
            color="indigo"
          />
          <MetricCard
            title="Minimum Temperature"
            value={data.min_temp}
            unit="°C"
            subtext="Lowest Thermal Dip"
            icon={TrendingUp}
            color="emerald"
          />
          <MetricCard
            title="Maximum Temperature"
            value={data.max_temp}
            unit="°C"
            subtext="Peak Thermal Spike"
            icon={Thermometer}
            color={data.max_temp >= 35 ? 'rose' : 'amber'}
          />
        </div>
      </div>

      {/* 2. Humidity & Fan Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Humidity Summary */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Droplets className="w-4 h-4 text-emerald-400" />
            Humidity Summary
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">AVERAGE</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{data.avg_humidity}%</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">MINIMUM</span>
              <span className="text-lg font-bold text-slate-200 font-mono">{data.min_humidity}%</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">MAXIMUM</span>
              <span className="text-lg font-bold text-slate-200 font-mono">{data.max_humidity}%</span>
            </div>
          </div>
        </div>

        {/* Fan Operational Summary */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Fan className="w-4 h-4 text-amber-400" />
            Fan Operational Summary
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">TOTAL RUNTIME</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{data.total_operating_time_mins} <span className="text-xs">m</span></span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">AVG FAN SPEED</span>
              <span className="text-lg font-bold text-sky-400 font-mono">{data.avg_fan_speed}%</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">AUTO ACTIVATIONS</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">{data.auto_activations_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Combined Environmental Chart */}
      <div className="bg-slate-850 border border-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">Historical Temperature & Humidity Timeline</h3>
            <p className="text-xs text-slate-400">Comparison of thermal levels (°C) against moisture levels (%) over selected window</p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
            <Calendar className="w-4 h-4 text-sky-400" />
            <span>Filter: {timeFilterLabels[filter]}</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                stroke="#64748b" 
                fontSize={10} 
              />
              <YAxis yAxisId="left" domain={['auto', 'auto']} stroke="#0284c7" fontSize={10} unit="°C" />
              <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} stroke="#10b981" fontSize={10} unit="%" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                labelFormatter={(ts) => new Date(ts).toLocaleString()}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#0284c7" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
