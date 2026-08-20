import React from 'react';
import { 
  Thermometer, 
  Droplets, 
  Fan, 
  Gauge, 
  Sliders, 
  Activity, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { StatusBadge } from '../components/dashboard/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { DashboardData } from '../types';
import { API_BASE_URL } from '../services/api';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, loading, error }) => {
  if (loading && !data) {
    return <LoadingSpinner message="Connecting to simulated sensor stream..." />;
  }

  if (error && !data) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-rose-300">
        <div className="flex items-center space-x-3 mb-2">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
          <h3 className="font-bold text-xl">Unable to connect to backend server</h3>
        </div>
        <p className="text-base text-slate-200">{error}</p>
        <p className="text-sm text-slate-400 mt-2 font-mono">
          Target API Endpoint: <span className="text-sky-300 bg-slate-900 px-2 py-1 rounded">{API_BASE_URL}</span>
        </p>
      </div>
    );
  }

  if (!data) return null;

  const getTempState = (temp: number) => {
    if (temp < 25) return { color: 'emerald', text: 'Comfortable (< 25°C)' };
    if (temp < 30) return { color: 'amber', text: 'Low Warmth (25–30°C)' };
    if (temp < 35) return { color: 'amber', text: 'Moderate Heat (30–35°C)' };
    return { color: 'rose', text: 'High Heat (> 35°C)' };
  };

  const tempState = getTempState(data.current_temperature);

  return (
    <div className="space-y-6">
      {/* Top Banner Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-850 border border-slate-800 rounded-2xl p-6 gap-4 shadow-lg">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Environment Overview</h2>
            <StatusBadge 
              status={data.operating_mode} 
              variant={data.operating_mode === 'AUTO' ? 'info' : 'warning'} 
            />
          </div>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Last Sensor Sync: <span className="font-mono text-slate-200 font-semibold">{new Date(data.last_updated).toLocaleTimeString()}</span>
          </p>
        </div>
        
        {/* Quick status summary badges */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center space-x-2.5">
            <Activity className="w-5 h-5 text-sky-400" />
            <span className="text-slate-400 font-medium">System:</span>
            <span className="text-emerald-400 font-bold font-mono text-base">{data.system_status}</span>
          </div>
          <div className="bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 flex items-center space-x-2.5">
            <Fan className={`w-5 h-5 ${data.fan_status === 'ON' ? 'text-emerald-400 animate-spin' : 'text-slate-500'}`} />
            <span className="text-slate-400 font-medium">Fan State:</span>
            <span className="text-slate-100 font-bold font-mono text-base">{data.fan_status}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Temperature"
          value={data.current_temperature}
          unit="°C"
          subtext={`Thermal State: ${tempState.text}`}
          icon={Thermometer}
          color={tempState.color as any}
        />
        <MetricCard
          title="Relative Humidity"
          value={data.current_humidity}
          unit="%"
          subtext="Simulated Ambient Moisture"
          icon={Droplets}
          color="sky"
        />
        <MetricCard
          title="Fan Speed"
          value={data.fan_speed}
          unit="%"
          subtext={`Status: ${data.fan_status}`}
          icon={Gauge}
          color={data.fan_status === 'ON' ? 'emerald' : 'slate'}
          pulse={data.fan_status === 'ON'}
        />
        <MetricCard
          title="Operating Mode"
          value={data.operating_mode}
          subtext={data.operating_mode === 'AUTO' ? 'Automated Thermal Thresholds' : 'User Manual Control'}
          icon={Sliders}
          color={data.operating_mode === 'AUTO' ? 'indigo' : 'amber'}
        />
      </div>

      {/* Active Alert Notification Card if any */}
      {data.current_alert && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-bold text-rose-200 text-base">{data.current_alert.alert_type}</span>
                <span className="text-xs bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-md font-mono border border-rose-500/40 font-bold">
                  {data.current_alert.severity}
                </span>
              </div>
              <p className="text-sm text-slate-200 mt-1 font-medium">{data.current_alert.message}</p>
            </div>
          </div>
          <span className="text-sm text-slate-400 font-mono font-semibold hidden sm:inline">
            {new Date(data.current_alert.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Temperature Trend */}
        <div className="bg-slate-850 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Temperature Stream (°C)</h3>
              <p className="text-xs text-slate-400">Real-time simulated environmental temperature</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-mono font-bold text-sky-400 border border-slate-700">
              {data.current_temperature}°C
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.temperature_trend}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="#64748b" 
                  fontSize={11} 
                />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} unit="°C" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '13px' }}
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                  formatter={(val: number) => [`${val}°C`, 'Temperature']}
                />
                <Area type="monotone" dataKey="temperature" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Humidity Trend */}
        <div className="bg-slate-850 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Humidity Stream (%)</h3>
              <p className="text-xs text-slate-400">Real-time simulated ambient moisture level</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-mono font-bold text-emerald-400 border border-slate-700">
              {data.current_humidity}%
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.humidity_trend}>
                <defs>
                  <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  stroke="#64748b" 
                  fontSize={11} 
                />
                <YAxis domain={['auto', 'auto']} stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '13px' }}
                  labelFormatter={(ts) => new Date(ts).toLocaleString()}
                  formatter={(val: number) => [`${val}%`, 'Humidity']}
                />
                <Area type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#humGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
