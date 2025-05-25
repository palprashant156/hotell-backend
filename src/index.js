const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors());

// MongoDB Connection
const mongoUri = 'mongodb+srv://hotel24x7:Hc8UfM8PCABMLFmq@hotel24x7.xpc0qgd.mongodb.net/hotel24x7?retryWrites=true&w=majority';

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Customer Schema
const customerSchema = new mongoose.Schema({
  No_of_customer: Number,
  Customer_Id: Number,
  Name: String,
  Aadhar_no: { type: String, required: true, unique: true },
  Pan_no: String,
  Add_person: Number,
  Phone_no: String
});

const Customer = mongoose.model('Customer', customerSchema);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Hotel24x7 API',
    status: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API Routes
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Welcome to Hotel24x7 API',
    status: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Customer Routes
app.post('/api/save-customer', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/update-customer/:id', async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/delete-customer/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express API
module.exports = app; 