import express from 'express';
import { db } from './db.js';

const router = express.Router();

// --- AUTHENTICATION ---
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, Email and Password are required' });
    }
    
    // Check if user already exists
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = await db.createUser({
      name,
      email,
      password, // Simple text storage for local study projects
      role: role || 'user'
    });

    // Strip password from response
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    };

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and Password are required' });
    }

    const user = await db.findUserByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Strip password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SYSTEM / STATUS ---
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- CUSTOMERS ---
router.get('/customers', async (req, res) => {
  try {
    const customers = await db.getCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await db.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer profile not found' });
    }
    const tickets = await db.getTicketsByCustomerId(req.params.id);
    res.json({ customer, tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/customers', async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }
    const newCustomer = await db.createCustomer({ name, email, phone, company, status });
    res.status(201).json(newCustomer);
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put('/customers/:id', async (req, res) => {
  try {
    const updatedCustomer = await db.updateCustomer(req.params.id, req.body);
    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(updatedCustomer);
  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete('/customers/:id', async (req, res) => {
  try {
    const deleted = await db.deleteCustomer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- TICKETS ---
router.get('/tickets', async (req, res) => {
  try {
    const tickets = await db.getTickets();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tickets/user/:userId', async (req, res) => {
  try {
    const tickets = await db.getTicketsByCustomerId(req.params.userId);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tickets', async (req, res) => {
  try {
    const { customerId, type, priority, status, subject, description } = req.body;
    if (!customerId || !subject || !description) {
      return res.status(400).json({ error: 'Customer, Subject, and Description are required' });
    }
    const newTicket = await db.createTicket({ customerId, type, priority, status, subject, description });
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/tickets/:id', async (req, res) => {
  try {
    const updatedTicket = await db.updateTicket(req.params.id, req.body);
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/tickets/:id', async (req, res) => {
  try {
    const deleted = await db.deleteTicket(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    res.json({ message: 'Ticket deleted successfully', deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
