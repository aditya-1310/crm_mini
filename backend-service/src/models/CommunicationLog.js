const mongoose = require('mongoose');

const CommunicationLogSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'FAILED'],
        default: 'PENDING'
    },
    vendorMessageId: {
        type: String
    },
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    failedAt: {
        type: Date
    },
    failureReason: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CommunicationLog', CommunicationLogSchema); 