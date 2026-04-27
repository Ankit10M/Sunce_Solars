import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import ServiceLog from '../models/ServiceLog.js';
import Customer from '../models/Customer.js';
import Billing from '../models/Billing.js';
import JobCard from '../models/JobCard.js';
import AMC from '../models/AMC.js';

// Dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        const totalTickets = await Ticket.countDocuments();
        const openTickets = await Ticket.countDocuments({ status: 'ticket_created' });
        const closedTickets = await Ticket.countDocuments({ status: 'closed' });
        
        const activeRepairs = await Ticket.countDocuments({
            status: { $in: ['under_repair', 'under_diagnosis'] }
        });

        const warrantyTickets = await Ticket.aggregate([
            {
                $group: {
                    _id: '$warranty.status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const revenue = await Billing.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        // Calculate total revenue from completed tickets
      const totalRevenue = revenue[0]?.total || 0;

        // Additional status counts for pie chart
        const receivedCount = await Ticket.countDocuments({ status: 'received' });
        const onTransitCount = await Ticket.countDocuments({ status: 'on_transit' });
        const pickupScheduledCount = await Ticket.countDocuments({ status: 'pickup_scheduled' });
        const readyToDispatchCount = await Ticket.countDocuments({ status: 'ready_to_dispatch' });

        res.status(200).json({
            success: true,
            data: {
                totalTickets,
                openTickets,
                closedTickets,
                activeRepairs,
                totalRevenue,
                warrantyClaimsCount: warrantyTickets.find(t => t._id === 'in_warranty')?.count || 0,
                ticketsByStatus: {
                    underPickup: await Ticket.countDocuments({ status: 'ticket_created' }),
                    pickupScheduled: pickupScheduledCount,
                    onTransit: onTransitCount,
                    received: receivedCount,
                    repair: await Ticket.countDocuments({ status: { $in: ['under_repair', 'under_diagnosis'] } }),
                    readyToDispatch: readyToDispatchCount,
                    dispatched: await Ticket.countDocuments({ status: 'dispatched' }),
                    closed: closedTickets
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all tickets with filters
export const getAllTickets = async (req, res) => {
    try {
        const { status, searchTerm, limit = 50, page = 1 } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (searchTerm) {
            filter.$or = [
                { ticketId: { $regex: searchTerm, $options: 'i' } },
                { 'faultDescription': { $regex: searchTerm, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const tickets = await Ticket.find(filter)
            .populate('customer', 'name email phone')
            .populate('inverter', 'model capacity')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Ticket.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: tickets,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Close a ticket
export const closeTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { closingNotes } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        ticket.status = 'closed';
        ticket.notes = (ticket.notes || '') + `\n[Admin Close] ${closingNotes}`;
        ticket.closedAt = new Date();
        
        if (ticket.sla) {
            ticket.sla.closedAt = new Date();
        }

        await ticket.save();

        res.status(200).json({
            success: true,
            message: 'Ticket closed successfully',
            data: ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get user statistics and all users
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        
        const usersByRole = await User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            }
        ]);

        const allUsers = await User.find({}, '-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                usersByRole,
                users: allUsers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update user status
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'User status updated',
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending approvals (new employee signups)
export const getPendingApprovals = async (req, res) => {
    try {
        const pendingUsers = await User.find({ 
            isActive: false, 
            role: { $nin: ['customer', 'admin'] } 
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: pendingUsers.length,
            data: pendingUsers
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Approve employee signup
export const approveEmployee = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: true, lastLogin: new Date() },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Employee approved successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reject employee signup
export const rejectEmployee = async (req, res) => {
    try {
        const { userId } = req.params;

        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'Employee rejected and account deleted'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Check tickets assigned to a user (only active/non-closed tickets block deletion)
export const checkUserTickets = async (req, res) => {
    try {
        const { userId } = req.params;

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Only admin can check/delete sales and engineer accounts
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only admin can manage account deletion' 
            });
        }

        // For sales users, check assignedSalesBy
        // For engineers, check assignedTo
        let ticketFilter = {};
        if (user.role === 'sales') {
            ticketFilter = { assignedSalesBy: userId, status: { $ne: 'closed' } };
        } else if (user.role === 'engineer') {
            ticketFilter = { assignedTo: userId, status: { $ne: 'closed' } };
        } else {
            // Other roles don't have direct ticket assignments
            return res.status(200).json({
                success: true,
                user: { _id: user._id, name: user.name, email: user.email, role: user.role },
                ticketCount: 0,
                tickets: [],
                canDelete: true
            });
        }

        const tickets = await Ticket.find(ticketFilter)
            .select('_id ticketId status priority customer')
            .populate('customer', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role },
            ticketCount: tickets.length,
            tickets,
            canDelete: tickets.length === 0,
            message: tickets.length > 0 
                ? `Cannot delete user. ${tickets.length} active ticket(s) must be reassigned first.`
                : 'User has no active tickets. Safe to delete.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reassign tickets from one user to another
export const reassignUserTickets = async (req, res) => {
    try {
        const { fromUserId } = req.params;
        const { toUserId } = req.body;

        if (!toUserId) {
            return res.status(400).json({ 
                success: false, 
                message: 'toUserId is required' 
            });
        }

        // Verify both users exist
        const fromUser = await User.findById(fromUserId);
        const toUser = await User.findById(toUserId);

        if (!fromUser) {
            return res.status(404).json({ success: false, message: 'Source user not found' });
        }
        if (!toUser) {
            return res.status(404).json({ success: false, message: 'Target user not found' });
        }

        // Ensure target user is active
        if (!toUser.isActive) {
            return res.status(400).json({ 
                success: false, 
                message: 'Target user must be active' 
            });
        }

        // Ensure role compatibility
        if (fromUser.role !== toUser.role) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot reassign: ${fromUser.role} tickets to ${toUser.role} user` 
            });
        }

        // Based on role, reassign tickets
        let ticketFilter = {};
        let updateData = {};

        if (fromUser.role === 'sales') {
            ticketFilter = { assignedSalesBy: fromUserId };
            updateData = { assignedSalesBy: toUserId };
        } else if (fromUser.role === 'engineer') {
            ticketFilter = { assignedTo: fromUserId };
            updateData = { assignedTo: toUserId };
        } else {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot reassign tickets for ${fromUser.role} role` 
            });
        }

        const result = await Ticket.updateMany(ticketFilter, updateData);

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} ticket(s) reassigned successfully`,
            data: {
                fromUser: { _id: fromUser._id, name: fromUser.name },
                toUser: { _id: toUser._id, name: toUser.name },
                ticketsReassigned: result.modifiedCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Safe delete user - only if no active tickets assigned (admin only)
export const deleteUserSafely = async (req, res) => {
    try {
        const { userId } = req.params;

        // Only admin can delete accounts
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Only admin can delete user accounts' 
            });
        }

        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent deleting admin accounts
        if (user.role === 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Cannot delete admin accounts' 
            });
        }

        // Only allow deletion of sales and engineer roles
        if (user.role !== 'sales' && user.role !== 'engineer') {
            return res.status(400).json({ 
                success: false, 
                message: `Deletion is only supported for sales and engineer accounts. This user has role: ${user.role}` 
            });
        }

        // Check for active (non-closed) assigned tickets based on role
        let ticketFilter = {};
        if (user.role === 'sales') {
            ticketFilter = { assignedSalesBy: userId, status: { $ne: 'closed' } };
        } else if (user.role === 'engineer') {
            ticketFilter = { assignedTo: userId, status: { $ne: 'closed' } };
        }

        const ticketCount = await Ticket.countDocuments(ticketFilter);

        if (ticketCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete user: ${ticketCount} active ticket(s) still assigned. Please reassign all tickets first.`,
                ticketCount,
                userInfo: { _id: user._id, name: user.name, email: user.email, role: user.role }
            });
        }

        // Safe to delete - no active tickets assigned
        await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: `User "${user.name}" deleted successfully`,
            deletedUser: { _id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all active users of same role (for reassignment dropdown)
export const getActiveUsersByRole = async (req, res) => {
    try {
        const { role } = req.query;

        if (!role) {
            return res.status(400).json({ 
                success: false, 
                message: 'role query parameter is required' 
            });
        }

        const users = await User.find({ role, isActive: true })
            .select('_id name email')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get ticket workflow logs (system logs with ticket progression)
export const getTicketWorkflow = async (req, res) => {
    try {
        const { ticketId } = req.query;
        let filter = {};
        
        if (ticketId) {
            filter.ticket = ticketId;
        }

        const logs = await ServiceLog.find(filter)
            .populate('ticket', 'ticketId status priority')
            .populate('performBy', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get financial overview - DYNAMIC with real data
export const getFinancialOverview = async (req, res) => {
    try {
        // Total revenue from billing
        const billingRevenue = await Billing.aggregate([
            { $match: { status: { $in: ['sent', 'paid'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Warranty claims
        const warrantyClaims = await Ticket.countDocuments({ 'warranty.status': 'in_warranty' });
        const outOfWarrantyClaims = await Ticket.countDocuments({ 'warranty.status': 'out_of_warranty' });

        // AMC data - from dedicated AMC model
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Auto-expire past-due contracts
        await AMC.updateMany(
            { status: 'active', endDate: { $lt: now } },
            { $set: { status: 'expired' } }
        );

        const allAmcs = await AMC.find()
            .populate('customer', 'name companyName')
            .populate('inverter', 'make model serialNumber')
            .select('amcId customer inverter startDate endDate planType status');

        const amcCount = allAmcs.length;

        // Build AMC contracts list from real AMC model
        const amcContracts = allAmcs.map(amc => ({
            id: amc.amcId,
            customer: amc.customer?.companyName || amc.customer?.name || 'Unknown',
            product: amc.inverter ? `${amc.inverter.make} ${amc.inverter.model}` : 'N/A',
            startDate: amc.startDate ? new Date(amc.startDate).toISOString().split('T')[0] : 'N/A',
            endDate: amc.endDate ? new Date(amc.endDate).toISOString().split('T')[0] : 'N/A',
            planType: amc.planType,
            status: amc.endDate && new Date(amc.endDate) > now
                ? (new Date(amc.endDate) - now < 30 * 24 * 60 * 60 * 1000 ? 'Expiring Soon' : 'Active')
                : 'Expired'
        }));

        const expiringSoonCount = await AMC.countDocuments({
            status: 'active',
            endDate: { $gte: now, $lte: thirtyDaysFromNow },
        });

        // Spare parts consumption from JobCard.sparesUsed
        const sparesFromJobCards = await JobCard.aggregate([
            { $unwind: '$sparesUsed' },
            {
                $group: {
                    _id: '$sparesUsed.componentName',
                    totalUsed: { $sum: '$sparesUsed.quantity' },
                    totalCost: { $sum: { $multiply: ['$sparesUsed.quantity', '$sparesUsed.unitCost'] } }
                }
            },
            { $sort: { totalUsed: -1 } }
        ]);

        // Spare parts from Ticket.serviceReport.spareParts
        const sparesFromTickets = await Ticket.aggregate([
            { $match: { 'serviceReport.spareParts': { $exists: true, $ne: [] } } },
            { $unwind: '$serviceReport.spareParts' },
            {
                $group: {
                    _id: '$serviceReport.spareParts.name',
                    totalUsed: { $sum: '$serviceReport.spareParts.quantity' },
                    totalCost: { $sum: { $multiply: ['$serviceReport.spareParts.quantity', '$serviceReport.spareParts.price'] } }
                }
            },
            { $sort: { totalUsed: -1 } }
        ]);

        // Merge spare parts from both sources
        const spareMap = new Map();
        [...sparesFromJobCards, ...sparesFromTickets].forEach(s => {
            if (!s._id) return;
            const key = s._id.trim().toLowerCase();
            if (spareMap.has(key)) {
                const existing = spareMap.get(key);
                existing.totalUsed += s.totalUsed;
                existing.totalCost += s.totalCost;
            } else {
                spareMap.set(key, { component: s._id, totalUsed: s.totalUsed, totalCost: s.totalCost });
            }
        });
        const spareParts = Array.from(spareMap.values()).sort((a, b) => b.totalUsed - a.totalUsed);
        const totalSpareInvestment = spareParts.reduce((sum, s) => sum + s.totalCost, 0);

        // Tickets by status for financial tracking
        const ticketStats = await Ticket.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Claim resolution rate
        const totalClaims = warrantyClaims + outOfWarrantyClaims;
        const closedClaims = await Ticket.countDocuments({
            status: 'closed',
            'warranty.status': { $in: ['in_warranty', 'out_of_warranty'] }
        });
        const claimResolutionRate = totalClaims > 0 ? ((closedClaims / totalClaims) * 100).toFixed(1) : '0.0';

        res.status(200).json({
            success: true,
            data: {
                totalRevenue: billingRevenue[0]?.total || 0,
                warrantyClaims,
                outOfWarrantyClaims,
                amcCount,
                amcContracts,
                expiringSoonCount,
                spareParts,
                totalSpareInvestment,
                ticketStats,
                claimResolutionRate
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get spare parts usage - aggregated from all tickets
export const getSparePartsUsage = async (req, res) => {
    try {
        // From JobCard sparesUsed
        const sparesFromJobCards = await JobCard.aggregate([
            { $unwind: '$sparesUsed' },
            {
                $group: {
                    _id: '$sparesUsed.componentName',
                    totalUsed: { $sum: '$sparesUsed.quantity' },
                    totalCost: { $sum: { $multiply: ['$sparesUsed.quantity', '$sparesUsed.unitCost'] } }
                }
            },
            { $sort: { totalUsed: -1 } }
        ]);

        // From Ticket serviceReport.spareParts
        const sparesFromTickets = await Ticket.aggregate([
            { $match: { 'serviceReport.spareParts': { $exists: true, $ne: [] } } },
            { $unwind: '$serviceReport.spareParts' },
            {
                $group: {
                    _id: '$serviceReport.spareParts.name',
                    totalUsed: { $sum: '$serviceReport.spareParts.quantity' },
                    totalCost: { $sum: { $multiply: ['$serviceReport.spareParts.quantity', '$serviceReport.spareParts.price'] } }
                }
            },
            { $sort: { totalUsed: -1 } }
        ]);

        // Merge
        const spareMap = new Map();
        [...sparesFromJobCards, ...sparesFromTickets].forEach(s => {
            if (!s._id) return;
            const key = s._id.trim().toLowerCase();
            if (spareMap.has(key)) {
                const existing = spareMap.get(key);
                existing.usage += s.totalUsed;
            } else {
                spareMap.set(key, { name: s._id, usage: s.totalUsed });
            }
        });

        const barData = Array.from(spareMap.values()).sort((a, b) => b.usage - a.usage).slice(0, 10);

        res.status(200).json({
            success: true,
            data: barData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get revenue trend - monthly, quarterly, yearly
export const getRevenueTrend = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;

        let groupBy;
        if (period === 'yearly') {
            groupBy = { year: { $year: '$createdAt' } };
        } else if (period === 'quarterly') {
            groupBy = {
                year: { $year: '$createdAt' },
                quarter: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } }
            };
        } else {
            // monthly
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
        }

        const revenueData = await Billing.aggregate([
            { $match: { status: { $in: ['sent', 'paid'] } } },
            {
                $group: {
                    _id: groupBy,
                    revenue: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.quarter': 1 } }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        const formattedData = revenueData.map(item => {
            let label;
            if (period === 'yearly') {
                label = `${item._id.year}`;
            } else if (period === 'quarterly') {
                label = `Q${item._id.quarter} ${item._id.year}`;
            } else {
                label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
            }
            return {
                label,
                revenue: item.revenue,
                invoices: item.count
            };
        });

        res.status(200).json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get active visitors count (based on lastLogin within last hour)
export const getActiveVisitors = async (req, res) => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const activeCount = await User.countDocuments({
            lastLogin: { $gte: oneHourAgo },
            isActive: true
        });

        res.status(200).json({
            success: true,
            activeVisitors: activeCount
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
