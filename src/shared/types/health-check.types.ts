export interface HealthCheck {
  id: string;
  node_id: string;
  status_code: number;
  status_text: string;
  response_time: number;
  success: boolean;
  error_message?: string;
  request_headers?: Record<string, string>;
  request_body?: string;
  response_headers?: Record<string, string>;
  response_body?: string;
  response_content_type?: string;
  created_at: Date;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
