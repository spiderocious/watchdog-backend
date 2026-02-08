export type NodeStatus = 'active' | 'paused' | 'down' | 'warning';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface MonitorNode {
  id: string;
  user_id: string;
  name: string;
  endpoint_url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  check_interval: number;
  expected_status_codes: number[];
  failure_threshold: number;
  status: NodeStatus;
  consecutive_failures: number;
  last_check_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNodeDTO {
  service_name: string;
  endpoint_url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  check_interval: number;
  failure_threshold?: number;
  expected_status_codes?: number[];
}

export interface UpdateNodeDTO {
  service_name?: string;
  endpoint_url?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  check_interval?: number;
  failure_threshold?: number;
  expected_status_codes?: number[];
}

export interface TestConnectionDTO {
  endpoint_url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
}
