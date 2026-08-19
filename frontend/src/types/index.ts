export interface SensorReading {
  id: number;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface FanState {
  id: number;
  status: 'ON' | 'OFF';
  speed: number;
  mode: 'AUTO' | 'MANUAL';
  timestamp: string;
}

export interface Alert {
  id: number;
  alert_type: string;
  message: string;
  temperature: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resolved: boolean;
  timestamp: string;
}

export interface SystemSettings {
  id: number;
  low_threshold: number;
  medium_threshold: number;
  high_threshold: number;
  simulation_interval: number;
  simulation_mode: 'Normal' | 'Warm' | 'Hot' | 'Cooling Down';
  system_name: string;
  updated_at: string;
}

export interface DashboardData {
  current_temperature: number;
  current_humidity: number;
  fan_status: 'ON' | 'OFF';
  fan_speed: number;
  operating_mode: 'AUTO' | 'MANUAL';
  system_status: 'ONLINE' | 'OFFLINE';
  current_alert: Alert | null;
  temperature_trend: SensorReading[];
  humidity_trend: SensorReading[];
  last_updated: string;
}

export interface AnalyticsSummary {
  current_temp: number;
  avg_temp: number;
  min_temp: number;
  max_temp: number;
  current_humidity: number;
  avg_humidity: number;
  min_humidity: number;
  max_humidity: number;
  total_operating_time_mins: number;
  avg_fan_speed: number;
  max_fan_speed: number;
  auto_activations_count: number;
  time_filter: string;
}

export interface AIChatMessage {
  user_message: string;
  ai_response: string;
  timestamp: string;
}
