const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Employee = require('../models/Employee');
const { authenticate } = require('../middleware/auth');

// Send Message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ message: 'Receiver ID and message content are required' });
    }

    let sender_id = '';
    if (req.user.role === 'admin') {
      sender_id = 'admin';
    } else {
      const emp = await Employee.findOne({ user_id: req.user._id, status: 'active' });
      if (!emp) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      sender_id = emp.employee_id;
    }

    const messageCount = await Message.countDocuments();
    const message_id = `MSG${1000 + messageCount + 1}`;

    const newMessage = new Message({
      message_id,
      sender_id,
      receiver_id,
      message,
      company_id: req.user.company_id, // Scope to company_id
      timestamp: new Date()
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get chat history with another user (employee_id or 'admin')
router.get('/history/:otherId', authenticate, async (req, res) => {
  try {
    const otherId = req.params.otherId;
    let myId = '';

    if (req.user.role === 'admin') {
      myId = 'admin';
    } else {
      const emp = await Employee.findOne({ user_id: req.user._id, status: 'active' });
      if (!emp) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }
      myId = emp.employee_id;
    }

    // Messages isolated strictly by company_id
    const messages = await Message.find({
      company_id: req.user.company_id,
      $or: [
        { sender_id: myId, receiver_id: otherId },
        { sender_id: otherId, receiver_id: myId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Fetch messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin contacts list (all active employees within the same company)
router.get('/contacts', authenticate, async (req, res) => {
  try {
    const employees = await Employee.find({ status: 'active', company_id: req.user.company_id }).select('employee_id name department designation profile_photo');
    res.json(employees);
  } catch (error) {
    console.error('Fetch contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count for the current user
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    let myId = '';
    if (req.user.role === 'admin') {
      myId = 'admin';
    } else {
      const emp = await Employee.findOne({ user_id: req.user._id, status: 'active' });
      if (!emp) return res.json({ count: 0 });
      myId = emp.employee_id;
    }

    const count = await Message.countDocuments({
      company_id: req.user.company_id,
      receiver_id: myId,
      isRead: false
    });

    res.json({ count });
  } catch (error) {
    console.error('Fetch unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message counts per contact (grouped by sender)
router.get('/unread-counts-per-contact', authenticate, async (req, res) => {
  try {
    let myId = '';
    if (req.user.role === 'admin') {
      myId = 'admin';
    } else {
      const emp = await Employee.findOne({ user_id: req.user._id, status: 'active' });
      if (!emp) return res.json({});
      myId = emp.employee_id;
    }

    const unreadMessages = await Message.aggregate([
      { $match: { company_id: req.user.company_id, receiver_id: myId, isRead: false } },
      { $group: { _id: "$sender_id", count: { $sum: 1 } } }
    ]);

    const counts = {};
    unreadMessages.forEach(item => {
      counts[item._id] = item.count;
    });

    res.json(counts);
  } catch (error) {
    console.error('Fetch unread counts per contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages from a specific sender as read
router.put('/mark-read/:senderId', authenticate, async (req, res) => {
  try {
    let myId = '';
    if (req.user.role === 'admin') {
      myId = 'admin';
    } else {
      const emp = await Employee.findOne({ user_id: req.user._id, status: 'active' });
      if (!emp) return res.status(404).json({ message: 'Employee not found' });
      myId = emp.employee_id;
    }

    await Message.updateMany(
      {
        company_id: req.user.company_id,
        receiver_id: myId,
        sender_id: req.params.senderId,
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
