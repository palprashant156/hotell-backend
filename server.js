const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// CORS configuration
const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoUri = 'mongodb+srv://hotel24x7:Hc8UfM8PCABMLFmq@hotel24x7.xpc0qgd.mongodb.net/hotel24x7?retryWrites=true&w=majority';

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

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

// Save customer
app.post('/api/save-customer', async (req, res) => {
  try {
    console.log('Received customer data:', req.body); // Debug log
    const customer = new Customer(req.body);
    const savedCustomer = await customer.save();
    console.log('Saved customer:', savedCustomer); // Debug log
    res.status(201).json({ 
      success: true, 
      message: 'Customer saved successfully',
      data: savedCustomer 
    });
  } catch (err) {
    console.error('Error saving customer:', err); // Debug log
    res.status(500).json({ 
      success: false,
      error: err.message,
      details: err.errors || 'Unknown error occurred'
    });
  }
});

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json({ 
      success: true,
      data: customers 
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Update customer by MongoDB _id
app.put('/api/update-customer/:id', async (req, res) => {
  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ 
        success: false,
        error: 'Customer not found' 
      });
    }
    res.json({ 
      success: true,
      message: 'Customer updated successfully',
      data: updatedCustomer 
    });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
});

// Delete customer by MongoDB _id
app.delete('/api/delete-customer/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ 
        success: false,
        error: 'Customer not found' 
      });
    }
    res.json({ 
      success: true,
      message: 'Customer deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting customer:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
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

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Hotel24x7 API',
    status: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 