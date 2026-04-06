
const express  = require('express');
const router   = express.Router();
const Task     = require('../models/taskModel');
const Employee = require('../models/EmployeeModel');
const { protect, adminOnly, employeeOnly } = require('../middleware/authMiddleware');
const { sendTaskAssignedEmail, sendTaskStatusUpdateEmail } = require('../utils/mailer');


router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, assignedTo, task_priority, time_given, estimated_hours, completion_date, dueDate } = req.body;

    if (!title || !description || !assignedTo || !time_given || !estimated_hours || !completion_date || !dueDate) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const task = new Task({
      title, description, assignedTo,
      task_priority: task_priority || 'Medium',
      time_given, estimated_hours, completion_date, dueDate,
      status: 'pending'
    });
    await task.save();

    // Email assigned employee
    try {
      const employee = await Employee.findById(assignedTo).select('name email');
      if (employee) await sendTaskAssignedEmail({ to: employee.email, employeeName: employee.name, task });
    } catch (mailErr) {
      console.warn('⚠️ Task email failed (non-fatal):', mailErr.message);
    }

    res.status(201).json({ message: 'Task assigned successfully', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/tasks — admin gets ALL tasks ─────────────────────────────────────
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'name email department');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/my-tasks', protect, employeeOnly, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PATCH /api/tasks/:id/status — employee updates status + sends email ────────
router.patch('/:id/status', protect, employeeOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'in progress', 'on-hold', 'cancelled', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found or not assigned to you' });

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Email employee confirming status update
    try {
      const employee = await Employee.findById(req.user.id).select('name email');
      if (employee) {
        await sendTaskStatusUpdateEmail({
          to: employee.email,
          employeeName: employee.name,
          task,
          oldStatus
        });
      }
    } catch (mailErr) {
      console.warn('⚠️ Status update email failed (non-fatal):', mailErr.message);
    }

    res.json({ message: 'Task status updated', task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;