import ServiceReport from '../models/ServiceReport.js';
import Ticket from '../models/Ticket.js';

export const submitReport = async (req, res) => {
    try {
        const reportData = req.body;
        
        let report = await ServiceReport.findOne({ ticketId: reportData.ticketId });
        if (report) {
            Object.assign(report, reportData);
            await report.save();
        } else {
            report = await ServiceReport.create(reportData);
        }

        res.status(201).json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReports = async (req, res) => {
    try {
        const query = req.query.status ? { status: req.query.status } : {};
        const reports = await ServiceReport.find(query)
            .populate('ticketId', 'ticketId faultDescription')
            .populate('customerId', 'name companyName phone address')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markReportReceiptCreated = async (req, res) => {
    try {
        const { id } = req.params;
        const report = await ServiceReport.findByIdAndUpdate(id, { status: 'receipt_created' }, { new: true });
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
