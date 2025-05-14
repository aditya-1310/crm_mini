const Customer = require('../models/Customer');

// Get all customers
exports.getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single customer by ID
exports.getCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Customer not found'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error('Error fetching customer:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Create a single customer
exports.createCustomer = async (req, res) => {
    try {
        console.log('Received customer data:', req.body);
        
        // Validate required fields
        if (!req.body.name || !req.body.email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required fields'
            });
        }

        // Check if customer with email already exists
        const existingCustomer = await Customer.findOne({ email: req.body.email });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                error: 'Customer with this email already exists'
            });
        }

        const customer = await Customer.create(req.body);
        console.log('Customer created successfully:', customer);
        
        res.status(201).json({
            success: true,
            data: customer
        });
    } catch (error) {
        console.error('Error creating customer:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Create multiple customers
exports.createBulkCustomers = async (req, res) => {
    try {
        console.log('Received bulk customer data:', req.body);
        
        if (!Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                error: 'Request body must be an array of customers'
            });
        }

        // Validate each customer
        for (const customer of req.body) {
            if (!customer.name || !customer.email) {
                return res.status(400).json({
                    success: false,
                    error: 'Each customer must have name and email'
                });
            }
        }

        const customers = await Customer.insertMany(req.body);
        console.log('Bulk customers created successfully:', customers);
        
        res.status(201).json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error('Error creating bulk customers:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 