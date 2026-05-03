import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pagespeedRoutes from './routes/pagespeed';
import pool from './config/database';
import { scheduleDailyUpdate } from './services/cronService';

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/pagespeed', pagespeedRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints: http://localhost:${PORT}/api/pagespeed`);
  
  // Запускаем ежедневное обновление в 4:00
  scheduleDailyUpdate();
});

export default app;
