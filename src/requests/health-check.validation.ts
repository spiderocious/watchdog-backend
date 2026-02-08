import { query, param } from 'express-validator';

export const listHealthChecksValidation = [
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

  query('service_id')
    .optional()
    .notEmpty()
    .withMessage('Service ID must not be empty'),

  query('success')
    .optional()
    .isBoolean()
    .withMessage('Success must be a boolean')
    .toBoolean(),

  query('status_code')
    .optional()
    .isInt({ min: 0, max: 599 })
    .withMessage('Status code must be between 0 and 599')
    .toInt(),

  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO8601 date')
    .toDate(),

  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO8601 date')
    .toDate(),

  query('url_search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('URL search must not be empty'),
];

export const triggerManualCheckValidation = [
  param('service_id')
    .notEmpty()
    .withMessage('Service ID is required'),
];
