const mongoose = require('mongoose');
const Customer = require('../models/Customer');
require('dotenv').config();

// Sample customer data
const sampleCustomers = [
  { 
    name: 'John Smith', 
    email: 'john.smith@example.com', 
    phone: '+919876543210', 
    totalSpend: 12500, 
    visits: 8, 
    lastActive: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) // 15 days ago
  },
  { 
    name: 'Priya Sharma', 
    email: 'priya.sharma@example.com', 
    phone: '+919876543211', 
    totalSpend: 8700, 
    visits: 5, 
    lastActive: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) // 45 days ago
  },
  { 
    name: 'Rahul Verma', 
    email: 'rahul.verma@example.com', 
    phone: '+919876543212', 
    totalSpend: 21000, 
    visits: 12, 
    lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  { 
    name: 'Suhani Patel', 
    email: 'suhani.patel@example.com', 
    phone: '+919876543213', 
    totalSpend: 4500, 
    visits: 3, 
    lastActive: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) // 100 days ago
  },
  { 
    name: 'Arjun Singh', 
    email: 'arjun.singh@example.com', 
    phone: '+919876543214', 
    totalSpend: 15800, 
    visits: 10, 
    lastActive: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
  },
  { 
    name: 'Meera Kapoor', 
    email: 'meera.kapoor@example.com', 
    phone: '+919876543215', 
    totalSpend: 6200, 
    visits: 4, 
    lastActive: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days ago
  },
  { 
    name: 'Vikram Malhotra', 
    email: 'vikram.malhotra@example.com', 
    phone: '+919876543216', 
    totalSpend: 32000, 
    visits: 15, 
    lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  { 
    name: 'Ananya Chatterjee', 
    email: 'ananya.chatterjee@example.com', 
    phone: '+919876543217', 
    totalSpend: 9800, 
    visits: 7, 
    lastActive: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000) // 25 days ago
  },
  { 
    name: 'Karthik Rajan', 
    email: 'karthik.rajan@example.com', 
    phone: '+919876543218', 
    totalSpend: 18200, 
    visits: 11, 
    lastActive: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
  },
  { 
    name: 'Zara Khan', 
    email: 'zara.khan@example.com', 
    phone: '+919876543219', 
    totalSpend: 3700, 
    visits: 2, 
    lastActive: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000) // 120 days ago
  }
];

const seedCustomers = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB, seeding customers...');
    
    // Check if we already have customers in the database
    const existingCount = await Customer.countDocuments();
    
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} customers. Deleting them...`);
      await Customer.deleteMany({});
      console.log('Existing customers deleted.');
    }
    
    // Insert sample customers
    const result = await Customer.insertMany(sampleCustomers);
    console.log(`Successfully seeded ${result.length} customers.`);
    
    for (const customer of result) {
      console.log(`- ${customer.name} (ID: ${customer._id})`);
    }
    
    console.log('Seeding complete!');
    
  } catch (error) {
    console.error('Error seeding customers:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

// Run the seeding function
seedCustomers();
