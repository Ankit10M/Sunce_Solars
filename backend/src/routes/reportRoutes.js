import express from 'express';
import { submitReport, getReports, markReportReceiptCreated } from '../controllers/reportController.js';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';

const reportRouter = express.Router();

// Used by Engineer
reportRouter.post('/submit', protect, restrictTo('engineer', 'service_manager', 'admin'), submitReport);

// Used by Sales/Admin
reportRouter.get('/', protect, restrictTo('sales', 'admin'), getReports);
reportRouter.patch('/:id/receipt', protect, restrictTo('sales', 'admin'), markReportReceiptCreated);

export default reportRouter;
