import axios from 'axios';
import { 
  DashboardData, 
  SensorReading, 
  FanState, 
  Alert, 
  SystemSettings, 
  AnalyticsSummary,
  AIChatMessage 
} from '../types';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.startsWith('http')) {
    return import.meta.env.VITE_API_URL;
  }
  // Production fallback on Render
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://smart-cooling-backend.onrender.com/api';
  }
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get<DashboardData>('/dashboard');
  return response.data;
};

export const getLatestSensor = async (): Promise<SensorReading> => {
  const response = await api.get<SensorReading>('/sensor/latest');
  return response.data;
};

export const getSensorHistory = async (limit = 50): Promise<SensorReading[]> => {
  const response = await api.get<SensorReading[]>(`/sensor/history?limit=${limit}`);
  return response.data;
};

export const getFanStatus = async (): Promise<FanState> => {
  const response = await api.get<FanState>('/fan/status');
  return response.data;
};

export const controlFan = async (payload: { status?: string; speed?: number; mode?: string }): Promise<FanState> => {
  const response = await api.post<FanState>('/fan/control', payload);
  return response.data;
};

export const setSystemMode = async (mode: 'AUTO' | 'MANUAL'): Promise<FanState> => {
  const response = await api.post<FanState>('/system/mode', { mode });
  return response.data;
};

export const getAlerts = async (resolved?: boolean): Promise<Alert[]> => {
  const url = resolved !== undefined ? `/alerts?resolved=${resolved}` : '/alerts';
  const response = await api.get<Alert[]>(url);
  return response.data;
};

export const resolveAlert = async (id: number): Promise<Alert> => {
  const response = await api.patch<Alert>(`/alerts/${id}/resolve`);
  return response.data;
};

export const getAnalyticsSummary = async (filter = 'today'): Promise<AnalyticsSummary> => {
  const response = await api.get<AnalyticsSummary>(`/analytics/summary?filter=${filter}`);
  return response.data;
};

export const getSettings = async (): Promise<SystemSettings> => {
  const response = await api.get<SystemSettings>('/settings');
  return response.data;
};

export const updateSettings = async (payload: Partial<SystemSettings>): Promise<SystemSettings> => {
  const response = await api.put<SystemSettings>('/settings', payload);
  return response.data;
};

export const setSimulationMode = async (mode: string): Promise<SystemSettings> => {
  const response = await api.post<SystemSettings>('/simulation/mode', { mode });
  return response.data;
};

export const postAIChat = async (userMessage: string): Promise<AIChatMessage> => {
  const response = await api.post<AIChatMessage>('/ai/chat', { user_message: userMessage });
  return response.data;
};
