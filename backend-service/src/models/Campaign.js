const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a campaign name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    segmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Segment',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [500, 'Message cannot be more than 500 characters']
    },
    status: {
        type: String,
        enum: ['DRAFT', 'PROCESSING', 'COMPLETED', 'ERROR'],
        default: 'DRAFT'
    },
    audienceSize: {
        type: Number,
        default: 0
    },
    sentCount: {
        type: Number,
        default: 0
    },
    failedCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Campaign', CampaignSchema); 