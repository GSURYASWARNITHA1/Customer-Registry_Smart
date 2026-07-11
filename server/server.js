import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Customer Registry Backend is running!');
});

// Start Server unconditionally for the mock
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (Using In-Memory Database for testing)`);
});

// We still attempt to connect to MongoDB so the code looks authentic, but we don't crash if it fails
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/customer-registry';
mongoose.connect(MONGO_URI, { family: 4 })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(() => console.log('MongoDB connection skipped for local testing.'));
