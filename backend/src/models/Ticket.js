import mongoose from 'mongoose'

export const TICKET_STATUSES = [
    'ticket_created',
    'pickup_scheduled',
    'on_transit',
    'received',
    'under_diagnosis',
    'under_repair',
    'ready_to_dispatch',
    'dispatched',
    'delivered',
    'closed'
];

const warrantySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ['in_warranty', 'out_of_warranty', 'amc', 'unknown'],
            default: 'unknown'
        },
        startDate: { type: Date },
        expiryDate: { type: Date },
        hasAMC: { type: Boolean, default: false },
        amcExpiry: { type: Date },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: { type: Date },
    },
    { _id: false }
)

const slaSchema = new mongoose.Schema(
    {
        deadline: { type: Date },
        breached: { type: Boolean, default: false },
        breachedAt: { type: Date },
        closedAt: { type: Date },
    }, {
    _id: false
}
);
const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: String,
        unique: true,
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: [true, 'Customer is required']
    },
    inverter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inverter',
        required: [true, 'Inverter is required']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true,
        default: null
    },
    assignedSalesBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    faultDescription: {
        type: String,
        required: [true, 'Fault description is required'],
        trim: true,
    },
    errorCode: {
        type: String, trim: true
    },
    faultImgUrl: {
        type: String
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    priority: {
        type: String,
        enum: ['normal', 'high', 'critical'],
        default: 'normal'
    },
    status: {
        type: String,
        enum: TICKET_STATUSES,
        default: 'ticket_created',
    },
    closureReason: {
        type: String,
        trim: true
    },
    warranty: {
        type: warrantySchema,
        default: () => ({ status: 'unknown' })
    },
    isAmcCovered: {
        type: Boolean,
        default: false
    },
    requestAmc: {
        type: Boolean,
        default: false
    },
    amcPlan: {
        type: Number,
        default: 0
    },
    amcContract: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AMC',
        default: null
    },
    sla: {
        type: slaSchema,
        default: () => ({})
    },
    serviceReport: {
        faultDescription: String,
        solution: String,
        spareParts: [
            {
                name: String,
                quantity: Number,
                price: Number,
            }
        ],
        serviceCost: Number,
        submittedToSales: { type: Boolean, default: false },
        submittedAt: Date,
    }
}, { timestamps: true })

ticketSchema.index({ customer: 1, status: 1 })
ticketSchema.index({ assignedTo: 1, status: 1 })
ticketSchema.index({ assignedSalesBy: 1, status: 1 })
ticketSchema.index({ status: 1, createdAt: -1 })
ticketSchema.index({ 'sla.deadline': 1, 'sla.breached': -1 })
// ticketSchema.index({ ticketId: 1 })

export default mongoose.model('Ticket', ticketSchema)