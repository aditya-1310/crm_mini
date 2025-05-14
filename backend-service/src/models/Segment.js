const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Segment name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    rules: {
        type: Object,
        required: [true, 'Segment rules are required']
    },
    audienceSize: {
        type: Number,
        default: 0
    },
    lastCalculated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Segment', segmentSchema); 