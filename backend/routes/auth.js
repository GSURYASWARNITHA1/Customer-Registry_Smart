import express from 'express';

const router = express.Router();

// PRE-LOADED SAMPLE DATA
export let mockUsers = [
  {
    _id: 'user001',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'rahul123',
    role: 'user'
  },
  {
    _id: 'agent001',
    name: 'Admin Agent',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'agent'
  }
];

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = {
      _id: 'u_' + Math.random().toString(36).substr(2, 9),
      name, email, password, role
    };
    mockUsers.push(newUser);
    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = mockUsers.find(u => u.email === email);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.password !== password) return res.status(400).json({ message: 'Invalid credentials' });
    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
