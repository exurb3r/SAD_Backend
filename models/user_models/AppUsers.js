const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const membershipStatusSchema = new Schema({
    category: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    startDate: {
        type: Date
    },
    expiryDate: {
        type: Date
    },
    remainingDays: {
        type: Number
    }
},  { _id: false });

const appUserSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    membershipStatus: [ membershipStatusSchema ],
    role: {
        type: Number,
        required: true,
        default: 420
    },
    joinDate: {
         type: Date,
         default: Date.now 
    },
    status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
    }
    })

module.exports = mongoose.model('AppUsers', appUserSchema);