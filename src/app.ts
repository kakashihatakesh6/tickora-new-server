import express from 'express';
import cors from 'cors';
import routes from './routes';
import { loggerMiddleware } from './middleware/logger';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: true, // Allow any origin by reflecting it back
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true, // Allow cookies/headers
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 12 * 3600 // 12 hours
};

app.use(cors(corsOptions));

// Logger middleware
app.use(loggerMiddleware);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Routes
app.use('/api/v1', routes); // Adjusted to match frontend expectation /api/v1/auth/register

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

export default app;
