import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './modules/auth/auth.routers.js';
import scanRoutes from './modules/scans/scan.routes.js';
import reportRoutes from './modules/reports/report.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Unified API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});