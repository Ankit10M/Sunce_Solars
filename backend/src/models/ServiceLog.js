import mongoose, { mongo } from 'mongoose'

const serviceLogSchema = new mongoose.Schema(
    {
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true
        },
        performBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: [
                'ticket_created',
                'status_changed',
                'assigned',
                'warranty_updated',
                'pickup_scheduled',
                'remark_added',
                'sla_breached',
                'closed',
            ],
            required: true,
        },
        previousStatus: { type: String },
        newStatus: { type: String },
        remarks:{
            type:String,
            trim:true
        },
        loggedAt:{
            type:Date,
            default: Date.now
        }
    },{timestamps:true}
)

serviceLogSchema.index({ticket:1, loggedAt:1})
export default mongoose.model('ServiceLog', serviceLogSchema)