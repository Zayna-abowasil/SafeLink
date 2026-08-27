import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { Report } from './report.model.js';
import cloudinary from '../../config/cloudinary.js';

export const createReport = async (req: AuthRequest, res: Response) => {
    try {
        const { scanId, reason, comments } = req.body;
        const userId = req.user?.userId;
        let screenshotUrl = '';

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const uploadResult = await cloudinary.uploader.upload(dataURI, {
                folder: 'SafeLinkReports',
            });
            screenshotUrl = uploadResult.secure_url;
        }

        const newReport = await Report.create({
            scanId,
            userId,
            reason: reason || 'Phishing',
            comments,
            screenshotUrl,
            status: 'Under Review',
        });

        res.status(201).json({
            message: 'Report submitted successfully',
            report: newReport
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to submit report', error });
    }
};

export const getAllReports = async (req: AuthRequest, res: Response) => {
    try {
        const reports = await Report.find()
          .populate('scanId', 'url riskScore classification')
          .populate('userId', 'name email role')
          .sort({ reportDate: -1 });

        res.status(200).json({ count: reports.length, reports });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve reports', error });
    }
};

export const updateReportStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const report = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.status(200).json({ message: 'Report status updated', report });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update report status', error });
    }
};