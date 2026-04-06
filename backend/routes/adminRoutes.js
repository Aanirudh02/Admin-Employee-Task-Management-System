
const express  = require('express');
const router   = express.Router();
const Employee = require('../models/EmployeeModel');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/mailer');


router.get('/employees', protect, adminOnly, async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    const mapped = employees.map(e => {
      const obj = e.toObject();
      if (obj.profilePicture) obj.profilePictureUrl = `/api/files/${obj.profilePicture}`;
      if (obj.aadharPhoto)    obj.aadharPhotoUrl    = `/api/files/${obj.aadharPhoto}`;
      return obj;
    });
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.patch('/employees/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, salary } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be "approved" or "rejected"' });
    }

    const updateData = { status };
    if (status === 'approved' && salary) updateData.salary = Number(salary);

    const employee = await Employee.findByIdAndUpdate(
      req.params.id, updateData, { new: true }
    ).select('-password');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Send email (non-blocking)
    try {
      if (status === 'approved') {
        await sendApprovalEmail({ to: employee.email, name: employee.name, salary: updateData.salary || null });
      } else {
        await sendRejectionEmail({ to: employee.email, name: employee.name });
      }
    } catch (mailErr) {
      console.warn('⚠️ Email failed (non-fatal):', mailErr.message);
    }

    res.json({ message: `Employee ${status} successfully`, employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.patch('/employees/:id/details', protect, adminOnly, async (req, res) => {
  try {
    const { salary, holidays } = req.body;
    const updateData = {};
    if (salary   !== undefined) updateData.salary   = Number(salary);
    if (holidays !== undefined) updateData.holidays = holidays;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id, updateData, { new: true }
    ).select('-password');

    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee details updated', employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/employees/approved', protect, adminOnly, async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'approved' }).select('-password');
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.delete('/employees/:id', protect, adminOnly, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;