import express from 'express';
import {
    createBilling,
    getMyBillings,
    getBillingByTicket,
    getAllBillings,
} from '../controllers/billingController.js';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';

const billingRouter = express.Router();
billingRouter.use(protect);

// Customer: Get my billings
billingRouter.get('/my-billings', restrictTo('customer'), getMyBillings);

// Sales/Admin: Create billing for a ticket
billingRouter.post('/', restrictTo('sales', 'admin'), createBilling);

// Sales/Admin: Get all billings
billingRouter.get('/', restrictTo('sales', 'admin'), getAllBillings);

// Get billing by ticket ID (all authenticated users)
billingRouter.get('/ticket/:ticketId', getBillingByTicket);

export default billingRouter;
