import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');

// Mongoose Schemas & Models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'agent'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  company: String,
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
  customerId: { type: String, required: true }, // Linked to User _id or Customer _id
  customerName: String,
  type: { type: String, enum: ['Support Ticket', 'Inquiry', 'Feedback', 'General Call'], default: 'Support Ticket' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

let UserModel;
let CustomerModel;
let TicketModel;

let useLocalDB = false;

// Helper: Read JSON file
async function readData(file) {
  try {
    const content = await fs.readFile(file, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    return [];
  }
}

// Helper: Write JSON file
async function writeData(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// Default Seed Users Helper
async function seedDefaultUsers() {
  const defaultUsers = [
    {
      _id: 'agent-default-id',
      name: 'Agent Support',
      email: 'agent@registry.com',
      password: 'password', // Simple password for local dev
      role: 'agent',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'zltvmyxjomr5xvj2y', // Matches our test customer ID
      name: 'Surya',
      email: 'surya@example.com',
      password: 'password',
      role: 'user',
      createdAt: new Date().toISOString()
    }
  ];

  if (!useLocalDB) {
    try {
      const count = await UserModel.countDocuments();
      if (count === 0) {
        await UserModel.insertMany(defaultUsers);
        console.log('Seeded default agent & customer in MongoDB.');
      }
    } catch (err) {
      console.error('Error seeding users in MongoDB:', err);
    }
  } else {
    const users = await readData(USERS_FILE);
    if (users.length === 0) {
      await writeData(USERS_FILE, defaultUsers);
      console.log('Seeded default agent & customer in local JSON.');
    }
  }
}

// Initialize file database files if they don't exist
async function initFileDB() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    }
    try {
      await fs.access(CUSTOMERS_FILE);
    } catch {
      await fs.writeFile(CUSTOMERS_FILE, JSON.stringify([], null, 2));
    }
    try {
      await fs.access(TICKETS_FILE);
    } catch {
      await fs.writeFile(TICKETS_FILE, JSON.stringify([], null, 2));
    }
  } catch (err) {
    console.error('Error initializing file DB:', err);
  }
}

// Connect to MongoDB with timeout
export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/customer_registry';
  console.log(`Connecting to database...`);
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // Timeout after 2.5 seconds
    });
    console.log('Successfully connected to MongoDB.');
    UserModel = mongoose.model('User', UserSchema);
    CustomerModel = mongoose.model('Customer', CustomerSchema);
    TicketModel = mongoose.model('Ticket', TicketSchema);
    useLocalDB = false;
  } catch (error) {
    console.warn('\n================================================================');
    console.warn('WARNING: Failed to connect to MongoDB.');
    console.warn('Falling back gracefully to local file-based database (JSON storage).');
    console.warn('================================================================\n');
    useLocalDB = true;
    await initFileDB();
  }

  // Seed standard users
  await seedDefaultUsers();
}

// DB Methods
export const db = {
  isLocal: () => useLocalDB,

  // --- USERS / AUTH ---
  async createUser(data) {
    if (!useLocalDB) {
      return await UserModel.create(data);
    } else {
      const users = await readData(USERS_FILE);
      if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error('User email already exists');
      }
      const newUser = {
        _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'user',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      await writeData(USERS_FILE, users);
      return newUser;
    }
  },

  async findUserByEmail(email) {
    if (!useLocalDB) {
      return await UserModel.findOne({ email });
    } else {
      const users = await readData(USERS_FILE);
      return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
    }
  },

  async getUserById(id) {
    if (!useLocalDB) {
      return await UserModel.findById(id);
    } else {
      const users = await readData(USERS_FILE);
      return users.find(u => u._id === id) || null;
    }
  },

  // --- CUSTOMERS ---
  async getCustomers() {
    if (!useLocalDB) {
      return await CustomerModel.find().sort({ createdAt: -1 });
    } else {
      const customers = await readData(CUSTOMERS_FILE);
      return customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getCustomerById(id) {
    // Check CustomerModel first, then UserModel in case user registered themselves as customer
    if (!useLocalDB) {
      let cust = await CustomerModel.findById(id);
      if (!cust) {
        const user = await UserModel.findById(id);
        if (user) {
          cust = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: '—',
            company: 'Self-Registered',
            status: 'Active',
            createdAt: user.createdAt
          };
        }
      }
      return cust;
    } else {
      const customers = await readData(CUSTOMERS_FILE);
      let cust = customers.find(c => c._id === id);
      if (!cust) {
        const users = await readData(USERS_FILE);
        const user = users.find(u => u._id === id);
        if (user) {
          cust = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: '—',
            company: 'Self-Registered',
            status: 'Active',
            createdAt: user.createdAt
          };
        }
      }
      return cust || null;
    }
  },

  async createCustomer(data) {
    if (!useLocalDB) {
      return await CustomerModel.create(data);
    } else {
      const customers = await readData(CUSTOMERS_FILE);
      if (customers.some(c => c.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error('Email already exists');
      }
      const newCustomer = {
        _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        company: data.company || '',
        status: data.status || 'Active',
        createdAt: new Date().toISOString()
      };
      customers.push(newCustomer);
      await writeData(CUSTOMERS_FILE, customers);
      return newCustomer;
    }
  },

  async updateCustomer(id, data) {
    if (!useLocalDB) {
      return await CustomerModel.findByIdAndUpdate(id, data, { new: true });
    } else {
      const customers = await readData(CUSTOMERS_FILE);
      const index = customers.findIndex(c => c._id === id);
      if (index === -1) return null;

      if (data.email && data.email.toLowerCase() !== customers[index].email.toLowerCase()) {
        if (customers.some(c => c.email.toLowerCase() === data.email.toLowerCase())) {
          throw new Error('Email already exists');
        }
      }

      const updated = { ...customers[index], ...data, _id: id };
      customers[index] = updated;
      await writeData(CUSTOMERS_FILE, customers);
      return updated;
    }
  },

  async deleteCustomer(id) {
    if (!useLocalDB) {
      await TicketModel.deleteMany({ customerId: id });
      return await CustomerModel.findByIdAndDelete(id);
    } else {
      let customers = await readData(CUSTOMERS_FILE);
      const customer = customers.find(c => c._id === id);
      if (!customer) return null;

      customers = customers.filter(c => c._id !== id);
      await writeData(CUSTOMERS_FILE, customers);

      let tickets = await readData(TICKETS_FILE);
      tickets = tickets.filter(t => t.customerId !== id);
      await writeData(TICKETS_FILE, tickets);

      return customer;
    }
  },

  // --- TICKETS / INTERACTIONS ---
  async getTickets() {
    if (!useLocalDB) {
      return await TicketModel.find().sort({ createdAt: -1 });
    } else {
      const tickets = await readData(TICKETS_FILE);
      return tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async getTicketsByCustomerId(customerId) {
    if (!useLocalDB) {
      return await TicketModel.find({ customerId }).sort({ createdAt: -1 });
    } else {
      const tickets = await readData(TICKETS_FILE);
      return tickets
        .filter(t => t.customerId === customerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  },

  async createTicket(data) {
    let customerName = 'Customer';
    const customer = await this.getCustomerById(data.customerId);
    if (customer) {
      customerName = customer.name;
    }

    if (!useLocalDB) {
      return await TicketModel.create({ ...data, customerName });
    } else {
      const tickets = await readData(TICKETS_FILE);
      const newTicket = {
        _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
        customerId: data.customerId,
        customerName: customerName,
        type: data.type || 'Support Ticket',
        priority: data.priority || 'Low',
        status: data.status || 'Open',
        subject: data.subject,
        description: data.description,
        createdAt: new Date().toISOString()
      };
      tickets.push(newTicket);
      await writeData(TICKETS_FILE, tickets);
      return newTicket;
    }
  },

  async updateTicket(id, data) {
    if (!useLocalDB) {
      return await TicketModel.findByIdAndUpdate(id, data, { new: true });
    } else {
      const tickets = await readData(TICKETS_FILE);
      const index = tickets.findIndex(t => t._id === id);
      if (index === -1) return null;

      const updated = { ...tickets[index], ...data, _id: id };
      tickets[index] = updated;
      await writeData(TICKETS_FILE, tickets);
      return updated;
    }
  },

  async deleteTicket(id) {
    if (!useLocalDB) {
      return await TicketModel.findByIdAndDelete(id);
    } else {
      const tickets = await readData(TICKETS_FILE);
      const ticket = tickets.find(t => t._id === id);
      if (!ticket) return null;

      const filtered = tickets.filter(t => t._id !== id);
      await writeData(TICKETS_FILE, filtered);
      return ticket;
    }
  },

  // --- AGGREGATION & STATS ---
  async getDashboardStats() {
    const customers = await this.getCustomers();
    const tickets = await this.getTickets();

    const totalCustomers = customers.length;
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'Open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'In Progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'Resolved').length;
    const highPriorityTickets = tickets.filter(t => t.priority === 'High' && t.status !== 'Resolved').length;

    const resolutionRate = totalTickets > 0 
      ? Math.round((resolvedTickets / totalTickets) * 100) 
      : 0;

    const typeBreakdown = {
      'Support Ticket': tickets.filter(t => t.type === 'Support Ticket').length,
      'Inquiry': tickets.filter(t => t.type === 'Inquiry').length,
      'Feedback': tickets.filter(t => t.type === 'Feedback').length,
      'General Call': tickets.filter(t => t.type === 'General Call').length,
    };

    const recentTickets = tickets.slice(0, 5);

    return {
      totalCustomers,
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      highPriorityTickets,
      resolutionRate,
      typeBreakdown,
      recentTickets,
      dbMode: useLocalDB ? 'Local File DB' : 'MongoDB'
    };
  }
};
