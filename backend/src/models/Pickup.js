import mongoose from 'mongoose'

const pickupSchema = new mongoose.Schema(
    {
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ticket',
            required: true,
            unique: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        pickupAddress: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
        },
        contactPerson: { type: String, trim: true },
        contactPhone: { type: String, trim: true },

        scheduledDate: {
            type: Date,
            required: [true, 'Pickup scheduled date is required'],
        },
        transportMode: {
            type: String,
            enum: ['courier', 'logistics', 'self_dropoff', 'company_vehicle'],
            default: 'courier'
        },
        courierName: { type: String, trim: true },
        lrNumber: { type: String, trim: true },
        receivedDate: { type: Date },
        receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remarks: { type: String, trim: true },
    },{timestamps:true}
)
pickupSchema.index({ticket:1})
export default mongoose.model("Pickup", pickupSchema)