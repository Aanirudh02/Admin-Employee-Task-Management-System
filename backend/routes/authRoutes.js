
const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const multer   = require('multer');
const path     = require('path');

const Employee = require('../models/EmployeeModel');
const Admin    = require('../models/adminModel');
const { uploadToGridFS } = require('../utils/gridfs');


const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, png, webp)'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});


router.post(
  '/register',
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'aadharPhoto',    maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        name, email, password, confirmPassword,
        gender, phonenumber, department, address, aadharCard
      } = req.body;

      if (!name || !email || !password || !confirmPassword || !gender || !phonenumber || !department || !address || !aadharCard) {
        return res.status(400).json({ message: 'All fields are required' });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      if (!req.files || !req.files['aadharPhoto']) {
        return res.status(400).json({ message: 'Aadhar card photo is required' });
      }

      const existing = await Employee.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const count = await Employee.countDocuments();
      const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

 
      let profilePictureId = null;
      if (req.files['profilePicture']) {
        const f = req.files['profilePicture'][0];
        profilePictureId = await uploadToGridFS(
          f.buffer, f.originalname, f.mimetype,
          { employeeId, fieldName: 'profilePicture' }
        );
      }

      const aadharFile = req.files['aadharPhoto'][0];
      const aadharPhotoId = await uploadToGridFS(
        aadharFile.buffer, aadharFile.originalname, aadharFile.mimetype,
        { employeeId, fieldName: 'aadharPhoto' }
      );

      const employee = new Employee({
        employeeId,
        name,
        email,
        password: hashedPassword,
        gender,
        phonenumber,
        department,
        address,
        aadharCard,
        profilePicture: profilePictureId ? profilePictureId.toString() : null,
        aadharPhoto: aadharPhotoId.toString(),
        status: 'pending',
        role: 'employee'
      });

      await employee.save();

      res.status(201).json({
        message: '✅ Registered! Please wait for admin approval before logging in.'
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message || 'Server error' });
    }
  }
);


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await Admin.findOne({ email });
    let role = 'admin';

    if (!user) {
      user = await Employee.findOne({ email });
      role = 'employee';
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email' });
    }

    if (role === 'employee') {
      if (user.status === 'pending')  return res.status(403).json({ message: '⏳ Your account is pending admin approval' });
      if (user.status === 'rejected') return res.status(403).json({ message: '❌ Your account has been rejected by admin' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: user._id, role, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token, role,
      name: user.name,
      email: user.email,
      id: user._id,
      // Return GridFS file URL so frontend can display avatar
      profilePicture: user.profilePicture
        ? `/api/files/${user.profilePicture}`
        : null
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;