import { DataSource } from 'typeorm';
import { InsightListenerService } from '../subscribers/insight.subscriber';
import { UserDashboard } from '@/entity/user-dashboard.entity';
import { config } from 'dotenv';
config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: ['dist/**/*.entity.{ts,js}'],
  migrations: ['dist/migrations/*.{ts,js}'],
  subscribers: [InsightListenerService],
  synchronize: true,
  logging: false
});
