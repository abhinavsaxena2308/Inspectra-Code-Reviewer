import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './middleware/logger';
import { errorHandler } from './middleware/error';
import routes from './routes';

const app = express();

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Apply limiting to all API requests
app.use('/api', limiter);

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
