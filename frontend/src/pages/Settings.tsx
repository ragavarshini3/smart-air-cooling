import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Thermometer, 
  PlayCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Cpu
} from 'lucide-react';
import { getSettings, updateSettings, setSimulationMode } from '../services/api';
import { SystemSettings } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [systemName, setSystemName] = useState<string>('');
  const [lowThresh, setLowThresh] = useState<number>(25.0);
  const [medThresh, setMedThresh] = useState<number>(30.0);
  const [highThresh, setHighThresh] = useState<number>(35.0);
  const [simInterval, setSimInterval] = useState<number>(2);
  const [simMode, setSimMode] = useState<string>('Normal');

  const fetchCurrentSettings = async () => {
    try {
      const data = await getSettings();
      setSettings(data);
      setSystemName(data.system_name);
      setLowThresh(data.low_threshold);
      setMedThresh(data.medium_threshold);
      setHighThresh(data.high_threshold);
      setSimInterval(data.simulation_interval);
      setSimMode(data.simulation_mode);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (lowThresh >= medThresh) {
      setToast({ type: 'error', text: 'Low threshold must be lower than Medium threshold.' });
      return;
    }
    if (medThresh >= highThresh) {
      setToast({ type: 'error', text: 'Medium threshold must be lower than High threshold.' });
      return;
    }

    setSaving(true);
    try {
      const updated = await updateSettings({
        system_name: systemName,
        low_threshold: lowThresh,
        medium_threshold: medThresh,
        high_threshold: highThresh,
        simulation_interval: simInterval,
        simulation_mode: simMode as any,
      });
      setSettings(updated);
      setToast({ type: 'success', text: 'System thresholds & settings updated successfully!' });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setToast({ type: 'error', text: err.message || 'Failed to save settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleModeSelect = async (mode: string) => {
    setSimMode(mode);
    try {
      await setSimulationMode(mode);
      setToast({ type: 'success', text: `Simulation environmental pattern switched to ${mode}` });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to set simulation mode', err);
    }
  };

  if (loading && !settings) {
    return <LoadingSpinner message="Loading system configurations..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-850 border border-slate-800 rounded-xl p-6 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">System Configurations & Simulation Parameters</h2>
            <p className="text-xs text-slate-400">Configure thermal automation thresholds and backend simulation engine modes</p>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {toast && (
        <div className={`p-4 rounded-xl border flex items-center space-x-2 text-xs font-medium ${
          toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General Platform Settings */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            General System Settings
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              System / Workspace Zone Name
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
              placeholder="Smart Workspace Zone A"
              required
            />
          </div>
        </div>

        {/* Section 2: Automated Thermal Thresholds */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-400" />
              Automated Temperature Threshold Rules
            </h3>
            <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
              AUTO MODE RULES
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Define temperature boundary levels that govern automatic fan speed adjustments in AUTO mode.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {/* Low Threshold */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase block">LOW THRESHOLD (OFF)</span>
              <p className="text-[11px] text-slate-500">Below this temp, fan remains OFF (0% speed).</p>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="number"
                  step="0.5"
                  value={lowThresh}
                  onChange={(e) => setLowThresh(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-400 font-mono">°C</span>
              </div>
            </div>

            {/* Medium Threshold */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase block">MEDIUM THRESHOLD (LOW)</span>
              <p className="text-[11px] text-slate-500">Between Low & Med temp, fan runs LOW (30%).</p>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="number"
                  step="0.5"
                  value={medThresh}
                  onChange={(e) => setMedThresh(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="text-xs text-slate-400 font-mono">°C</span>
              </div>
            </div>

            {/* High Threshold */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase block">HIGH THRESHOLD (HIGH)</span>
              <p className="text-[11px] text-slate-500">Above Med temp &rarr; MED (60%), Above High &rarr; HIGH (100%).</p>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="number"
                  step="0.5"
                  value={highThresh}
                  onChange={(e) => setHighThresh(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-100 font-bold focus:outline-none focus:border-rose-500"
                />
                <span className="text-xs text-slate-400 font-mono">°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Software Simulation Engine Mode & Refresh Interval */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            Software Simulation Engine Dynamics
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-medium text-slate-300">
              Select Simulated Environmental Pattern
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Normal', desc: 'Gentle ambient flux (24–27°C)' },
                { name: 'Warm', desc: 'Gradual warming (29–33°C)' },
                { name: 'Hot', desc: 'Rapid heating (34–38°C)' },
                { name: 'Cooling Down', desc: 'Steady cooling (22–25°C)' },
              ].map((m) => (
                <button
                  key={m.name}
                  type="button"
                  onClick={() => handleModeSelect(m.name)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    simMode === m.name
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold text-xs block mb-0.5">{m.name}</span>
                  <span className="text-[10px] text-slate-500 block leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Simulation Update Interval ({simInterval} seconds)
              </label>
              <span className="text-xs font-mono text-slate-500">1s - 10s</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={simInterval}
              onChange={(e) => setSimInterval(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm flex items-center space-x-2 transition-all shadow-lg shadow-sky-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Configurations...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
