import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Thermometer, 
  Filter,
  CheckCheck
} from 'lucide-react';
import { getAlerts, resolveAlert } from '../services/api';
import { Alert } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts(filter === 'unresolved' ? false : undefined);
      setAlerts(data);
    } catch (err) {
      console.error('Failed to fetch alerts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleResolve = async (id: number) => {
    setResolvingId(id);
    try {
      await resolveAlert(id);
      await fetchAlerts();
    } catch (err) {
      alert('Failed to resolve alert');
    } finally {
      setResolvingId(null);
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  if (loading && alerts.length === 0) {
    return <LoadingSpinner message="Loading alert notifications..." />;
  }

  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-850 border border-slate-800 rounded-xl p-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              System Thermal Alerts
              {unresolvedCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-mono border border-rose-500/30">
                  {unresolvedCount} ACTIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">Automated thermal safety monitor & deduplicated alert logs</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              filter === 'unresolved'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unresolved Only</span>
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              filter === 'all'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Log History</span>
          </button>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-3">
          <CheckCheck className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-slate-200 font-semibold text-base">All Systems Normal</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filter === 'unresolved' 
              ? 'No active unresolved thermal alerts detected. System temperature is within configured safety thresholds.'
              : 'No alert history records found in database.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-slate-850 border rounded-xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.resolved 
                  ? 'border-slate-800 opacity-75' 
                  : 'border-rose-500/30 bg-rose-500/5 shadow-md shadow-rose-500/5'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-xl shrink-0 mt-0.5 ${
                  alert.resolved ? 'bg-slate-800 text-slate-500' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-100 text-sm">{alert.alert_type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold border ${getSeverityStyle(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    {alert.resolved && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> RESOLVED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">{alert.message}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                      Recorded: <span className="text-slate-200">{alert.temperature}°C</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {!alert.resolved && (
                <button
                  onClick={() => handleResolve(alert.id)}
                  disabled={resolvingId === alert.id}
                  className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all self-end md:self-center shrink-0 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{resolvingId === alert.id ? 'Resolving...' : 'Mark as Resolved'}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
