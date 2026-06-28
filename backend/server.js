const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables — try parent dir first (where .env lives), then local
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config(); // fallback to local .env

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not found in environment. Using default fallback. Set JWT_SECRET in .env for production.');
}

const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const messageRoutes = require('./routes/messageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const approvalRoutes = require('./routes/approvalRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: 'https://employeemanagement-1-2rnx.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/auth', authRoutes); // fallback mapping
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/approvals', approvalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/Employee';

// Database and Server Start
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB database successfully');

    const Company = require('./models/Company');
    let defaultCompany = await Company.findOne({ company_name: 'Company Inc' });
    if (!defaultCompany) {
      defaultCompany = new Company({ company_name: 'Company Inc' });
      await defaultCompany.save();
      console.log('Default Company Seeded: Company Inc');
    }

    // Seed default admin account if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('adminpassword', salt);
      const defaultAdmin = new User({
        email: 'admin@company.com',
        password: hashedPassword,
        role: 'admin',
        company_id: defaultCompany._id,
        isProfileCompleted: true,
        status: 'active',
        registered_by: 'admin'
      });
      await defaultAdmin.save();
      console.log('Default Admin Account Seeded: admin@company.com / adminpassword');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });
