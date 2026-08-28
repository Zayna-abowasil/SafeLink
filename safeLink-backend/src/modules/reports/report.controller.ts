import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware.js';
import { Report } from './report.model.js';
import cloudinary from '../../config/cloudinary.js';
import mongoose from 'mongoose';

export const createReport = async (req: AuthRequest, res: Response) => {
    try {
        const { scanId, reason, comments } = req.body;
        const userId = req.user?.userId;
        let screenshotUrl = '';

        // 1. رفع الصورة إلى Cloudinary إن وُجدت
        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${b64}`;
            const uploadResult = await cloudinary.uploader.upload(dataURI, {
                folder: 'SafeLinkReports',
            });
            screenshotUrl = uploadResult.secure_url;
        }

        // 2. التحقق من صلاحية معرف الفحص والمستخدم لضمان عدم حدوث CastError في Mongoose
        const validScanId = (scanId && mongoose.Types.ObjectId.isValid(scanId))
            ? new mongoose.Types.ObjectId(scanId)
            : new mongoose.Types.ObjectId();

        const validUserId = (userId && mongoose.Types.ObjectId.isValid(userId))
            ? new mongoose.Types.ObjectId(userId)
            : new mongoose.Types.ObjectId();

        // 3. حفظ التقرير في قاعدة البيانات
        const newReport = await Report.create({
            scanId: validScanId,
            userId: validUserId,
            reason: reason || 'Phishing',
            comments: comments || '',
            screenshotUrl: screenshotUrl || undefined,
            status: 'Under Review',
        });

        res.status(201).json({
            message: 'Report submitted successfully',
            report: newReport
        });
    } catch (error: any) {
        console.error('Report Creation Error:', error);
        res.status(500).json({ 
            message: error?.message || 'Failed to submit report', 
            error 
        });
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