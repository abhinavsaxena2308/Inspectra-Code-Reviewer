import express from 'express';
import cors from 'cors';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/error';
import routes from './routes';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// API Routes
app.use('/api', routes);

// 404 Handler for API
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'Route not found',
  });
});

// Error Handling Middleware
app.use(errorHandler);

export default app;
