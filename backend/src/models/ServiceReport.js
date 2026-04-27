import mongoose from 'mongoose';

const serviceReportSchema = new mongoose.Schema({
    jobCardId: String,
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    ticketStringId: String,
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    productDetails: mongoose.Schema.Types.Mixed,
    serviceReport: mongoose.Schema.Types.Mixed,
    repairDetails: mongoose.Schema.Types.Mixed,
    testingResults: mongoose.Schema.Types.Mixed,
    dispatchInfo: mongoose.Schema.Types.Mixed,
    nonRepairableReason: String,
    replacementRecommended: Boolean,
    replacementRecommendation: String,
    estimatedCost: Number,
    submittedBy: String,
    status: { type: String, default: 'pending_receipt' } // pending_receipt, receipt_created
}, { timestamps: true });

serviceReportSchema.index({ ticketId: 1 });

export default mongoose.model('ServiceReport', serviceReportSchema);
