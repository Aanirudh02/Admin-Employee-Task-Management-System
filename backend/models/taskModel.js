const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'in progress', 'on-hold', 'cancelled', 'completed'],
        default: 'pending'
    },
    assigned_date: {
        type: Date,
        default: Date.now
    },
    task_priority: {
        type: String,
        enum: ['Minor', 'Major', 'Critical', 'Medium'],
        default: 'Medium'
    },
    time_given: {
        type: Number,
        required: true
    },
    estimated_hours: {
        type: Number,
        required: true
    },
    completion_date: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    feedback: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);  // ← was missing!