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

// Configure mongoose
mongoose.set('strictQuery', false);

// Connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, options);
      console.log('MongoDB connected successfully');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Connect to MongoDB
connectDB();

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  // Attempt to reconnect
  setTimeout(connectDB, 5000);
});

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
app.get('/', async (req, res) => {
  try {
    await connectDB(); // Ensure connection before responding
    res.json({ 
      message: 'Welcome to Hotel24x7 API',
      status: 'Server is running',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error connecting to database',
      error: error.message
    });
  }
});

// API Routes
app.get('/api', async (req, res) => {
  try {
    await connectDB(); // Ensure connection before responding
    res.json({ 
      message: 'Welcome to Hotel24x7 API',
      status: 'Server is running',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error connecting to database',
      error: error.message
    });
  }
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    await connectDB(); // Ensure connection before responding
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      connectionState: mongoose.connection.readyState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error connecting to database',
      error: error.message
    });
  }
});

// Customer Routes
app.post('/api/save-customer', async (req, res) => {
  try {
    await connectDB(); // Ensure connection before responding
    const customer = new Customer(req.body);
    await customer.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    await connectDB(); // Ensure connection before responding
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/update-customer/:id', async (req, res) => {
  try {
    await connectDB(); // Ensure connection before responding
    await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/delete-customer/:id', async (req, res) => {
  try {
    await connectDB(); // Ensure connection before responding
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