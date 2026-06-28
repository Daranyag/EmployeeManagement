const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  ticket_id: {
    type: String,
    required: true,
    unique: true
  },
  employee_id: {
    type: String,
    required: true // references employee_id
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['HR', 'IT', 'Payroll', 'General'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Closed'],
    default: 'Open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
