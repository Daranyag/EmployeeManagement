const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

// Apply for Leave (Employee only)
router.post('/', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { leave_type, from_date, to_date, reason } = req.body;

    if (!leave_type || !from_date || !to_date || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employee = await Employee.findOne({ user_id: req.user._id, status: 'active' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const leaveCount = await Leave.countDocuments();
    const leave_id = `LV${1000 + leaveCount + 1}`;

    const newLeave = new Leave({
      leave_id,
      employee_id: employee.employee_id,
      company_id: employee.company_id, // Store company_id
      leave_type,
      from_date: new Date(from_date),
      to_date: new Date(to_date),
      reason,
      status: 'Pending'
    });

    const savedLeave = await newLeave.save();
    res.status(201).json({ message: 'Leave request submitted successfully', leave: savedLeave });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View own Leave requests (Employee only)
router.get('/me', authenticate, authorize('employee'), async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user._id, status: 'active' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const leaves = await Leave.find({ employee_id: employee.employee_id, company_id: employee.company_id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    console.error('Fetch own leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View all Leave requests (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Multi-tenant check: filter leaves strictly by Admin's company_id
    const leaves = await Leave.find({ company_id: req.user.company_id }).sort({ createdAt: -1 });
    
    // Fetch associated employee info for display
    const enrichedLeaves = await Promise.all(
      leaves.map(async (leave) => {
        const emp = await Employee.findOne({ employee_id: leave.employee_id, company_id: req.user.company_id });
        return {
          ...leave.toObject(),
          employee_name: emp ? emp.name : 'Unknown Employee',
          department: emp ? emp.department : 'N/A'
        };
      })
    );
    res.json(enrichedLeaves);
  } catch (error) {
    console.error('Fetch all leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve or Reject Leave (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const leave = await Leave.findOne({ leave_id: req.params.id, company_id: req.user.company_id });
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    leave.status = status;
    const updatedLeave = await leave.save();
    res.json({ message: `Leave request status updated to ${status}`, leave: updatedLeave });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
