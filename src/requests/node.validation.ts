import { body, param, query } from 'express-validator';

export const createNodeValidation = [
  body('service_name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Service name is required and must be under 100 characters'),

  body('endpoint_url')
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
    .withMessage('A valid HTTP/HTTPS URL is required'),

  body('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    .withMessage('Method must be GET, POST, PUT, PATCH, or DELETE'),

  body('check_interval')
    .isInt({ min: 15000, max: 3600000 })
    .withMessage('Check interval must be between 15000ms and 3600000ms'),

  body('failure_threshold')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Failure threshold must be between 1 and 10'),

  body('expected_status_codes')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Expected status codes must be a non-empty array'),

  body('expected_status_codes.*')
    .optional()
    .isInt({ min: 100, max: 599 })
    .withMessage('Each status code must be between 100 and 599'),
];

export const updateNodeValidation = [
  param('service_id')
    .notEmpty()
    .withMessage('Service ID is required'),

  body('service_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Service name must be under 100 characters'),

  body('endpoint_url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
    .withMessage('A valid HTTP/HTTPS URL is required'),

  body('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    .withMessage('Method must be GET, POST, PUT, PATCH, or DELETE'),

  body('check_interval')
    .optional()
    .isInt({ min: 15000, max: 3600000 })
    .withMessage('Check interval must be between 15000ms and 3600000ms'),

  body('failure_threshold')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Failure threshold must be between 1 and 10'),
];

export const serviceIdParam = [
  param('service_id')
    .notEmpty()
    .withMessage('Service ID is required'),
];

export const listNodesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('status')
    .optional()
    .isIn(['active', 'down', 'warning', 'paused'])
    .withMessage('Status must be active, down, warning, or paused'),

  query('sort_by')
    .optional()
    .isIn(['name', 'uptime', 'last_check', 'created_at'])
    .withMessage('Sort by must be name, uptime, last_check, or created_at'),

  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

export const testConnectionValidation = [
  body('endpoint_url')
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true, require_tld: false })
    .withMessage('A valid HTTP/HTTPS URL is required'),

  body('method')
    .optional()
    .isIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    .withMessage('Method must be GET, POST, PUT, PATCH, or DELETE'),
];
