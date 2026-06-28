const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Employee = require('../models/Employee');
const { authenticate, authorize } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────
// GET /api/approvals
// List all pending & rejected employee registration requests
// Admin only
// ─────────────────────────────────────────────────────────────
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    // Find all pending/rejected users in the admin's company (exclude admins)
    const requests = await User.find({
      company_id: req.user.company_id,
      role: 'employee',
      registered_by: 'self',
      status: { $in: ['pending', 'rejected'] }
    }).populate('company_id', 'company_name').select('-password').sort({ createdAt: -1 });

    // Enrich with employee record info (profile_photo, department, etc.)
    const enriched = await Promise.all(
      requests.map(async (u) => {
        const emp = await Employee.findOne({ user_id: u._id });
        return {
          user_id: u._id,
          email: u.email,
          status: u.status,
          registered_by: u.registered_by,
          createdAt: u.createdAt,
          company_name: u.company_id?.company_name || 'N/A',
          name: emp ? emp.name : (u.email.split('@')[0] || 'Unknown'),
          employee_id: emp ? emp.employee_id : null,
          department: emp ? emp.department : 'N/A',
          designation: emp ? emp.designation : 'N/A',
          profile_photo: emp ? (emp.profile_photo || '') : ''
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error('Fetch approvals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/approvals/:userId/accept
// Admin accepts a pending employee — activates their account
// ─────────────────────────────────────────────────────────────
router.put('/:userId/accept', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      company_id: req.user.company_id,
      role: 'employee',
      status: 'pending'
    });

    if (!user) {
      return res.status(404).json({ message: 'Pending request not found or already processed' });
    }

    // Activate user account
    user.status = 'active';
    await user.save();

    // Activate employee record
    const emp = await Employee.findOne({ user_id: user._id });
    if (emp) {
      emp.status = 'active';
      await emp.save();
    }

    res.json({
      message: `Employee account for ${user.email} has been approved and activated.`,
      user_id: user._id,
      status: 'active'
    });
  } catch (error) {
    console.error('Accept approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/approvals/:userId/reject
// Admin rejects a pending employee — marks account as rejected
// ─────────────────────────────────────────────────────────────
router.put('/:userId/reject', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      company_id: req.user.company_id,
      role: 'employee',
      status: 'pending'
    });

    if (!user) {
      return res.status(404).json({ message: 'Pending request not found or already processed' });
    }

    // Delete user account to allow email reuse
    await User.deleteOne({ _id: user._id });

    // Delete associated employee record
    await Employee.deleteOne({ user_id: user._id });

    res.json({
      message: `Employee registration for ${user.email} has been rejected.`,
      user_id: user._id,
      status: 'rejected'
    });
  } catch (error) {
    console.error('Reject approval error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
