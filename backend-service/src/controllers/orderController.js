const Order = require('../models/Order');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

// Get all orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('customerId', 'name email');
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get single order by ID
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('customerId', 'name email');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get orders by customer ID
exports.getCustomerOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.params.customerId })
            .populate('customerId', 'name email');
        
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Create a single order
exports.createOrder = async (req, res) => {
    try {
        console.log('Received order data:', req.body);

        // Validate customerId
        if (!req.body.customerId) {
            return res.status(400).json({
                success: false,
                error: 'Customer ID is required'
            });
        }

        // Check if customerId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.body.customerId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Customer ID format. Please provide a valid MongoDB ID'
            });
        }

        // Check if customer exists
        const customer = await Customer.findById(req.body.customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Customer not found with the provided ID'
            });
        }

        // Validate items
        if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Order must contain at least one item'
            });
        }

        // Calculate total amount
        const totalAmount = req.body.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const order = await Order.create({
            ...req.body,
            totalAmount
        });

        console.log('Order created successfully:', order);
        
        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Create multiple orders
exports.createBulkOrders = async (req, res) => {
    try {
        console.log('Received bulk order data:', req.body);

        if (!Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                error: 'Request body must be an array of orders'
            });
        }

        // Validate each order
        for (const order of req.body) {
            if (!order.customerId) {
                return res.status(400).json({
                    success: false,
                    error: 'Each order must have a customerId'
                });
            }

            if (!mongoose.Types.ObjectId.isValid(order.customerId)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid Customer ID format for order: ${order.customerId}`
                });
            }

            // Check if customer exists
            const customer = await Customer.findById(order.customerId);
            if (!customer) {
                return res.status(404).json({
                    success: false,
                    error: `Customer not found with ID: ${order.customerId}`
                });
            }

            if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Each order must contain at least one item'
                });
            }
        }

        // Calculate total amount for each order
        const ordersWithTotal = req.body.map(order => ({
            ...order,
            totalAmount: order.items.reduce((total, item) => {
                return total + (item.price * item.quantity);
            }, 0)
        }));

        const orders = await Order.insertMany(ordersWithTotal);
        console.log('Bulk orders created successfully:', orders);
        
        res.status(201).json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error('Error creating bulk orders:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 