const Campaign = require('../models/Campaign');
const Segment = require('../models/Segment');
const Customer = require('../models/Customer');
const CommunicationLog = require('../models/CommunicationLog');
const vendorService = require('../services/vendorService');

// Create a new campaign
exports.createCampaign = async (req, res) => {
    try {
        const { name, segmentId, message } = req.body;
        
        // Validate required fields
        if (!name || !segmentId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Please provide name, segmentId and message'
            });
        }
        
        // Check if segment exists
        const segment = await Segment.findById(segmentId);
        if (!segment) {
            return res.status(404).json({
                success: false,
                error: 'Segment not found'
            });
        }
        
        // Calculate the audience size based on the segment rules
        let audienceSize = segment.audienceSize || 0;
        
        // If segment doesn't have an audience size, calculate it now
        if (audienceSize === 0 && segment.rules) {
            // Use our own implementation of buildSegmentQuery for consistency
            const query = {};
            if (segment.rules.operator === 'AND') {
                query.$and = segment.rules.conditions.map(condition => buildConditionQuery(condition));
            } else if (segment.rules.operator === 'OR') {
                query.$or = segment.rules.conditions.map(condition => buildConditionQuery(condition));
            }
            
            audienceSize = await Customer.countDocuments(query);
            
            // Update the segment with the calculated audience size
            await Segment.findByIdAndUpdate(segment._id, {
                audienceSize,
                lastCalculated: new Date()
            });
            
            console.log(`Calculated audience size for segment ${segment.name}: ${audienceSize}`);
        }
        
        // Create campaign with more detailed information
        const campaign = await Campaign.create({
            name,
            segmentId,
            message,
            status: 'PROCESSING',
            audienceSize,
            sentCount: 0,
            failedCount: 0,
            createdAt: new Date()
        });
        
        // Verify campaign was saved to DB
        const savedCampaign = await Campaign.findById(campaign._id);
        if (!savedCampaign) {
            throw new Error('Failed to persist campaign to database');
        }
        
        // Trigger campaign delivery in the background
        deliverCampaign(savedCampaign, segment, message);
        
        res.status(201).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        console.error('Error creating campaign:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all campaigns
exports.getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find()
            .sort({ createdAt: -1 }) // Most recent first
            .populate('segmentId', 'name'); // Include segment name
        
        res.status(200).json({
            success: true,
            count: campaigns.length,
            data: campaigns
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get campaign by ID
exports.getCampaign = async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate('segmentId', 'name');
        
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get communication logs for a campaign
exports.getCampaignLogs = async (req, res) => {
    try {
        const campaignId = req.params.id;
        
        // Verify campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }
        
        // Find communication logs for this campaign
        const logs = await CommunicationLog.find({ campaignId })
            .populate('customerId', 'name phone') // Include customer details
            .sort({ createdAt: -1 }); // Most recent first
        
        res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching campaign logs:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Handle delivery receipts from vendor API
exports.handleDeliveryReceipts = async (req, res) => {
    try {
        const { receipts } = req.body;
        
        if (!receipts || !Array.isArray(receipts)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid receipts data'
            });
        }
        
        // Process receipts in batches
        await processDeliveryReceipts(receipts);
        
        res.status(200).json({
            success: true,
            message: `Processed ${receipts.length} delivery receipts`
        });
    } catch (error) {
        console.error('Error processing delivery receipts:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get campaign statistics
exports.getCampaignStats = async (req, res) => {
    try {
        const stats = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalCampaigns: { $sum: 1 },
                    totalSent: { $sum: '$sentCount' },
                    totalFailed: { $sum: '$failedCount' }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: stats.length > 0 ? stats[0] : { totalCampaigns: 0, totalSent: 0, totalFailed: 0 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Process delivery receipts in batches
 * @param {Array} receipts - Array of delivery receipts
 */
async function processDeliveryReceipts(receipts) {
    // Group receipts by campaign for batch updates
    const campaignUpdates = {};
    const logUpdates = [];
    
    // Process each receipt
    for (const receipt of receipts) {
        try {
            const { logId, messageId, status, campaignId } = receipt;
            
            // Queue communication log updates
            if (logId) {
                logUpdates.push({
                    updateOne: {
                        filter: { _id: logId },
                        update: {
                            $set: {
                                status,
                                vendorMessageId: messageId,
                                ...(status === 'SENT' ? { deliveredAt: new Date() } : {}),
                                ...(status === 'FAILED' ? { failedAt: new Date(), failureReason: receipt.failureReason || 'Unknown error' } : {})
                            }
                        }
                    }
                });
            }
            
            // Aggregate campaign stats for batch update
            if (campaignId) {
                if (!campaignUpdates[campaignId]) {
                    campaignUpdates[campaignId] = { sentCount: 0, failedCount: 0 };
                }
                
                if (status === 'SENT') {
                    campaignUpdates[campaignId].sentCount += 1;
                } else if (status === 'FAILED') {
                    campaignUpdates[campaignId].failedCount += 1;
                }
            }
        } catch (error) {
            console.error(`Error processing receipt for message ${receipt.messageId}:`, error);
        }
    }
    
    // Perform batched log updates
    if (logUpdates.length > 0) {
        try {
            const result = await CommunicationLog.bulkWrite(logUpdates);
            console.log(`Batch updated ${result.modifiedCount} communication logs`);
        } catch (error) {
            console.error('Error batch updating communication logs:', error);
        }
    }
    
    // Batch update campaigns
    for (const [campaignId, updates] of Object.entries(campaignUpdates)) {
        try {
            // Update campaign with incremental stats
            const updatedCampaign = await Campaign.findByIdAndUpdate(
                campaignId,
                {
                    $inc: {
                        sentCount: updates.sentCount,
                        failedCount: updates.failedCount
                    }
                },
                { new: true }
            );
            
            if (!updatedCampaign) {
                console.error(`Campaign ${campaignId} not found for update`);
                continue;
            }
            
            // Check if campaign is complete
            const totalProcessed = updatedCampaign.sentCount + updatedCampaign.failedCount;
            
            if (updatedCampaign.audienceSize > 0 && totalProcessed >= updatedCampaign.audienceSize) {
                await Campaign.findByIdAndUpdate(campaignId, { 
                    status: 'COMPLETED',
                    completedAt: new Date()
                });
                console.log(`Campaign ${campaignId} marked as completed`);
            }
        } catch (error) {
            console.error(`Error updating campaign ${campaignId}:`, error);
        }
    }
}

/**
 * Deliver campaign to all customers in the segment
 * @param {Object} campaign - Campaign object
 * @param {Object} segment - Segment object
 * @param {String} messageTemplate - Message template
 */
async function deliverCampaign(campaign, segment, messageTemplate) {
    try {
        // Build query based on segment rules
        const query = buildSegmentQuery(segment.rules);
        
        // Find matching customers
        const customers = await Customer.find(query);
        
        // Update campaign with audience size
        const updatedCampaign = await Campaign.findByIdAndUpdate(campaign._id, {
            audienceSize: customers.length
        }, { new: true });
        
        if (!updatedCampaign) {
            throw new Error(`Failed to update campaign ${campaign._id} with audience size`);
        }
        
        console.log(`Delivering campaign ${campaign.name} to ${customers.length} customers`);
        
        // Create all communication log entries in bulk for better persistence
        const logEntries = [];
        for (const customer of customers) {
            // Personalize message
            const personalizedMessage = messageTemplate.replace('{name}', customer.name);
            
            logEntries.push({
                campaignId: campaign._id,
                customerId: customer._id,
                message: personalizedMessage,
                status: 'PENDING',
                createdAt: new Date()
            });
        }
        
        // Bulk insert communication logs
        const savedLogs = await CommunicationLog.insertMany(logEntries);
        console.log(`Created ${savedLogs.length} communication log entries`);
        
        // Send messages with batched processing
        const batchSize = 10; // Process in batches of 10
        for (let i = 0; i < savedLogs.length; i += batchSize) {
            const batch = savedLogs.slice(i, i + batchSize);
            await Promise.all(batch.map(async (logEntry) => {
                try {
                    const customer = customers.find(c => c._id.toString() === logEntry.customerId.toString());
                    if (!customer) {
                        throw new Error(`Customer not found for log ${logEntry._id}`);
                    }
                    
                    // Send message via vendor API
                    await vendorService.sendMessage(
                        customer.phone,
                        logEntry.message,
                        customer._id,
                        campaign._id,
                        logEntry._id
                    );
                } catch (error) {
                    console.error(`Error sending message to customer for log ${logEntry._id}:`, error);
                    // Update log status to FAILED
                    await CommunicationLog.findByIdAndUpdate(logEntry._id, {
                        status: 'FAILED',
                        failedAt: new Date(),
                        failureReason: error.message
                    });
                }
            }));
        }
        
        // Update campaign status to COMPLETED if all messages were sent
        await Campaign.findByIdAndUpdate(campaign._id, { status: 'COMPLETED' });
    } catch (error) {
        console.error(`Error delivering campaign ${campaign._id}:`, error);
        // Update campaign status to ERROR
        await Campaign.findByIdAndUpdate(campaign._id, { status: 'ERROR' });
    }
}

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

// Helper function to build condition query for segment rules
function buildConditionQuery(condition) {
    const { field, operator, value } = condition;
    
    switch (operator) {
        case 'equals':
            return { [field]: value };
        case 'not_equals':
            return { [field]: { $ne: value } };
        case 'greater_than':
            // Handle numeric comparison for fields like totalSpend, visits
            return { [field]: { $gt: typeof value === 'string' ? Number(value) : value } };
        case 'less_than':
            return { [field]: { $lt: typeof value === 'string' ? Number(value) : value } };
        case 'contains':
            return { [field]: { $regex: value, $options: 'i' } };
        case 'not_contains':
            return { [field]: { $not: { $regex: value, $options: 'i' } } };
        case 'in':
            return { [field]: { $in: Array.isArray(value) ? value : [value] } };
        case 'not_in':
            return { [field]: { $nin: Array.isArray(value) ? value : [value] } };
        default:
            throw new Error(`Unsupported operator: ${operator}`);
    }
}

// Update campaign status
exports.updateCampaignStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        campaign.status = status;
        
        // Update timestamps based on status
        if (status === 'running') {
            campaign.startedAt = new Date();
        } else if (status === 'completed' || status === 'failed') {
            campaign.completedAt = new Date();
        }

        await campaign.save();

        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update campaign stats
exports.updateCampaignStats = async (req, res) => {
    try {
        const { stats } = req.body;
        const campaign = await Campaign.findById(req.params.id);

        if (!campaign) {
            return res.status(404).json({
                success: false,
                error: 'Campaign not found'
            });
        }

        // Update stats
        campaign.stats = {
            ...campaign.stats,
            ...stats
        };

        await campaign.save();

        res.status(200).json({
            success: true,
            data: campaign
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 