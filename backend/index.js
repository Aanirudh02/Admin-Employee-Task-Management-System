require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB is connected');
    require('./models/adminModel');
    require('./models/EmployeeModel');
    require('./models/taskModel');
    console.log('All  Collections are ready (admins, employees, tasks, uploads GridFS)');
  })
  .catch((err) => {
    console.log(' MongoDB  has faile due to:', err.message);
    process.exit(1);
  });

// routes
const authRoutes     = require('./routes/authRoutes');
const adminRoutes    = require('./routes/adminRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes     = require('./routes/taskRoutes');
const fileRoutes     = require('./routes/fileRoutes');   // ← GridFS file serving

app.use('/api/auth',     authRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/tasks',    taskRoutes);
app.use('/api/files',    fileRoutes);                   

app.get('/', (req, res) => res.json({ message: 'Server is running!' }));

app.use((err, req, res, next) => {
  console.error(' Error:', err.message);
  res.status(500).json({ message: 'Server error: ' + err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running → http://localhost:${PORT}`);
});