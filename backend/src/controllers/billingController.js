import Billing from '../models/Billing.js';
import Ticket from '../models/Ticket.js';
import Customer from '../models/Customer.js';

// Generate invoice number
const generateInvoiceNumber = async () => {
    const count = await Billing.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
};

// Sales: Create billing for a ticket
export const createBilling = async (req, res) => {
    try {
        const { ticketId, items, taxRate, notes } = req.body;

        if (!ticketId || !items || !items.length) {
            return res.status(400).json({
                success: false,
                message: 'ticketId and items are required'
            });
        }

        // Verify ticket exists
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if(!ticket.customer){
            return res.status(400).json({success:false, message:'Customer not found in ticket'})
        }

        // Check if billing already exists for this ticket
        const existingBilling = await Billing.findOne({ ticket: ticketId });
        if (existingBilling) {
            return res.status(400).json({
                success: false,
                message: 'Billing already exists for this ticket'
            });
        }

        const isAmcCovered = ticket.isAmcCovered || false;

        // Calculate amounts - AMC tickets: zero labour, only spare parts
        let calculatedItems;
        if (isAmcCovered) {
            // For AMC tickets: filter out service/labour charges, keep only spare parts
            calculatedItems = items
                .filter(item => {
                    const desc = (item.description || '').toLowerCase();
                    // Only keep spare part items, exclude service/labour charges
                    const isLabour = desc.includes('service') || desc.includes('labour') || desc.includes('labor') || desc.includes('charge');
                    return !isLabour;
                })
                .map(item => ({
                    description: item.description,
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice,
                    amount: (item.quantity || 1) * item.unitPrice
                }));

            // If no spare parts, create a zero-amount AMC service entry
            if (calculatedItems.length === 0) {
                calculatedItems = [{
                    description: 'AMC Covered Service - No Charge',
                    quantity: 1,
                    unitPrice: 0,
                    amount: 0
                }];
            }
        } else {
            // Normal billing: include all items
            calculatedItems = items.map(item => ({
                description: item.description,
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice,
                amount: (item.quantity || 1) * item.unitPrice
            }));
        }

        const subtotal = calculatedItems.reduce((sum, item) => sum + item.amount, 0);

        // Apply GST only once on the subtotal (CGST 12% + SGST 12% = 24% total)
        // No tax on zero-amount AMC invoices
        const cgst = subtotal > 0 ? Math.round((subtotal * 12) / 100) : 0;
        const sgst = subtotal > 0 ? Math.round((subtotal * 12) / 100) : 0;
        const taxAmount = cgst + sgst;
        const totalAmount = subtotal + taxAmount;

        const invoiceNumber = await generateInvoiceNumber();

        const billing = await Billing.create({
            ticket: ticketId,
            customer: ticket.customer,
            createdBy: req.user?._id,
            invoiceNumber,
            items: calculatedItems,
            subtotal,
            taxRate: cgst + sgst,
            taxAmount,
            totalAmount,
            isAmcCovered,
            notes: isAmcCovered
                ? `${notes || ''} [AMC Covered - Labour charges waived]`.trim()
                : (notes || ''),
            status: 'sent'
        });
        

        res.status(201).json({
            success: true,
            message: isAmcCovered
                ? 'AMC billing created - labour charges waived, only spare parts billed'
                : 'Billing created and sent to customer',
            billing
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Customer: Get my billings
export const getMyBillings = async (req, res) => {
    try {
        const customer = await Customer.findOne({ user: req.user._id });
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer profile not found' });
        }

        const billings = await Billing.find({ customer: customer._id })
            .populate('ticket', 'ticketId status faultDescription')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, billings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get billing by ticket ID
export const getBillingByTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const billing = await Billing.findOne({ ticket: ticketId })
            .populate('ticket', 'ticketId status faultDescription')
            .populate('customer', 'name phone companyName')
            .populate('createdBy', 'name email');

        if (!billing) {
            return res.status(404).json({ success: false, message: 'No billing found for this ticket' });
        }

        res.status(200).json({ success: true, billing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Sales: Get all billings (for sales dashboard)
export const getAllBillings = async (req, res) => {
    try {
        let filter = {};

        // Sales users only see billings they created
        if (req.user.role === 'sales') {
            filter.createdBy = req.user._id;
        }

        const billings = await Billing.find(filter)
            .populate('ticket', 'ticketId status')
            .populate('customer', 'name companyName phone')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, billings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
