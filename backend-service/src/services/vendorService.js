/**
 * Vendor API Service
 * 
 * This simulates a third-party messaging vendor API
 * with realistic success/failure rates.
 */

const axios = require('axios');
const config = require('../config/config');

// In-memory queue for handling delivery receipts
const messageQueue = [];
let processingQueue = false;

/**
 * Simulates sending a message via vendor API
 * @param {string} phoneNumber - Customer's phone number
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Response with message ID and status
 */
exports.sendMessage = async (phoneNumber, message, customerId, campaignId, logId) => {
    try {
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));
        
        // Generate a unique message ID
        const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
        
        // Simulate 90% success rate
        const isSuccess = Math.random() <= 0.9;
        
        // Prepare the response
        const response = {
            messageId,
            status: isSuccess ? 'SENT' : 'FAILED',
            customerId,
            campaignId,
            logId
        };
        
        // Queue delivery receipt to be sent back asynchronously
        // This simulates the vendor's callback to our webhook
        setTimeout(() => {
            queueDeliveryReceipt(response);
        }, Math.random() * 2000 + 1000); // 1-3 seconds delay
        
        return {
            messageId,
            status: 'ACCEPTED', // Initial status is always ACCEPTED
            customerId,
            campaignId
        };
    } catch (error) {
        console.error('Vendor API Error:', error);
        return {
            status: 'FAILED',
            error: error.message,
            customerId,
            campaignId
        };
    }
};

/**
 * Queue a delivery receipt for batch processing
 * @param {Object} receipt - Delivery receipt data
 */
function queueDeliveryReceipt(receipt) {
    messageQueue.push(receipt);
    
    // If we're not already processing the queue, start processing
    if (!processingQueue) {
        processReceiptQueue();
    }
}

/**
 * Process the receipt queue in batches
 */
async function processReceiptQueue() {
    if (messageQueue.length === 0) {
        processingQueue = false;
        return;
    }
    
    processingQueue = true;
    
    // Take up to 10 messages from the queue
    const batch = messageQueue.splice(0, 10);
    
    try {
        // Call our delivery receipt API to update statuses
        await axios.post(`${config.apiBaseUrl}/api/campaigns/delivery-receipts`, {
            receipts: batch
        });
        
        console.log(`Processed ${batch.length} delivery receipts`);
    } catch (error) {
        console.error('Failed to process delivery receipts:', error);
        // Put the failed batch back in the queue to retry
        messageQueue.unshift(...batch);
    }
    
    // Continue processing the queue after a short delay
    setTimeout(processReceiptQueue, 1000);
} 