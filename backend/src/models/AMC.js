import mongoose from 'mongoose'

const amcSchema = new mongoose.Schema(
    {
        amcId: {
            type: String,
            unique: true,
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: [true, 'Customer is required'],
        },
        inverter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inverter',
            required: [true, 'Inverter/Product is required'],
        },
        planType: {
            type: String,
            enum: ['basic', 'standard', 'premium'],
            default: 'standard',
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active',
        },
        serviceFrequency: {
            type: Number, // in days (e.g., 90 = quarterly, 180 = bi-annual)
            default: 90,
        },
        nextServiceDue: {
            type: Date,
        },
        lastServiceDate: {
            type: Date,
        },
        totalServicesCompleted: {
            type: Number,
            default: 0,
        },
        contractValue: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            trim: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
)

// Prevent duplicate active AMC for same customer-inverter pair
amcSchema.index(
    { customer: 1, inverter: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'active' },
    }
)

amcSchema.index({ status: 1, endDate: 1 })
amcSchema.index({ customer: 1 })
amcSchema.index({ nextServiceDue: 1, status: 1 })

// Pre-save: calculate nextServiceDue if not set
amcSchema.pre('save', function (next) {
    if (this.isNew && !this.nextServiceDue && this.startDate && this.serviceFrequency) {
        const nextDue = new Date(this.startDate)
        nextDue.setDate(nextDue.getDate() + this.serviceFrequency)
        this.nextServiceDue = nextDue
    }
    // Auto-expire: if endDate is past and status is still active
    if (this.status === 'active' && this.endDate && new Date(this.endDate) < new Date()) {
        this.status = 'expired'
    }
    next()
})

export default mongoose.model('AMC', amcSchema)
