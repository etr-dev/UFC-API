import { config } from 'dotenv';

config();
export const HealthResponse = `Server is running on port ${process.env.APP_PORT}`;
export const SUCCESS_MESSAGE = 'SUCCESS';