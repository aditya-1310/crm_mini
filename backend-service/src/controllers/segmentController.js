const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

// Create a new segment
exports.createSegment = async (req, res) => {
    try {
        const { name, description, rules } = req.body;
        
        if (!name || !rules) {
            return res.status(400).json({
                success: false,
                error: 'Name and rules are required fields'
            });
        }
        
        // Calculate audience size based on rules
        const query = buildSegmentQuery(rules);
        const audienceSize = await Customer.countDocuments(query);
        
        // Create segment with calculated audience size
        const segment = await Segment.create({
            name,
            description,
            rules,
            audienceSize,
            lastCalculated: new Date()
        });
        
        // Verify segment was saved to DB
        const savedSegment = await Segment.findById(segment._id);
        if (!savedSegment) {
            throw new Error('Failed to persist segment to database');
        }
        
        res.status(201).json({
            success: true,
            data: segment
        });
    } catch (error) {
        console.error('Error creating segment:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all segments
exports.getSegments = async (req, res) => {
    try {
        const segments = await Segment.find();
        res.status(200).json({
            success: true,
            count: segments.length,
            data: segments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get segment by ID
exports.getSegment = async (req, res) => {
    try {
        const segment = await Segment.findById(req.params.id);
        if (!segment) {
            return res.status(404).json({
                success: false,
                error: 'Segment not found'
            });
        }
        res.status(200).json({
            success: true,
            data: segment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Preview segment size
exports.previewSegment = async (req, res) => {
    try {
        console.log('Received preview request with body:', JSON.stringify(req.body));
        
        // The rules can be in req.body.rules or directly in req.body
        let rules = req.body.rules || req.body;
        
        // Log the extracted rules
        console.log('Extracted rules:', JSON.stringify(rules));
        
        // Validate rules
        if (!rules) {
            console.log('Missing rules in request');
            return res.status(200).json({
                success: true,
                data: { audienceSize: 0 }
            });
        }
        
        // If rules are invalid, still return a successful response with size 0
        if (!rules.operator || !rules.conditions) {
            console.log('Invalid rules format:', rules);
            return res.status(200).json({
                success: true,
                data: { audienceSize: 0 }
            });
        }
        
        // Ensure conditions is an array
        if (!Array.isArray(rules.conditions)) {
            console.log('Conditions is not an array:', rules.conditions);
            return res.status(200).json({
                success: true,
                data: { audienceSize: 0 }
            });
        }
        
        // Build MongoDB query based on rules
        const query = buildSegmentQuery(rules);
        console.log('Built query:', JSON.stringify(query));
        
        // Count matching customers
        const count = await Customer.countDocuments(query);
        console.log('Counted audience size:', count);
        
        res.status(200).json({
            success: true,
            data: {
                audienceSize: count
            }
        });
    } catch (error) {
        console.error('Error in previewSegment:', error);
        // Return success: true with audienceSize: 0 to prevent frontend errors
        res.status(200).json({
            success: true,
            data: { audienceSize: 0 },
            message: `Error calculating audience: ${error.message}`
        });
    }
};

// Helper function to build MongoDB query from segment rules
function buildSegmentQuery(rules) {
    const query = {};

    if (rules.operator === 'AND') {
        query.$and = rules.conditions.map(condition => buildConditionQuery(condition));
    } else if (rules.operator === 'OR') {
        query.$or = rules.conditions.map(condition => buildConditionQuery(condition));
    }

    return query;
}

// Helper function to build condition query
function buildConditionQuery(condition) {
    const { field, operator, value } = condition;
    
    switch (operator) {
        case 'equals':
            return { [field]: value };
        case 'not_equals':
            return { [field]: { $ne: value } };
        case 'greater_than':
            return { [field]: { $gt: value } };
        case 'less_than':
            return { [field]: { $lt: value } };
        case 'contains':
            return { [field]: { $regex: value, $options: 'i' } };
        case 'not_contains':
            return { [field]: { $not: { $regex: value, $options: 'i' } } };
        case 'in':
            return { [field]: { $in: value } };
        case 'not_in':
            return { [field]: { $nin: value } };
        default:
            throw new Error(`Unsupported operator: ${operator}`);
    }
} 