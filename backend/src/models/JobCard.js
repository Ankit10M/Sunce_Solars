import mongoose from 'mongoose'

const spareUsageSchema = new mongoose.Schema(
    {
        componentName: { type: String, required: true, trim: true },
        partNumber: { type: String, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        unitCost: { type:Number, default:0},
        issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        issuedAt: { type: Date, default: Date.now },
        remarks: { type: String, trim: true },
    }, { _id: false }
)

const diagnosticSchema = new mongoose.Schema(
    {
        diagnosedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        diagnosisDate: { type: Date },
        errorCode: { type: String, trim: true },
        faultIdentified: { type: String, trim: true },
        rootCause: { type: String, trim: true },
    },
    { _id: false }
)

const testingSchema = new mongoose.Schema(
    {
        testEngineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        testDate: { type: Date },
        testResult: { type: String, enum: ['pass', 'fail', 'pending'], default: 'pending' },
        qualityCheckPassed: { type: Boolean },
        remarks: { type: String, trim: true },
    },
    { _id: false }
);

const dispatchSchema = new mongoose.Schema(
    {
        packingCompleted: { type: Boolean, default: false },
        packingMaterial: { type: String, trim: true },
        dispatchDate: { type: Date },
        courierName: { type: String, trim: true },
        trackingNumber: { type: String, trim: true },
        dispatchedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { _id: false }
);

const jobCardSchema = new mongoose.Schema(
    {
        jobCardId: {
            type: String,
            unique: true,
            required:true,
            sparse: true  // Allow null values for this unique index
        },
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true
        },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        receivedDate: { type: Date },
        unitCondition: {
            type: String,
            enum: ['good', 'damaged', 'partial', 'unknown'],
            default: 'unknown'
        },
        // e.g. ["AC cable", "DC cable", "user manual"]
        accessoriesReceived: { type: [String], default: [] },
        receivingRemarks: { type: String, trim: true },
        engineer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        repairStartDate: { type: Date },
        repairCompletionDate: { type: Date },
        diagnostic: { type: diagnosticSchema, default: () => ({}) },
        repairDecision: {
            type: String,
            enum: ['repairable', 'non_repairable', 'pending'],
            default: 'pending',
        },
        nonRepairableReason: { type: String, trim: true },
        replacementRecommended: { type: Boolean, default: false },
        customerNotifiedNonRepair: { type: Boolean, default: false },

        repairNotes: { type: String, trim: true },
        sparesUsed: [spareUsageSchema],
        testing:{ type: testingSchema, default: ()=>({})},
        dispatch: {type: dispatchSchema, default: ()=>({})},
    },{timestamps:true}
)

// Indexes for optimal querying
jobCardSchema.index({ ticket: 1})  // One job card per (ticket, engineer) combination
jobCardSchema.index({ engineer: 1 })  // Query engineer's job cards
// jobCardSchema.index({ ticket: 1 })  // Query job cards for a ticket

export default mongoose.model('JobCard', jobCardSchema)