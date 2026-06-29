const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  leave_id: {
    type: String,
    required: true,
    unique: true
  },
  employee_id: {
    type: String,
    required: true, // references employee_id
    index: true
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  leave_type: {
    type: String,
    enum: ['Sick', 'Casual', 'Emergency'],
    required: true
  },
  from_date: {
    type: Date,
    required: true
  },
  to_date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
