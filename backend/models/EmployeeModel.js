// models/EmployeeModel.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name:        { type: String, required: true, trim: true },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say'],
    required: true
  },
  email:       {
     type: String, 
     required: true, 
     unique: true, 
     lowercase: true 
    },
  phonenumber: { 
    type: String,
    required: true 
},
  joiningDate: 
  {
     type: Date,
     default: Date.now

   },
  department: 
   { 
     type: String,
     required: true 
    },
  address:     
  {
     type: String,
     required: true 
    },
  password:    
  {
     type: String, required: true 
    },

  
  profilePicture:
   {
     type: String,
      default: null
     },
  aadharPhoto:    
  {
     type: String,
     required: true 
    },  
  aadharCard:     
  {
     type: String, 
     required: true 
    },  

  holidays: [
    { 
        type: Date 
    }
],
  salary:  
   {
     type: Number 
    },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);