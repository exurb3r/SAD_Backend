const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const membershipStatusSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true,
        default: 'General Luna'
    },
    startDate: {
        type: Date
    },
    expiryDate: {
        type: Date
    },
    remainingDays: {
        type: Number
    },
    isActive: {
        type: Boolean,
        default: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
},{ _id: false });

const userSchema = new Schema({
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
        required: true,
        unique: true
    },
    contactNum: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    contactPersonNum: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    membershipStatus: [ membershipStatusSchema ],
    assignedTrainer: {
        type: String,
    },
    gymId: {    
        type: String,
        required: true,
        unique: true
    },
    rfid: {
        type: String,
        unique: true
    }
})

module.exports = mongoose.model('Users', userSchema);