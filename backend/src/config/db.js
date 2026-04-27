import mongoose from 'mongoose'
const connectDB = async()=>{
    const connect = await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected successfully');
}
export default connectDB;