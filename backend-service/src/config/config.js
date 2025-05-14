/**
 * Application Configuration
 */

const config = {
    // API base URL for internal service calls
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
    
    // MongoDB connection string
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/mini-crm',
    
    // Server port
    port: process.env.PORT || 5000,
    
    // Batch processing configuration
    batchProcessing: {
        batchSize: 10,
        interval: 1000, // milliseconds
    },
    
    // Vendor API configuration
    vendor: {
        // In a real app, these would be actual API credentials
        apiKey: process.env.VENDOR_API_KEY || 'test_key',
        apiSecret: process.env.VENDOR_API_SECRET || 'test_secret',
        baseUrl: process.env.VENDOR_API_URL || 'https://api.vendorapi.example.com',
    }
};

module.exports = config; 