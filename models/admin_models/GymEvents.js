const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSubSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const gymEventsSchema = new Schema({
    event: [eventSubSchema]
});

module.exports = mongoose.model('GymEvents', gymEventsSchema);