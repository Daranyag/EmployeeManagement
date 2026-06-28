const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  isProfileCompleted: {
    type: Boolean,
    default: false
  },
  // 'active'  → can login
  // 'pending' → self-registered, awaiting admin approval
  // 'rejected'→ admin rejected the registration request
  // 'deleted' → soft-deleted, email stays locked forever
  status: {
    type: String,
    enum: ['active', 'pending', 'rejected', 'deleted'],
    default: 'active'
  },
  // Track how the account was created
  registered_by: {
    type: String,
    enum: ['admin', 'self'],
    default: 'self'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
