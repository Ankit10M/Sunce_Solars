import mongoose from 'mongoose'

const counterSchema = new mongoose.Schema({
    _id: { type: String },
    seq: { type: Number, default: 0 },
})

const Counter = mongoose.model('Counter', counterSchema)

export const generateTicketId = async () => {
    const year = new Date().getFullYear();
    const counter = await Counter.findOneAndUpdate(
        { _id: `ticket_${year}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, returnDocument: 'after' }
    )
    const padded = String(counter.seq).padStart(4, '0')
    return `TKT-${year}-${padded}`;
}

export const generateJobCardId = async () => {
    const year = new Date().getFullYear();
    const counter = await Counter.findOneAndUpdate(
        { _id: `jobcard_${year}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, returnDocument: 'after' }
    )
    const padded = String(counter.seq).padStart(4, '0');
    return `JC-${year}-${padded}`
}

export const generateAmcId = async () => {
    const year = new Date().getFullYear();
    const counter = await Counter.findOneAndUpdate(
        { _id: `amc_${year}` },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, returnDocument: 'after' }
    )
    const padded = String(counter.seq).padStart(4, '0');
    return `AMC-${year}-${padded}`
}