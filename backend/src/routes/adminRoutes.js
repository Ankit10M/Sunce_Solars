import express from 'express';
import {
  getDashboardStats,
  getAllTickets,
  closeTicket,
  getUserStats,
  updateUserStatus,
  getPendingApprovals,
  approveEmployee,
  rejectEmployee,
  checkUserTickets,
  reassignUserTickets,
  deleteUserSafely,
  getActiveUsersByRole,
  getTicketWorkflow,
  getFinancialOverview,
  getActiveVisitors,
  getSparePartsUsage,
  getRevenueTrend
} from '../controllers/adminController.js';
import protect from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const adminRouter = express.Router();

// Protect all admin routes
adminRouter.use(protect, roleMiddleware('admin'));

// Dashboard stats
adminRouter.get('/dashboard-stats', getDashboardStats);

// Ticket management
adminRouter.get('/tickets', getAllTickets);
adminRouter.patch('/tickets/:ticketId/close', closeTicket);

// User & role management
adminRouter.get('/users', getUserStats);
adminRouter.patch('/users/:userId/status', updateUserStatus);

// User deletion with ticket reassignment
adminRouter.get('/users/:userId/check-tickets', checkUserTickets);
adminRouter.post('/users/:fromUserId/reassign-tickets', reassignUserTickets);
adminRouter.delete('/users/:userId/delete-safe', deleteUserSafely);
adminRouter.get('/users-by-role', getActiveUsersByRole);

// Employee approvals
adminRouter.get('/pending-approvals', getPendingApprovals);
adminRouter.patch('/approve-employee/:userId', approveEmployee);
adminRouter.delete('/reject-employee/:userId', rejectEmployee);

// Workflow and logs
adminRouter.get('/ticket-workflow', getTicketWorkflow);

// Financial overview
adminRouter.get('/financial-overview', getFinancialOverview);

// Spare parts usage (dynamic bar chart data)
adminRouter.get('/spare-parts-usage', getSparePartsUsage);

// Revenue trend (line chart data)
adminRouter.get('/revenue-trend', getRevenueTrend);

// Active visitors
adminRouter.get('/active-visitors', getActiveVisitors);

export default adminRouter;

