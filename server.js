const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.options('*', cors());

const mongoUri = 'mongodb+srv://hotel24x7:Hc8UfM8PCABMLFmq@hotel24x7.xpc0qgd.mongodb.net/hotel24x7?retryWrites=true&w=majority'; // Change if using Atlas

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
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
    const customer = new Customer(req.body);
    await customer.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all customers
app.get('/api/customers', async (req, res) => {
  const customers = await Customer.find();
  res.json(customers);
});

// Update customer by MongoDB _id
app.put('/api/update-customer/:id', async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer by MongoDB _id
app.delete('/api/delete-customer/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 