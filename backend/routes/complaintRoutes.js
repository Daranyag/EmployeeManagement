const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

// Raise Complaint (Employee only)
router.post('/', authenticate, authorize('employee'), async (req, res) => {
  try {
    const { subject, category, message } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employee = await Employee.findOne({ user_id: req.user._id, status: 'active' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const ticketCount = await Complaint.countDocuments();
    const ticket_id = `TK${1000 + ticketCount + 1}`;

    const newComplaint = new Complaint({
      ticket_id,
      employee_id: employee.employee_id,
      company_id: employee.company_id, // Store company_id
      subject,
      category,
      message,
      status: 'Open'
    });

    const savedComplaint = await newComplaint.save();
    res.status(201).json({ message: 'Complaint ticket created successfully', complaint: savedComplaint });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track own complaints (Employee only)
router.get('/me', authenticate, authorize('employee'), async (req, res) => {
  try {
    const employee = await Employee.findOne({ user_id: req.user._id, status: 'active' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee profile not found' });
    }

    const complaints = await Complaint.find({ employee_id: employee.employee_id, company_id: employee.company_id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error('Fetch own complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// View all complaints (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Multi-tenant check: filter complaints strictly by Admin's company_id
    const complaints = await Complaint.find({ company_id: req.user.company_id }).sort({ createdAt: -1 });
    
    // Fetch associated employee info for display
    const enrichedComplaints = await Promise.all(
      complaints.map(async (complaint) => {
        const emp = await Employee.findOne({ employee_id: complaint.employee_id, company_id: req.user.company_id });
        return {
          ...complaint.toObject(),
          employee_name: emp ? emp.name : 'Unknown Employee',
          department: emp ? emp.department : 'N/A'
        };
      })
    );
    res.json(enrichedComplaints);
  } catch (error) {
    console.error('Fetch all complaints error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Respond and change status of Complaint (Admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status, response } = req.body;

    const complaint = await Complaint.findOne({ ticket_id: req.params.id, company_id: req.user.company_id });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (status && ['Open', 'In Progress', 'Closed'].includes(status)) {
      complaint.status = status;
    }

    if (response !== undefined) {
      complaint.response = response;
    }

    const updatedComplaint = await complaint.save();
    res.json({ message: 'Complaint updated successfully', complaint: updatedComplaint });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
