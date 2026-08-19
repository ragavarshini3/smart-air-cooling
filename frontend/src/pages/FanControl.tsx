import React, { useState, useEffect } from 'react';
import { 
  Fan, 
  Sliders, 
  Power, 
  Cpu, 
  Info, 
  Zap, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { getFanStatus, controlFan, setSystemMode, getLatestSensor } from '../services/api';
import { FanState, SensorReading } from '../types';
import { StatusBadge } from '../components/dashboard/StatusBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const FanControl: React.FC = () => {
  const [fanState, setFanState] = useState<FanState | null>(null);
  const [sensor, setSensor] = useState<SensorReading | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [speedInput, setSpeedInput] = useState<number>(0);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchState = async () => {
    try {
      const [st, s] = await Promise.all([getFanStatus(), getLatestSensor()]);
      setFanState(st);
      setSensor(s);
      setSpeedInput(st.speed);
    } catch (e: any) {
      console.error('Failed to fetch fan state', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleModeToggle = async (newMode: 'AUTO' | 'MANUAL') => {
    setUpdating(true);
    try {
      const updated = await setSystemMode(newMode);
      setFanState(updated);
      setSpeedInput(updated.speed);
      setMsg(`System mode switched to ${newMode}`);
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to change system mode');
    } finally {
      setUpdating(false);
    }
  };

  const handlePowerToggle = async () => {
    if (!fanState) return;
    setUpdating(true);
    const targetStatus = fanState.status === 'ON' ? 'OFF' : 'ON';
    const targetSpeed = targetStatus === 'ON' ? (speedInput > 0 ? speedInput : 50) : 0;
    try {
      const updated = await controlFan({
        status: targetStatus,
        speed: targetSpeed,
        mode: 'MANUAL'
      });
      setFanState(updated);
      setSpeedInput(updated.speed);
      setMsg(`Simulated Fan turned ${targetStatus}`);
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to update fan state');
    } finally {
      setUpdating(false);
    }
  };

  const handleSpeedChange = async (newSpeed: number) => {
    setSpeedInput(newSpeed);
  };

  const handleSpeedCommit = async () => {
    setUpdating(true);
    try {
      const updated = await controlFan({
        status: speedInput > 0 ? 'ON' : 'OFF',
        speed: speedInput,
        mode: 'MANUAL'
      });
      setFanState(updated);
      setMsg(`Simulated Fan speed set to ${speedInput}%`);
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to update fan speed');
    } finally {
      setUpdating(false);
    }
  };

  const setPresetSpeed = async (speed: number) => {
    setSpeedInput(speed);
    setUpdating(true);
    try {
      const updated = await controlFan({
        status: speed > 0 ? 'ON' : 'OFF',
        speed: speed,
        mode: 'MANUAL'
      });
      setFanState(updated);
      setMsg(`Preset applied: ${speed}% Speed`);
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      alert('Failed to apply preset');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && !fanState) {
    return <LoadingSpinner message="Loading fan control interface..." />;
  }

  if (!fanState) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-850 border border-slate-800 rounded-xl p-6 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Fan className={`w-6 h-6 ${fanState.status === 'ON' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Fan Control Console</h2>
              <p className="text-xs text-slate-400">Software-simulated HVAC & Cooling Fan Controls</p>
            </div>
          </div>
        </div>

        {/* Current Sensor Summary Pill */}
        {sensor && (
          <div className="bg-slate-900 px-4 py-2.5 rounded-lg border border-slate-800 flex items-center space-x-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">CURRENT TEMP</span>
              <span className="text-sky-400 font-bold text-sm">{sensor.temperature}°C</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block text-[10px]">CURRENT SPEED</span>
              <span className="text-emerald-400 font-bold text-sm">{fanState.speed}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Software Simulation Notice */}
      <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 flex items-start space-x-3 text-xs text-sky-300">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-sky-200 block mb-0.5">Software Simulation Notice</span>
          All manual commands manipulate the backend simulation engine in real-time. Changes directly affect simulated cooling rates and thermal dynamics. No physical IoT hardware involved.
        </div>
      </div>

      {/* Notification Toast */}
      {msg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Control Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mode Toggle & Status */}
        <div className="bg-slate-850 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-400" />
            Operating Mode
          </h3>

          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => handleModeToggle('AUTO')}
              disabled={updating}
              className={`py-3 px-4 rounded-md text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                fanState.mode === 'AUTO'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>AUTOMATIC</span>
            </button>
            <button
              onClick={() => handleModeToggle('MANUAL')}
              disabled={updating}
              className={`py-3 px-4 rounded-md text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                fanState.mode === 'MANUAL'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>MANUAL</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 space-y-2 bg-slate-900/60 p-4 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center">
              <span>Active Mode:</span>
              <StatusBadge 
                status={fanState.mode} 
                variant={fanState.mode === 'AUTO' ? 'info' : 'warning'} 
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              {fanState.mode === 'AUTO'
                ? 'In AUTO mode, fan speed is continuously governed by backend thermal threshold rules based on real-time temperature.'
                : 'In MANUAL mode, you possess total override authority over fan power and speed.'}
            </p>
          </div>
        </div>

        {/* Right Column: Speed & Power Controls (2 cols wide) */}
        <div className="lg:col-span-2 bg-slate-850 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Power className="w-4 h-4 text-emerald-400" />
              Simulated Fan Actuator
            </h3>
            <span className={`text-xs font-mono font-semibold px-3 py-1 rounded-full border ${
              fanState.status === 'ON' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {fanState.status}
            </span>
          </div>

          {/* Main Power Button */}
          <div className="flex justify-center py-4">
            <button
              onClick={handlePowerToggle}
              disabled={updating || fanState.mode === 'AUTO'}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center space-y-2 border-4 transition-all duration-200 ${
                fanState.mode === 'AUTO'
                  ? 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                  : fanState.status === 'ON'
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/30 hover:scale-105'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 hover:scale-105'
              }`}
            >
              <Power className={`w-8 h-8 ${fanState.status === 'ON' ? 'animate-pulse' : ''}`} />
              <span className="text-xs font-bold font-mono tracking-wider">
                {fanState.status === 'ON' ? 'TURN OFF' : 'TURN ON'}
              </span>
            </button>
          </div>

          {fanState.mode === 'AUTO' && (
            <p className="text-center text-xs text-amber-400/90 font-medium">
              * Switch mode to MANUAL to enable manual power & speed sliders.
            </p>
          )}

          {/* Fan Speed Slider */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-300">
                Fan Speed Control ({speedInput}%)
              </label>
              <span className="text-xs font-mono text-slate-400">0% - 100%</span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={speedInput}
              onChange={(e) => handleSpeedChange(Number(e.target.value))}
              onMouseUp={handleSpeedCommit}
              onTouchEnd={handleSpeedCommit}
              disabled={updating || fanState.mode === 'AUTO'}
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:cursor-not-allowed"
            />

            {/* Speed Presets */}
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[
                { label: 'OFF (0%)', val: 0 },
                { label: 'LOW (30%)', val: 30 },
                { label: 'MED (60%)', val: 60 },
                { label: 'HIGH (100%)', val: 100 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  onClick={() => setPresetSpeed(preset.val)}
                  disabled={updating || fanState.mode === 'AUTO'}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-medium border transition-all ${
                    speedInput === preset.val
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
