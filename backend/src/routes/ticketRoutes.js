import express from 'express';
import {
    createTicket,
    getAllTickets,
    getTicket,
    updateStatus,
    assignTicket,
    updateWarranty,
    submitToSales
} from '../controllers/ticketController.js';
import protect from '../middleware/authMiddleware.js';
import restrictTo from '../middleware/roleMiddleware.js';

const ticketRoute = express.Router();
ticketRoute.use(protect)
ticketRoute.post('/', restrictTo('customer', 'sales'), createTicket)
ticketRoute.get('/', getAllTickets)
ticketRoute.get('/:id', getTicket)
ticketRoute.patch('/:id/status', restrictTo('sales', 'engineer', 'admin'), updateStatus)
ticketRoute.patch('/:id/assign', restrictTo('sales', 'admin'), assignTicket)
ticketRoute.patch('/:id/warranty', restrictTo('sales', 'admin'), updateWarranty)
ticketRoute.patch('/:id/submit-to-sales', restrictTo('engineer'), submitToSales)

export default ticketRoute;
