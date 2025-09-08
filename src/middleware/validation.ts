import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { ProviderType } from '../types';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateProvider = [
  param('provider')
    .isIn(Object.values(ProviderType))
    .withMessage(`Provider must be one of: ${Object.values(ProviderType).join(', ')}`),
  handleValidationErrors
];

export const validateApiKeyCreate = [
  body('provider')
    .isIn(Object.values(ProviderType))
    .withMessage(`Provider must be one of: ${Object.values(ProviderType).join(', ')}`),
  body('apiKey')
    .notEmpty()
    .withMessage('API key is required')
    .isString()
    .withMessage('API key must be a string')
    .custom((value: string, { req }) => {
      const provider = req.body.provider;
      
      switch (provider) {
        case ProviderType.OPENAI:
          // OpenAI keys can be sk-<anything> or sk-proj-<anything>
          if (!value.startsWith('sk-') || value.length < 20) {
            throw new Error('OpenAI API key must start with "sk-" and be at least 20 characters long');
          }
          break;
        case ProviderType.ANTHROPIC:
          if (!value.startsWith('sk-ant-') || value.length < 20) {
            throw new Error('Anthropic API key must start with "sk-ant-" and be at least 20 characters long');
          }
          break;
        case ProviderType.GEMINI:
          if (!value.startsWith('AIza') || value.length < 20) {
            throw new Error('Gemini API key must start with "AIza" and be at least 20 characters long');
          }
          break;
        default:
          throw new Error('Invalid provider');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateApiKeyUpdate = [
  param('provider')
    .isIn(Object.values(ProviderType))
    .withMessage(`Provider must be one of: ${Object.values(ProviderType).join(', ')}`),
  body('apiKey')
    .notEmpty()
    .withMessage('API key is required')
    .isString()
    .withMessage('API key must be a string')
    .custom((value: string, { req }) => {
      const provider = req.params?.provider;
      
      switch (provider) {
        case ProviderType.OPENAI:
          // OpenAI keys can be sk-<anything> or sk-proj-<anything>
          if (!value.startsWith('sk-') || value.length < 20) {
            throw new Error('OpenAI API key must start with "sk-" and be at least 20 characters long');
          }
          break;
        case ProviderType.ANTHROPIC:
          if (!value.startsWith('sk-ant-') || value.length < 20) {
            throw new Error('Anthropic API key must start with "sk-ant-" and be at least 20 characters long');
          }
          break;
        case ProviderType.GEMINI:
          if (!value.startsWith('AIza') || value.length < 20) {
            throw new Error('Gemini API key must start with "AIza" and be at least 20 characters long');
          }
          break;
        default:
          throw new Error('Invalid provider');
      }
      return true;
    }),
  handleValidationErrors
];

export const validateUserRegistration = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  handleValidationErrors
];