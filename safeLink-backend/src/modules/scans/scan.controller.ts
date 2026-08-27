import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { Scan } from './scan.model.js';
import { analyzeUrlWithOpenAI } from './scan.service.js';

export const submitScan = async (req: AuthRequest, res: Response) => {
    try {
        const { url } = req.body;
        const userId = req.user?.userId;

        if (!url) {
            return res.status(400).json({ message: 'URL is required' });
        }

        const aiAnalysis = await analyzeUrlWithOpenAI(url);

        const newScan = await Scan.create({
            userId,
            url,
            riskScore: aiAnalysis.riskScore,
            classification: aiAnalysis.classification,
            threatIndicators: aiAnalysis.threatIndicators,
            aiExplanation: aiAnalysis.aiExplanation,
            status: 'Completed',
        });

        res.status(201).json({
            message: 'URL analyzed successfully',
            scan: newScan
        });
    } catch (error) {
        res.status(500).json({ message: 'Scan failed', error });
    }
};

export const getScanHistory = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const scans = await Scan.find({ userId }).sort({ scanDate: -1 });

        res.status(200).json({
            count: scans.length,
            scans
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve scan history', error });
    }
};

// Delete Scan (To complete CRUD requirement)
export const deleteScan = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        const scan = await Scan.findOneAndDelete({ _id: id, userId });
        if (!scan) {
            return res.status(404).json({ message: 'Scan not found or unauthorized' });
        }

        res.status(200).json({ message: 'Scan deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete scan', error });
    }
};