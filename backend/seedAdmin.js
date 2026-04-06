//to create admin credentials in database

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const Admin = require('./models/adminModel');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Check if admin already exists
  const existing = await Admin.findOne({ email: 'admin@company.com' });
  if (existing) {
    console.log('Admin already exists! Email: admin@company.com');
    process.exit();
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = new Admin({
    adminId: 'ADMIN001',
    name: 'Super Admin',
    email: 'admin@company.com',
    password: hashedPassword,
    role: 'admin',
    permissions: ['all']
  });

  await admin.save();
  console.log(' Admin is created!');
  console.log('   Email:    admin@company.com');
  console.log('   Password: admin123');
  console.log('   (Change this password in production!)');
  process.exit();
}

seedAdmin().catch(console.error);