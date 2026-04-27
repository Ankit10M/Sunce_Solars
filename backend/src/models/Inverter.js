import mongoose from 'mongoose'

const inverterSchema = new mongoose.Schema(
    {
        customer:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true
        },
        make:{
            type:String,
            required:true,
            trim:true
        },
        model:{
            type:String,
            required:true,
            trim:true
        },
        capacity:{
            type:String,
            required:true,
            trim:true
        },
        serialNumber:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            uppercase:true
        },
        installationDate:{
            type:Date,
        },
        warrantyStartDate:{
            type:Date,
        },
        warrantyEndDate:{
            type:Date,
        },
        plantLocation:{
            type:String,
            trim:true
        },
        isActive:{
            type:Boolean,
            default:true
        }
    },{timestamps:true}
)
inverterSchema.index({customer:1});
export default mongoose.model("Inverter", inverterSchema)