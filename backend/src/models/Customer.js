import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
    {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true, default: 'India' },
        pincode: { type: String, trim: true },
        type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
        isDefault: { type: Boolean, default: false }
    },
    { _id: true }
)

const customerSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        name:{
            type:String,
            required:true,
            trim:true
        },
        companyName:{
            type:String,
            trim:true
        },
        phone:{
            type:String,
            required:true,
            trim:true
        },
        alternatePhone:{
            type:String,
            trim:true
        },
        address:{
            street: {type:String, trim:true},
            city: {type:String, trim:true},
            state: {type:String, trim:true},
            country: {type:String, trim:true, default: 'India'},
            pincode: {type:String, trim:true},
        },
        addresses: [addressSchema]
    },{timestamps:true}
)

export default mongoose.model('Customer', customerSchema)