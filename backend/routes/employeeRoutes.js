const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

// Create Employee (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      phone,
      address,
      department,
      designation,
      salary,
      joining_date,
      profile_photo,
      emergency_contact
    } = req.body;

    if (!email || !password || !name || !phone || !address || !department || !designation || !salary || !joining_date) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }

    // STRICT EMAIL LOCK POLICY CHECK
    // Find in Users table regardless of status (active or deleted)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists and cannot be reused.' });
    }

    // Generate unique employee ID
    const count = await Employee.countDocuments();
    const employee_id = `EMP${1000 + count + 1}`;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User (assign Admin's company)
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'employee',
      company_id: req.user.company_id, // Scoped to Admin's company
      isProfileCompleted: false, // Force profile setup on first login
      status: 'active'
    });
    const savedUser = await newUser.save();

    // Create Employee details
    const newEmployee = new Employee({
      employee_id,
      user_id: savedUser._id,
      name,
      phone,
      address,
      department,
      designation,
      salary: Number(salary),
      joining_date: new Date(joining_date),
      profile_photo: profile_photo || '',
      emergency_contact: emergency_contact || '',
      company_id: req.user.company_id, // Scoped to Admin's company
      status: 'active'
    });
    const savedEmployee = await newEmployee.save();

    res.status(201).json({
      message: 'Employee account created successfully',
      employee: savedEmployee,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role,
        company_id: savedUser.company_id
      }
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View all Employees (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { search } = req.query;
    // Multi-tenant check: Scope to Admin's company
    let query = { status: 'active', company_id: req.user.company_id };

    if (search) {
      query.$and = [
        { status: 'active' },
        { company_id: req.user.company_id },
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { employee_id: { $regex: search, $options: 'i' } },
            { department: { $regex: search, $options: 'i' } }
          ]
        }
      ];
    }

    const employees = await Employee.find(query).populate('user_id', 'email status');
    res.json(employees);
  } catch (error) {
    console.error('Fetch employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View single Employee details (Admin or Employee owner)
router.get('/:id', authenticate, async (req, res) => {
  try {
    const employee = await Employee.findOne({ employee_id: req.params.id, status: 'active' }).populate('user_id', 'email');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Role verification (Employee can only view their own)
    if (req.user.role === 'employee' && employee.user_id._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: Cannot view other employee details' });
    }

    // Company verification (Admin can only view within their company)
    if (req.user.role === 'admin' && employee.company_id.toString() !== req.user.company_id.toString()) {
      return res.status(403).json({ message: 'Access denied: Cannot access employee from another company' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Fetch employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update employee details (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, phone, address, department, designation, salary, joining_date, profile_photo, emergency_contact } = req.body;
    
    const employee = await Employee.findOne({ employee_id: req.params.id, status: 'active' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Scoped control check
    if (employee.company_id.toString() !== req.user.company_id.toString()) {
      return res.status(403).json({ message: 'Access denied: Cannot modify employee from another company' });
    }

    if (name) employee.name = name;
    if (phone) employee.phone = phone;
    if (address) employee.address = address;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (salary) employee.salary = Number(salary);
    if (joining_date) employee.joining_date = new Date(joining_date);
    if (profile_photo !== undefined) employee.profile_photo = profile_photo;
    if (emergency_contact !== undefined) employee.emergency_contact = emergency_contact;

    const updatedEmployee = await employee.save();
    res.json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update own profile (Employee only - limited fields)
router.put('/profile/me', authenticate, authorize('employee'), async (req, res) => {
  try {
    // BACKEND ENFORCEMENT: Strictly check for forbidden fields
    const forbiddenFields = ['salary', 'department', 'designation', 'role', 'employee_id', 'user_id', 'joining_date', 'company', 'company_id', 'status', 'employment_status'];
    const requestKeys = Object.keys(req.body);
    const containsForbidden = requestKeys.some(key => forbiddenFields.includes(key));
    if (containsForbidden) {
      return res.status(400).json({ message: 'Access denied: Employees cannot modify salary, department, designation, role, employee ID, company, or status fields.' });
    }

    const { phone, address, emergency_contact, profile_photo } = req.body;

    const employee = await Employee.findOne({ user_id: req.user._id, status: 'active' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee record not found' });
    }

    if (phone) employee.phone = phone;
    if (address) employee.address = address;
    if (emergency_contact) employee.emergency_contact = emergency_contact;
    if (profile_photo !== undefined) employee.profile_photo = profile_photo;

    const updatedEmployee = await employee.save();

    // Mark profile completion flag as true in DB once all required fields are set
    if (phone && phone !== 'N/A' && address && address !== 'N/A' && emergency_contact) {
      req.user.isProfileCompleted = true;
      await req.user.save();
    }

    res.json({
      message: 'Profile updated successfully',
      employee: updatedEmployee,
      user: {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        company: req.user.company,
        isProfileCompleted: req.user.isProfileCompleted
      }
    });
  } catch (error) {
    console.error('Self profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Employee (Admin only - soft delete User and Employee, but User email remains in system to lock it)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const employee = await Employee.findOne({ employee_id: req.params.id, status: 'active' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Scoped control check
    if (employee.company_id.toString() !== req.user.company_id.toString()) {
      return res.status(403).json({ message: 'Access denied: Cannot delete employee from another company' });
    }

    // Soft delete employee record
    employee.status = 'deleted';
    await employee.save();

    // Soft delete corresponding user (this prevents logins but keeps email in system permanently locked)
    const user = await User.findById(employee.user_id);
    if (user) {
      user.status = 'deleted';
      await user.save();
    }

    res.json({ message: 'Employee deleted successfully. Email remains locked.' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
