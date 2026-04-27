import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

export const ROLES = [
    'customer',
    'sales',
    'engineer',
    'store_manager',
    'service_manager',
    'admin'
];

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: [8, 'password must atleast 8 characters'],
            select: false
        },
        role: {
            type: String,
            enum: ROLES,
            default: 'customer'
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date
        },
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false }
    }, { timestamps: true }
)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);
