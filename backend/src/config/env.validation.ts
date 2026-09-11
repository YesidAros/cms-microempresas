import * as Joi from 'joi';

export const esquemaValidacionEnv = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().required(),

  FRONTEND_URL: Joi.string().uri().required(),
  BACKEND_URL: Joi.string().uri().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),

  SENTRY_DSN: Joi.string().uri().allow('').optional(),
});