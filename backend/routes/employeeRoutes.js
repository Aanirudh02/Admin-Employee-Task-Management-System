
const express  = require('express');
const router   = express.Router();
const Employee = require('../models/EmployeeModel');
const { protect, employeeOnly } = require('../middleware/authMiddleware');

router.get('/profile', protect, employeeOnly, async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id).select('-password');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.patch('/profile', protect, employeeOnly, async (req, res) => {
  try {
    const { phonenumber, address, department } = req.body;

  
    const updateData = {};
    if (phonenumber !== undefined) updateData.phonenumber = phonenumber.trim();
    if (address     !== undefined) updateData.address     = address.trim();
    if (department  !== undefined) updateData.department  = department.trim();

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const employee = await Employee.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    res.json({ message: 'Profile updated successfully', employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

module.exports = router;