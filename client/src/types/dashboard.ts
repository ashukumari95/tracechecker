export interface SystemStat {
  label: string;
  value: string;
  chartData: string; // SVG path or array
  isHealth?: boolean;
}

export interface EventLog {
  id: string;
  timestamp: string;
  sourceIp: string;
  protocol: string;
  status: 'Success' | 'Scanning' | 'Failed';
}