import express from 'express';
import { mockUsers } from './auth.js';

const router = express.Router();

// PRE-LOADED SAMPLE COMPLAINTS
let mockComplaints = [
  {
    _id: 'c001',
    userId: 'user001',
    title: 'Unable to login to my account',
    description: 'I have been trying to login since yesterday but it keeps saying invalid credentials even though my password is correct. Please help me resolve this issue as soon as possible.',
    status: 'In Progress',
    agentReply: 'Hello Rahul, we have received your complaint. Our team is looking into the login issue. Please try resetting your password in the meantime.',
    messages: [
      { from: 'user', text: 'I have been trying to login since yesterday but it keeps saying invalid credentials even though my password is correct.', time: new Date(Date.now() - 86400000).toISOString() },
      { from: 'agent', text: 'Hello Rahul, we have received your complaint. Our team is looking into the login issue. Please try resetting your password in the meantime.', time: new Date(Date.now() - 43200000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'c002',
    userId: 'user001',
    title: 'Payment deducted but order not placed',
    description: 'I made a payment of Rs. 1500 on 4th July for my order #ORD-2024-789, but the amount was deducted from my bank account and the order was never confirmed. I need a refund or my order to be placed immediately.',
    status: 'Pending',
    agentReply: '',
    messages: [
      { from: 'user', text: 'I made a payment of Rs. 1500 on 4th July for my order #ORD-2024-789, but the amount was deducted from my bank account and the order was never confirmed.', time: new Date(Date.now() - 3600000).toISOString() }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// Create a complaint
router.post('/', async (req, res) => {
  try {
    const { userId, title, description } = req.body;
    const newComplaint = {
      _id: 'c_' + Math.random().toString(36).substr(2, 9),
      userId,
      title,
      description,
      status: 'Pending',
      agentReply: '',
      messages: [
        { from: 'user', text: description, time: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString()
    };
    mockComplaints.push(newComplaint);
    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create complaint' });
  }
});

// Get user's complaints
router.get('/user/:userId', async (req, res) => {
  try {
    const complaints = mockComplaints
      .filter(c => c.userId === req.params.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
});

// Get all complaints (for agent)
router.get('/', async (req, res) => {
  try {
    const complaints = mockComplaints.map(c => {
      const user = mockUsers.find(u => u._id === c.userId);
      return { ...c, userId: user ? { _id: user._id, name: user.name, email: user.email } : { _id: c.userId, name: 'Unknown', email: '' } };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all complaints' });
  }
});

// Update complaint status or add reply
router.put('/:id', async (req, res) => {
  try {
    const { status, agentReply } = req.body;
    const index = mockComplaints.findIndex(c => c._id === req.params.id);
    if (index !== -1) {
      if (status) mockComplaints[index].status = status;
      if (agentReply !== undefined && agentReply !== '') {
        mockComplaints[index].agentReply = agentReply;
        mockComplaints[index].messages.push({
          from: 'agent',
          text: agentReply,
          time: new Date().toISOString()
        });
        if (!status) mockComplaints[index].status = 'In Progress';
      }
      res.status(200).json(mockComplaints[index]);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update complaint' });
  }
});

// Send a chat message in a complaint
router.post('/:id/message', async (req, res) => {
  try {
    const { from, text } = req.body;
    const index = mockComplaints.findIndex(c => c._id === req.params.id);
    if (index !== -1) {
      const msg = { from, text, time: new Date().toISOString() };
      mockComplaints[index].messages.push(msg);
      if (from === 'agent') {
        mockComplaints[index].agentReply = text;
        mockComplaints[index].status = 'In Progress';
      }
      res.status(200).json(mockComplaints[index]);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

export default router;
