const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  employee_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  joining_date: {
    type: Date,
    required: true
  },
  profile_photo: {
    type: String,
    default: ''
  },
  emergency_contact: {
    type: String,
    default: ''
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  // 'active'  → full system access
  // 'deleted' → soft-deleted
  status: {
    type: String,
    enum: ['active', 'deleted'],
    default: 'active'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
