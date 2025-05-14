const mongoose = require('mongoose');
require('dotenv').config();

// Set up Mongoose options for better data persistence
mongoose.set('strictQuery', false);

// Handle MongoDB events for better error reporting
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from MongoDB');
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        console.log('MongoDB URI:', process.env.MONGODB_URI);
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Add these options for better data persistence
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 10, // Maintain up to 10 socket connections
            retryWrites: true,
            w: 'majority' // Ensure data is acknowledged by majority of replica set
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log('Database Name:', conn.connection.db.databaseName);
        
        // Test the connection by creating a test document
        const testCollection = conn.connection.db.collection('connection_tests');
        await testCollection.insertOne({
            message: 'Connection test successful',
            timestamp: new Date()
        });
        console.log('Successfully wrote to database - connection is fully established');
        
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        console.error('Error Details:', {
            name: err.name,
            message: err.message,
            code: err.code
        });
        process.exit(1);
    }
};

module.exports = connectDB;