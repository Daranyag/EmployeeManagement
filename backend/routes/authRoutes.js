const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const Company = require('../models/Company');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
// Signup Route (POST /api/signup)
// ─────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, company_name } = req.body;

    if (!name || !email || !password || !role || !company_name) {
      return res.status(400).json({ message: 'All fields are required (name, email, password, role, company_name)' });
    }

    if (!['admin', 'employee'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Lookup company
    let companyDoc = await Company.findOne({
      company_name: { $regex: new RegExp(`^${company_name.trim()}$`, 'i') }
    });

    if (role === 'admin') {
      // ONLY ADMIN can create a company during account creation
      if (!companyDoc) {
        companyDoc = new Company({ company_name: company_name.trim() });
        await companyDoc.save();
      }
    } else {
      // Employees must ONLY register/belong to an existing company
      if (!companyDoc) {
        return res.status(400).json({ message: 'Company not found. Please contact your administrator.' });
      }
    }

    // STRICT EMAIL LOCK POLICY CHECK
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists and cannot be reused.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ── ADMIN SIGNUP ──────────────────────────────────────────
    if (role === 'admin') {
      const newUser = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        company_id: companyDoc._id,
        isProfileCompleted: true,
        status: 'active',
        registered_by: 'self'
      });
      const savedUser = await newUser.save();

      // AUTO LOGIN for Admin
      const token = jwt.sign(
        { userId: savedUser._id, role: savedUser.role, email: savedUser.email, companyId: savedUser.company_id },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.status(201).json({
        message: 'Admin account created successfully',
        token,
        user: {
          id: savedUser._id,
          email: savedUser.email,
          role: savedUser.role,
          company_id: savedUser.company_id,
          company_name: companyDoc.company_name,
          isProfileCompleted: savedUser.isProfileCompleted,
          status: savedUser.status
        },
        employee: null
      });
    }

    // ── EMPLOYEE SELF-SIGNUP → PENDING APPROVAL ───────────────
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'employee',
      company_id: companyDoc._id,
      isProfileCompleted: false,
      status: 'pending',          // ← awaiting admin approval
      registered_by: 'self'       // ← track it was self-registered
    });
    const savedUser = await newUser.save();

    // Create a pending employee record
    const count = await Employee.countDocuments();
    const employee_id = `EMP${1000 + count + 1}`;

    const newEmployee = new Employee({
      employee_id,
      user_id: savedUser._id,
      name,
      phone: 'N/A',
      address: 'N/A',
      department: 'General',
      designation: 'Employee',
      salary: 0,
      joining_date: new Date(),
      company_id: companyDoc._id,
      status: 'pending'           // ← pending until admin approves
    });
    await newEmployee.save();

    // NO JWT TOKEN — employee must wait for approval before logging in
    return res.status(201).json({
      message: 'Registration submitted successfully. Awaiting admin approval.',
      pending: true,
      user: {
        email: savedUser.email,
        role: savedUser.role,
        company_name: companyDoc.company_name,
        status: savedUser.status
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// Login Route (POST /api/login)
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, company_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields (email, password)' });
    }

    let companyDoc = null;
    let user = null;

    if (company_name) {
      // 1. Check if company exists
      companyDoc = await Company.findOne({
        company_name: { $regex: new RegExp(`^${company_name.trim()}$`, 'i') }
      });
      if (!companyDoc) {
        return res.status(400).json({ message: 'Company not found. Please contact your administrator.' });
      }
      // 2. Find user matching email AND company_id
      user = await User.findOne({ email: email.toLowerCase(), company_id: companyDoc._id });
    } else {
      // Find user globally by email first
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        companyDoc = await Company.findById(user.company_id);
      }
    }

    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Removed pending block to allow pending users to login and see the pending screen

    if (user.status === 'rejected') {
      return res.status(403).json({
        message: 'Your registration request has been declined by the administrator. Please contact your admin.',
        status: 'rejected'
      });
    }

    if (user.status === 'deleted') {
      return res.status(403).json({ message: 'Account is inactive or deleted' });
    }

    // 4. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Sign JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, companyId: user.company_id },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Get associated employee info if role is employee
    let employeeData = null;
    if (user.role === 'employee') {
      employeeData = await Employee.findOne({ user_id: user._id, status: 'active' });
    }

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        company_name: companyDoc.company_name,
        isProfileCompleted: user.isProfileCompleted,
        status: user.status,
        createdAt: user.createdAt
      },
      employee: employeeData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// Profile Route (GET /api/profile)
// ─────────────────────────────────────────────────────────────
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company_id');
    let employeeData = null;
    if (user.role === 'employee') {
      employeeData = await Employee.findOne({ user_id: user._id, status: 'active' });
    }
    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        company_id: user.company_id?._id,
        company_name: user.company_id?.company_name || 'N/A',
        isProfileCompleted: user.isProfileCompleted,
        status: user.status,
        createdAt: user.createdAt
      },
      employee: employeeData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// Get Current User Route (GET /api/me)
// ─────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('company_id');
    let employeeData = null;
    if (user.role === 'employee') {
      employeeData = await Employee.findOne({ user_id: user._id, status: 'active' });
    }
    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        company_id: user.company_id?._id,
        company_name: user.company_id?.company_name || 'N/A',
        isProfileCompleted: user.isProfileCompleted,
        status: user.status,
        createdAt: user.createdAt
      },
      employee: employeeData
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// Change Password Route (POST /api/change-password)
// ─────────────────────────────────────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New password and confirm password do not match' });
    }

    // Verify email matches the logged in user
    if (email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({ message: 'Email does not match registered account email' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// Forgot Password Route (POST /api/forgot-password)
// ─────────────────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords must match.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
