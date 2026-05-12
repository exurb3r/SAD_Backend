const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const gymLogSchema = new Schema({
    firstname: {
        type: String,
        required: true 
    },
    lastname: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true
    }, 
    date: {
        type: Date,
        default: Date.now
    },
    timeIn: {
        type: String,
    },
    timeOut: {
        type: String,
    },
    branch: {
        type: String,
    },
    membershipCategory: {
        type: String,
    },
    dateKey: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('GymLog', gymLogSchema);