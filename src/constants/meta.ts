import * as dotenv from 'dotenv';
dotenv.config();
export const META_CONFIG = {
  BASE_URL: process.env.META_BASE_URL || 'https://graph.facebook.com',
  APP_ID: process.env.META_APP_ID,
  APP_SECRET: process.env.META_APP_SECRET
};
