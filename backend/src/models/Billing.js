import mongoose from 'mongoose'

const billingItemSchema = new mongoose.Schema(
    {
        description: { type: String, required: true, trim: true },
        quantity: { type: Number, default: 1 },
        unitPrice: { type: Number, required: true },
        amount: { type: Number, required: true },
    },
    { _id: false }
)

const billingSchema = new mongoose.Schema(
    {
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        invoiceNumber: {
            type: String,
            unique: true,
            required: true,
        },
        items: [billingItemSchema],
        subtotal: { type: Number, required: true },
        taxRate: { type: Number, default: 18 }, // GST percentage
        taxAmount: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        notes: { type: String, trim: true },
        isAmcCovered: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ['draft', 'sent', 'paid', 'cancelled'],
            default: 'sent',
        },
    },
    { timestamps: true }
)

billingSchema.index({ ticket: 1 })
billingSchema.index({ customer: 1 })

export default mongoose.model('Billing', billingSchema)
