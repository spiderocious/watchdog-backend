export const MESSAGE_KEYS = {
  // General
  SUCCESS: 'SUCCESS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',

  // Auth
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_TAKEN: 'EMAIL_TAKEN',
  TOKEN_REQUIRED: 'TOKEN_REQUIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  USER_FETCHED: 'USER_FETCHED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Nodes (monitored services)
  NODE_CREATED: 'NODE_CREATED',
  NODE_FETCHED: 'NODE_FETCHED',
  NODES_FETCHED: 'NODES_FETCHED',
  NODE_UPDATED: 'NODE_UPDATED',
  NODE_DELETED: 'NODE_DELETED',
  NODE_NOT_FOUND: 'NODE_NOT_FOUND',
  NODE_PAUSED: 'NODE_PAUSED',
  NODE_RESUMED: 'NODE_RESUMED',
  NODE_ALREADY_PAUSED: 'NODE_ALREADY_PAUSED',
  NODE_ALREADY_ACTIVE: 'NODE_ALREADY_ACTIVE',
  NODE_TEST_SUCCESS: 'NODE_TEST_SUCCESS',
  NODE_TEST_FAILED: 'NODE_TEST_FAILED',
  CONNECTION_TEST_SUCCESS: 'CONNECTION_TEST_SUCCESS',
  CONNECTION_TEST_FAILED: 'CONNECTION_TEST_FAILED',

  // Dashboard
  DASHBOARD_FETCHED: 'DASHBOARD_FETCHED',

  // System
  SYSTEM_STATUS_FETCHED: 'SYSTEM_STATUS_FETCHED',
} as const;

export type MessageKey = (typeof MESSAGE_KEYS)[keyof typeof MESSAGE_KEYS];

export const MESSAGES: Record<MessageKey, string> = {
  SUCCESS: 'Request successful',
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Invalid request parameters',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',

  REGISTER_SUCCESS: 'Registration successful.',
  LOGIN_SUCCESS: 'Login successful',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_TAKEN: 'This email is already registered',
  TOKEN_REQUIRED: 'Authentication token is required',
  INVALID_TOKEN: 'Invalid or expired token',
  USER_FETCHED: 'User fetched successfully',
  USER_NOT_FOUND: 'User not found',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'You don\'t have permission to access this resource',

  NODE_CREATED: 'Service created successfully',
  NODE_FETCHED: 'Service fetched successfully',
  NODES_FETCHED: 'Services fetched successfully',
  NODE_UPDATED: 'Service updated successfully',
  NODE_DELETED: 'Service deleted successfully',
  NODE_NOT_FOUND: 'Service not found',
  NODE_PAUSED: 'Service monitoring paused',
  NODE_RESUMED: 'Service monitoring resumed',
  NODE_ALREADY_PAUSED: 'Service is already paused',
  NODE_ALREADY_ACTIVE: 'Service is already active',
  NODE_TEST_SUCCESS: 'Test check completed',
  NODE_TEST_FAILED: 'Test check failed',
  CONNECTION_TEST_SUCCESS: 'Connection test successful',
  CONNECTION_TEST_FAILED: 'Connection test failed',

  DASHBOARD_FETCHED: 'Dashboard data fetched successfully',

  SYSTEM_STATUS_FETCHED: 'System status fetched successfully',
};
