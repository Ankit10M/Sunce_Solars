import AMC from '../models/AMC.js'
import Customer from '../models/Customer.js'
import Inverter from '../models/Inverter.js'
import Ticket from '../models/Ticket.js'
import ServiceLog from '../models/ServiceLog.js'
import { generateAmcId, generateTicketId } from '../utils/generateTicketId.js'
import { getNextSalesPerson } from '../utils/roundRobinAssignment.js'

// Create a new AMC contract
export const createAMC = async (req, res) => {
    try {
        const { customerId, inverterId, planType, startDate, endDate, serviceFrequency, contractValue, notes } = req.body

        if (!customerId || !inverterId || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'customerId, inverterId, startDate and endDate are required',
            })
        }

        // Validate customer
        const customer = await Customer.findById(customerId)
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' })
        }

        // Validate inverter belongs to customer
        const inverter = await Inverter.findById(inverterId)
        if (!inverter) {
            return res.status(404).json({ success: false, message: 'Inverter not found' })
        }
        if (inverter.customer.toString() !== customerId) {
            return res.status(400).json({ success: false, message: 'Inverter does not belong to this customer' })
        }

        // Check for existing active AMC
        const existingActive = await AMC.findOne({
            customer: customerId,
            inverter: inverterId,
            status: 'active',
        })
        if (existingActive) {
            return res.status(400).json({
                success: false,
                message: `An active AMC contract (${existingActive.amcId}) already exists for this customer-product combination. Please expire or cancel it first.`,
            })
        }

        // Validate dates
        const start = new Date(startDate)
        const end = new Date(endDate)
        if (end <= start) {
            return res.status(400).json({ success: false, message: 'End date must be after start date' })
        }

        const amcId = await generateAmcId()

        const amc = await AMC.create({
            amcId,
            customer: customerId,
            inverter: inverterId,
            planType: planType || 'standard',
            startDate: start,
            endDate: end,
            serviceFrequency: serviceFrequency || 90,
            contractValue: contractValue || 0,
            notes: notes || '',
            createdBy: req.user._id,
        })

        const populated = await AMC.findById(amc._id)
            .populate('customer', 'name companyName phone')
            .populate('inverter', 'make model serialNumber capacity')
            .populate('createdBy', 'name email')

        res.status(201).json({
            success: true,
            message: 'AMC contract created successfully',
            amc: populated,
        })
    } catch (error) {
        // Handle duplicate key error from compound unique index
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'An active AMC contract already exists for this customer-product combination.',
            })
        }
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get all AMC contracts with filters
export const getAllAMCs = async (req, res) => {
    try {
        const { status, customerId, page = 1, limit = 50 } = req.query
        let filter = {}

        if (status) filter.status = status
        if (customerId) filter.customer = customerId

        // Auto-expire contracts that have passed their end date
        await AMC.updateMany(
            { status: 'active', endDate: { $lt: new Date() } },
            { $set: { status: 'expired' } }
        )

        const skip = (Number(page) - 1) * Number(limit)
        const total = await AMC.countDocuments(filter)
        const amcs = await AMC.find(filter)
            .populate('customer', 'name companyName phone')
            .populate('inverter', 'make model serialNumber capacity')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))

        res.status(200).json({
            success: true,
            count: amcs.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            amcs,
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get single AMC by ID
export const getAMC = async (req, res) => {
    try {
        const amc = await AMC.findById(req.params.id)
            .populate('customer', 'name companyName phone address')
            .populate('inverter', 'make model serialNumber capacity plantLocation')
            .populate('createdBy', 'name email')

        if (!amc) {
            return res.status(404).json({ success: false, message: 'AMC contract not found' })
        }

        res.status(200).json({ success: true, amc })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Update AMC contract
export const updateAMC = async (req, res) => {
    try {
        const { planType, endDate, serviceFrequency, contractValue, notes, status } = req.body

        const amc = await AMC.findById(req.params.id)
        if (!amc) {
            return res.status(404).json({ success: false, message: 'AMC contract not found' })
        }

        if (planType) amc.planType = planType
        if (endDate) amc.endDate = new Date(endDate)
        if (serviceFrequency) amc.serviceFrequency = serviceFrequency
        if (contractValue !== undefined) amc.contractValue = contractValue
        if (notes !== undefined) amc.notes = notes
        if (status && ['active', 'expired', 'cancelled'].includes(status)) {
            amc.status = status
        }

        await amc.save()

        const populated = await AMC.findById(amc._id)
            .populate('customer', 'name companyName phone')
            .populate('inverter', 'make model serialNumber capacity')
            .populate('createdBy', 'name email')

        res.status(200).json({
            success: true,
            message: 'AMC contract updated',
            amc: populated,
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get AMC contracts expiring within 30 days (renewal tracking)
export const getExpiringAMCs = async (req, res) => {
    try {
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        // Auto-expire past-due contracts first
        await AMC.updateMany(
            { status: 'active', endDate: { $lt: now } },
            { $set: { status: 'expired' } }
        )

        const expiringContracts = await AMC.find({
            status: 'active',
            endDate: { $gte: now, $lte: thirtyDaysFromNow },
        })
            .populate('customer', 'name companyName phone')
            .populate('inverter', 'make model serialNumber capacity')
            .sort({ endDate: 1 })

        res.status(200).json({
            success: true,
            count: expiringContracts.length,
            amcs: expiringContracts,
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Check if a customer-inverter pair has active AMC
export const checkAMCStatus = async (req, res) => {
    try {
        const { customerId, inverterId } = req.query

        if (!customerId || !inverterId) {
            return res.status(400).json({
                success: false,
                message: 'customerId and inverterId are required',
            })
        }

        const now = new Date()
        const activeAmc = await AMC.findOne({
            customer: customerId,
            inverter: inverterId,
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        })
            .populate('customer', 'name companyName')
            .populate('inverter', 'make model serialNumber')

        res.status(200).json({
            success: true,
            hasActiveAMC: !!activeAmc,
            amc: activeAmc || null,
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Generate preventive maintenance tickets for AMC customers
export const generatePreventiveTickets = async (req, res) => {
    try {
        const now = new Date()

        // Find active AMCs where nextServiceDue is today or past
        const dueContracts = await AMC.find({
            status: 'active',
            nextServiceDue: { $lte: now },
            endDate: { $gte: now },
        })
            .populate('customer', 'name')
            .populate('inverter', 'make model serialNumber')

        if (dueContracts.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No preventive maintenance tickets to generate',
                ticketsCreated: 0,
            })
        }

        const createdTickets = []

        for (const amc of dueContracts) {
            // Check if a preventive ticket already exists for this period
            const existingTicket = await Ticket.findOne({
                customer: amc.customer._id,
                inverter: amc.inverter._id,
                faultDescription: { $regex: /preventive maintenance/i },
                status: { $ne: 'closed' },
            })

            if (existingTicket) continue // Skip if open preventive ticket exists

            const ticketId = await generateTicketId()
            const assignedSalesPerson = await getNextSalesPerson()

            const ticket = await Ticket.create({
                ticketId,
                customer: amc.customer._id,
                inverter: amc.inverter._id,
                createdBy: req.user._id,
                assignedSalesBy: assignedSalesPerson._id,
                faultDescription: `[Preventive Maintenance] Scheduled AMC service for ${amc.inverter.make} ${amc.inverter.model} (S/N: ${amc.inverter.serialNumber}). AMC Contract: ${amc.amcId}`,
                urgency: 'low',
                priority: 'normal',
                status: 'ticket_created',
                isAmcCovered: true,
                amcContract: amc._id,
                warranty: { status: 'amc', hasAMC: true, amcExpiry: amc.endDate },
                sla: { deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }, // 7-day SLA for preventive
            })

            await ServiceLog.create({
                ticket: ticket._id,
                performBy: req.user._id,
                action: 'ticket_created',
                newStatus: 'ticket_created',
                remarks: `Preventive maintenance ticket auto-generated from AMC ${amc.amcId}`,
            })

            // Update AMC: advance nextServiceDue and record service
            amc.lastServiceDate = now
            amc.totalServicesCompleted += 1
            const nextDue = new Date(now)
            nextDue.setDate(nextDue.getDate() + amc.serviceFrequency)
            // Don't set nextServiceDue beyond contract end
            amc.nextServiceDue = nextDue <= amc.endDate ? nextDue : null
            await amc.save()

            createdTickets.push({
                ticketId: ticket.ticketId,
                customer: amc.customer.name,
                inverter: `${amc.inverter.make} ${amc.inverter.model}`,
                amcId: amc.amcId,
            })
        }

        res.status(201).json({
            success: true,
            message: `${createdTickets.length} preventive maintenance ticket(s) generated`,
            ticketsCreated: createdTickets.length,
            tickets: createdTickets,
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// Get AMC dashboard stats (for admin/sales)
export const getAMCStats = async (req, res) => {
    try {
        const now = new Date()
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

        // Auto-expire
        await AMC.updateMany(
            { status: 'active', endDate: { $lt: now } },
            { $set: { status: 'expired' } }
        )

        const totalActive = await AMC.countDocuments({ status: 'active' })
        const totalExpired = await AMC.countDocuments({ status: 'expired' })
        const expiringSoon = await AMC.countDocuments({
            status: 'active',
            endDate: { $gte: now, $lte: thirtyDaysFromNow },
        })

        const totalContractValue = await AMC.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$contractValue' } } },
        ])

        const dueForService = await AMC.countDocuments({
            status: 'active',
            nextServiceDue: { $lte: now },
            endDate: { $gte: now },
        })

        res.status(200).json({
            success: true,
            stats: {
                totalActive,
                totalExpired,
                expiringSoon,
                dueForService,
                totalContractValue: totalContractValue[0]?.total || 0,
            },
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
