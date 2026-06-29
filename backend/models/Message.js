const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  message_id: {
    type: String,
    required: true,
    unique: true
  },
  sender_id: {
    type: String, // can be email or employee_id or 'admin'
    required: true,
    index: true
  },
  receiver_id: {
    type: String, // can be employee_id or 'admin'
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
