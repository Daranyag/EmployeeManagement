const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const Complaint = require('../models/Complaint');
const { authenticate, authorize } = require('../middleware/auth');

// Get Dashboard Stats (Admin only)
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const emps = await Employee.find({ company_id: req.user.company_id, status: 'active' });
    const empIds = emps.map(e => e.employee_id);

    const totalEmployees = emps.length;
    const activeEmployees = emps.filter(e => e.status === 'active').length;
    const pendingLeaves = await Leave.countDocuments({ employee_id: { $in: empIds }, company_id: req.user.company_id, status: 'Pending' });
    const openComplaints = await Complaint.countDocuments({ employee_id: { $in: empIds }, company_id: req.user.company_id, status: 'Open' });

    // Count pending registration requests (self-registered employees awaiting approval)
    const pendingApprovals = await User.countDocuments({
      company_id: req.user.company_id,
      role: 'employee',
      registered_by: 'self',
      status: 'pending'
    });

    res.json({
      totalEmployees,
      activeEmployees,
      pendingLeaves,
      openComplaints,
      pendingApprovals
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
