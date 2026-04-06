const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
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
        required: true
    },
    profilePicture: {
        type: String
    },
    role: {
        type: String,
        default: 'admin' // Fixed as admin
    },
    permissions: {
        type: [String],
        enum: ['manage_tasks', 'manage_employees', 'view_reports', 'all'],
        default: ['all']
    }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);