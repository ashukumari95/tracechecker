import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'; // 🚨 Added for Security
import connectDB from './config/db';

// Routes Import
import scanRoutes from './routes/scanRoutes';
import authRoutes from './routes/authRoutes'; 

dotenv.config();

const app = express();

// 1. Database Connection
connectDB();

// 2. SECURITY MIDDLEWARES 🛡️

// Helmet: Browser security headers set karta hai
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate Limiter: Ek IP se 15 minute mein sirf 100 requests allow karega
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use('/api/', limiter);

// CORS Configuration: Sirf aapke frontend ko access dega
const allowedOrigins = [
  'http://localhost:3000', 
  'https://tracechecker.vercel.app', // Aapka Vercel URL
  process.env.CLIENT_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Security Policy: CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '10kb' })); // 🚨 Body size limit taaki large payload attack na ho

// 3. API ROUTES
app.use('/api/v1/scan', scanRoutes);
app.use('/api/v1/auth', authRoutes);

// Root Route for Health Check
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('TraceChecker Secure API Node: Active');
});

// 4. GLOBAL ERROR HANDLER (Secure: No stack traces in production)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  console.error(`[SECURE_LOG] Error: ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal Security Error" : err.message,
    // Error detail sirf development mein dikhayenge
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛡️ TraceChecker Engine Secured & Running on Port: ${PORT}`);
});
