import JobCard from '../models/JobCard.js';
import Ticket from '../models/Ticket.js';
import ServiceLog from '../models/ServiceLog.js';
import { generateJobCardId } from '../utils/generateTicketId.js';

export const createJobCard = async (req, res) => {
    try {
        const { ticketId, engineerId, unitCondition, accessoriesReceived, receivingRemarks } = req.body;
        
        if (!ticketId) {
            return res.status(400).json({ success: false, message: 'Ticket ID is required' })
        }

        if (!engineerId) {
            return res.status(400).json({ success: false, message: 'Engineer ID is required' })
        }
        
        // Validate ticket exists
        const ticket = await Ticket.findById(ticketId)
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' })
        }
        
        // Check if job card already exists for THIS TICKET AND ENGINEER
        // Each engineer can only have ONE job card per ticket, but a ticket can have multiple job cards (one per engineer)
        const existingJobCard = await JobCard.findOne({ ticket: ticketId });
        if (existingJobCard) {
            return res.status(400).json({ 
                success: false, 
                message: `Job card already exists for this ticket and engineer: ${existingJobCard.jobCardId}`, 
                jobCard: existingJobCard 
            })
        }
        
        // Generate unique job card ID
        const jobCardId = await generateJobCardId()
        
        // Create job card for this specific ticket and engineer
        const jobCard = await JobCard.create({
            jobCardId,
            ticket: ticketId,  // Multiple engineers can work on same ticket
            engineer: engineerId,  // Each engineer gets their own jobcard per ticket
            receivedBy: req.user._id,
            receivedDate: new Date(),
            unitCondition: unitCondition || 'unknown',
            accessoriesReceived: accessoriesReceived || [],
            receivingRemarks,
        });
        
        // Update the ticket status to received if it hasn't progressed past it
        if (ticket.status === 'on_transit' || ticket.status === 'pickup_scheduled' || ticket.status === 'ticket_created') {
            ticket.status = 'received';
            await ticket.save();
        }

        // Log the action
        await ServiceLog.create({
            ticket: ticket._id,
            performBy: req.user._id,
            action: 'status_changed',
            newStatus: 'received',
            remarks: `Job card ${jobCardId} created for engineer. Unit condition: ${unitCondition}.`,
        });
        
        res.status(201).json({ success: true, message: 'Job card created successfully!', jobCard });
    } catch (error) {
        console.error('Job card creation error:', error);
        
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                success: false, 
                message: `A job card already exists for this combination. Please try again or refresh the page.`
            });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: error.message 
            });
        }
        
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getJobCard = async (req, res) => {
    try {
        const jobCard = await JobCard.findOne({
            $or: [{ _id: req.params.id }, { jobCardId: req.params.id }],
        })
            .populate('ticket', 'ticketId status urgency priority')
            .populate('receivedBy', 'name')
            .populate('engineer', 'name')
            .populate('diagnostic.diagnosedBy', 'name')
            .populate('testing.testEngineer', 'name')
            .populate('dispatch.dispatchedBy', 'name')
            .populate('sparesUsed.issuedBy', 'name');
        if (!jobCard) {
            return res.status(404).json({ message: 'job card not found', success: false })
        }
        res.status(200).json({ success: true, jobCard })
    } catch (error) {
        res.status(500).json({ message: error.message, success: false })
    }
}

export const getAllJobCards = async (req, res) => {
    try {
        const filter = {};

        if (req.user.role === 'engineer') {
            filter.engineer = req.user._id;
        }

        const jobCards = await JobCard.find(filter)
            .populate('ticket', 'ticketId status priority customer')
            .populate('engineer', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: jobCards.length, jobCards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDiagnosis = async (req, res) => {
    try {
        const { errorCode, faultIdentified, rootCause } = req.body;

        const jobCard = await JobCard.findById(req.params.id);
        if (!jobCard) {
            return res.status(404).json({ success: false, message: 'Job card not found.' });
        }

        jobCard.diagnostic = {
            diagnosedBy: req.user._id,
            diagnosisDate: new Date(),
            errorCode,
            faultIdentified,
            rootCause,
        };

        await jobCard.save();

        res.status(200).json({ success: true, message: 'Diagnosis updated.', diagnostic: jobCard.diagnostic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateRepairDecision = async (req, res) => {
    try {
        const { repairDecision, nonRepairableReason, replacementRecommended, repairNotes } = req.body
        if (!['repairable', 'non_repairable', 'pending'].includes(repairDecision)) {
            return res.status(400).json({ success: false, message: 'repairDecision must be repairable, non_repairable or pending' })
        }
        const jobCard = await JobCard.findById(req.params.id)
        if (!jobCard) {
            return res.status(404).json({ success: false, message: 'Job card not found.' });
        }
        jobCard.repairDecision = repairDecision;
        jobCard.nonRepairableReason = nonRepairableReason || '';
        jobCard.replacementRecommended = replacementRecommended || false;
        jobCard.repairNotes = repairNotes || '';

        if (repairDecision === 'repairable') {
            jobCard.repairStartDate = new Date();
        }

        await jobCard.save();

        res.status(200).json({ success: true, message: 'Repair decision saved.', jobCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

export const addSpare = async (req, res) => {
    try {
        const { componentName, partNumber, quantity, remarks, unitCost } = req.body;

        if (!componentName || !quantity) {
            return res.status(400).json({ success: false, message: 'componentName and quantity are required.' });
        }
        const jobCard = await JobCard.findById(req.params.id);
        if (!jobCard) {
            return res.status(404).json({ success: false, message: 'Job card not found.' });
        }

        jobCard.sparesUsed.push({
            componentName,
            partNumber,
            quantity,
            issuedBy: req.user._id,
            issuedAt: new Date(),
            unitCost,
            remarks,
        });
        await jobCard.save();

        res.status(200).json({ success: true, message: 'Spare part added.', sparesUsed: jobCard.sparesUsed });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTesting = async (req, res) => {
    try {
        const { testResult, qualityCheckPassed, remarks } = req.body;

        const jobCard = await JobCard.findById(req.params.id);
        if (!jobCard) {
            return res.status(404).json({ success: false, message: 'Job card not found.' });
        }

        jobCard.testing = {
            testEngineer: req.user._id,
            testDate: new Date(),
            testResult: testResult || 'pending',
            qualityCheckPassed: qualityCheckPassed || false,
            remarks,
        };

        // If test passed and QC passed, mark repair completion date
        if (testResult === 'pass' && qualityCheckPassed) {
            jobCard.repairCompletionDate = new Date();
        }

        await jobCard.save();

        res.status(200).json({ success: true, message: 'Testing updated.', jobCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDispatch = async (req, res) => {
    try {
        const { packingCompleted, packingMaterial, dispatchDate, courierName, trackingNumber } = req.body
        const jobCard = await JobCard.findById(req.params.id)
        if (!jobCard) {
            return res.status(404).json({ message: 'Job card not found', success: false })
        }
        jobCard.dispatch = {
            packingCompleted: packingCompleted || true,
            packingMaterial,
            dispatchDate: dispatchDate ? new Date(dispatchDate) : new Date(),
            courierName,
            trackingNumber,
            dispatchedBy: req.user._id
        }
        await jobCard.save()
        res.status(200).json({ success: true, message: 'dispatch details saved', jobCard })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}