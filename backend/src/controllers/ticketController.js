import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import Ticket from '../models/Ticket.js';
import Inverter from '../models/Inverter.js';
import AMC from '../models/AMC.js';
import ServiceLog from '../models/ServiceLog.js';
import { generateJobCardId, generateTicketId } from '../utils/generateTicketId.js';
import { isValidTransition, getNextStatuses } from '../utils/statusFlow.js';
import { getNextSalesPerson } from '../utils/roundRobinAssignment.js';


const SLA_HOURS = { critical: 24, high: 48, normal: 72 }

const calcSLADeadline = (priority) => {
    const hours = SLA_HOURS[priority] || 72
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + hours)
    return deadline;
}
export const createTicket = async (req, res) => {
    try {

        const { customerId, inverterId, faultDescription, errorCode, urgency, priority, requestAmc, amcPlan } = req.body;

        // Validate required fields
        if (!customerId || !inverterId || !faultDescription) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customerId, inverterId, faultDescription'
            });
        }

        // Validate customer exists
        const customer = await Customer.findById(customerId)
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' })
        }

        // Validate inverter exists and belongs to the customer
        const inverter = await Inverter.findById(inverterId)
        if (!inverter) {
            return res.status(404).json({ success: false, message: 'Inverter not found' })
        }
        if (inverter.customer.toString() !== customerId) {
            return res.status(400).json({ success: false, message: 'Inverter does not belong to this customer' })
        }

        // Check for active AMC contract
        const now = new Date();
        const activeAmc = await AMC.findOne({
            customer: customerId,
            inverter: inverterId,
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
        const isAmcCovered = !!activeAmc;

        const ticketId = await generateTicketId();

        // Get the next sales person using round-robin
        const assignedSalesPerson = await getNextSalesPerson();

        const ticket = await Ticket.create({
            ticketId,
            customer: customerId,
            inverter: inverterId,
            createdBy: req.user._id,
            assignedSalesBy: assignedSalesPerson._id,
            faultDescription,
            errorCode: errorCode || '',
            urgency: urgency || 'medium',
            priority: priority || 'normal',
            status: 'ticket_created',
            isAmcCovered,
            requestAmc: requestAmc || false,
            amcPlan: amcPlan || 0,
            amcContract: activeAmc ? activeAmc._id : null,
            warranty: isAmcCovered
                ? { status: 'amc', hasAMC: true, amcExpiry: activeAmc.endDate }
                : { status: 'unknown' },
            sla: {
                deadline: calcSLADeadline(priority || 'normal')
            }
        })

        await ServiceLog.create({
            ticket: ticket._id,
            performBy: req.user._id,
            action: 'ticket_created',
            newStatus: 'ticket_created',
            remarks: `Ticket ${ticketId} created.${isAmcCovered ? ` AMC covered (${activeAmc.amcId}).` : ''}`
        })

        res.status(201).json({ message: 'Ticket Created', success: true, ticket })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getAllTickets = async (req, res) => {
    try {
        const { status, priority, urgency, page = 1, limit = 20 } = req.query;
        let filter = {}

        // Role-based filtering
        if (req.user.role === 'customer') {
            // Customers see only their own tickets
            const customerProfile = await Customer.findOne({ user: req.user._id })
            if (!customerProfile) {
                return res.status(200).json({ success: true, count: 0, tickets: [] })
            }
            filter.customer = customerProfile._id
        } else if (req.user.role === 'engineer') {
            // Engineers see only tickets assigned to them
            filter.assignedTo = req.user._id
        } else if (req.user.role === 'sales') {
            // Sales users see tickets assigned to them via round-robin OR tickets they created (for backwards compatibility)
            filter.$or = [
                { assignedSalesBy: req.user._id },
                { createdBy: req.user._id }
            ]
        }
        if(req.query.submittedToSales){
            filter['serviceReport.submittedToSales'] = true;
        }
        // service_manager, admin see all tickets (no filter applied)

        if (status) filter.status = status
        if (priority) filter.priority = priority
        if (urgency) filter.urgency = urgency

        const skip = (Number(page) - 1) * Number(limit)
        const total = await Ticket.countDocuments(filter)
        const tickets = await Ticket.find(filter)
            .populate('customer', 'name companyName phone')
            .populate('inverter', 'make model serialNumber capacity warrantyStartDate warrantyEndDate')
            .populate('createdBy', 'name role')
            .populate('assignedTo', 'name role')
            .populate('assignedSalesBy', 'name role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            success: true,
            count: tickets.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            tickets,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const getTicket = async (req, res) => {
    try {
        let filter = { ticketId: req.params.id };

        // If param is a valid MongoDB ObjectId, also search by _id
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            filter = { $or: [{ _id: req.params.id }, { ticketId: req.params.id }] };
        }

        const ticket = await Ticket.findOne(filter)
            .populate('customer', 'name companyName phone address')
            .populate('inverter', 'make model serialNumber capacity plantLocation warrantyStartDate warrantyEndDate')
            .populate('createdBy', 'name role')
            .populate('assignedTo', 'name role')
            .populate('assignedSalesBy', 'name role')
            .populate('warranty.verifiedBy', 'name');
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket Not Found' })
        }
        const history = await ServiceLog.find({ ticket: ticket._id })
            .populate('performBy', 'name role')
            .sort({ loggedAt: 1 })
        const nextStatuses = getNextStatuses(ticket.status)
        return res.status(200).json({ success: true, history, ticket, nextStatuses })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const updateStatus = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, message: 'New Status is required' })
        }
        let filter = { ticketId: req.params.id };
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            filter = { $or: [{ _id: req.params.id }, { ticketId: req.params.id }] };
        }
        const ticket = await Ticket.findOne(filter);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not Found', success: false })
        }

        // Sales role cannot update to engineer-controlled statuses (received → dispatched is engineer territory)
        const engineerOnlyTargetStatuses = ['received', 'under_diagnosis', 'under_repair', 'ready_to_dispatch', 'dispatched'];
        if (req.user.role === 'sales' && engineerOnlyTargetStatuses.includes(status)) {
            return res.status(403).json({
                success: false,
                message: 'Sales team cannot modify ticket status to engineer-only statuses. Engineer handles received → dispatched.'
            })
        }
        // Sales cannot modify ticket while it is in engineer-controlled statuses
        const engineerControlledCurrentStatuses = ['received', 'under_diagnosis', 'under_repair', 'ready_to_dispatch'];
        if (req.user.role === 'sales' && engineerControlledCurrentStatuses.includes(ticket.status)) {
            return res.status(403).json({
                success: false,
                message: 'Sales team cannot modify ticket status while it is being handled by the engineering team. Control returns after dispatch.'
            })
        }

        // Admin can only close tickets
        if (req.user.role === 'admin' && status !== 'closed') {
            return res.status(403).json({ success: false, message: 'Admin role can only close tickets.' })
        }

        if (!isValidTransition(ticket.status, status)) {
            const allowed = getNextStatuses(ticket.status);
            return res.status(400).json({ success: false, message: `Cannot move from ${ticket.status} to ${status}. Allowed: [${allowed.join(', ')}]` })
        }
        const previousStatus = ticket.status;
        ticket.status = status;
        if (status === 'closed') {
            ticket.closureReason = remarks || '';
            ticket.sla.closedAt = new Date();
            ticket.sla.breached = ticket.sla.deadline && new Date() > ticket.sla.deadline;
            if (ticket.sla.breached) ticket.sla.breachedAt = new Date();
        }
        await ticket.save()
        await ServiceLog.create({
            ticket: ticket._id,
            performBy: req.user._id,
            action: 'status_changed',
            previousStatus,
            newStatus: status,
            remarks,
        });

        res.status(200).json({
            success: true,
            message: `Status updated to '${status}'.`,
            ticket,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const assignTicket = async (req, res) => {
    try {
        const { engineerId } = req.body;
        let filter = { ticketId: req.params.id };
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            filter = { $or: [{ _id: req.params.id }, { ticketId: req.params.id }] };
        }
        const ticket = await Ticket.findOne(filter);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found.' });
        }
        ticket.assignedTo = engineerId || null;
        await ticket.save();
        await ServiceLog.create({
            ticket: ticket._id,
            performBy: req.user._id,
            action: 'assigned',
            remarks: engineerId ? `Assigned to engineer ${engineerId}` : 'Unassigned',
        })
        const updated = await Ticket.findById(ticket._id).populate('assignedTo', 'name role');
        res.status(200).json({
            success: true, message: 'Ticket assigned', ticket: updated
        })
    } catch (error) {
        res.status(500).json({
            message: error.message, success: false
        })
    }
}

export const updateWarranty = async (req, res) => {
    try {
        const { status, startDate, expiryDate, hasAMC, amcExpiry } = req.body;

        let filter = { ticketId: req.params.id };
        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            filter = { $or: [{ _id: req.params.id }, { ticketId: req.params.id }] };
        }
        const ticket = await Ticket.findOne(filter);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found.' });
        }

        ticket.warranty = {
            ...ticket.warranty.toObject(),
            status: status || ticket.warranty.status,
            startDate: startDate || ticket.warranty.startDate,
            expiryDate: expiryDate || ticket.warranty.expiryDate,
            hasAMC: hasAMC !== undefined ? hasAMC : ticket.warranty.hasAMC,
            amcExpiry: amcExpiry || ticket.warranty.amcExpiry,
            verifiedBy: req.user._id,
            verifiedAt: new Date(),
        };

        await ticket.save();

        await ServiceLog.create({
            ticket: ticket._id,
            performBy: req.user._id,
            action: 'warranty_updated',
            remarks: `Warranty status set to: ${status}`,
        });

        res.status(200).json({ success: true, message: 'Warranty updated.', warranty: ticket.warranty });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const submitToSales = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
        if (!ticket) {
            return res.status(404).json({ message: 'ticket not found' })
        }
        if (ticket.serviceReport?.submittedToSales) {
            return res.status(400).json({ message: 'Already submitted to sales' })
        }
        const { faultDescription, solution, spareParts, serviceCost } = req.body;

        ticket.serviceReport = {
            faultDescription,
            solution,
            spareParts,
            serviceCost,
            submittedToSales: true,
            submittedAt: new Date()
        };

        await ticket.save();

        res.json({
            success: true,
            message: "Submitted to sales",
            ticket
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
