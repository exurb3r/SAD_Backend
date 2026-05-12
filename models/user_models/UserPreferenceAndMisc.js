const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {  
        type: String,
    }
});

const UserPrefAndMiscSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }, 
    pfp:{
        type: String
    },
    theme: {
        type: String,
        default: 'light'
    },
    sharing: {
        type: Boolean,
        default: true
    },
    motto: {
        type: String,
    },
    notifications: [ notificationSchema ]
});

module.exports = mongoose.model('UserPreferenceAndMisc', UserPrefAndMiscSchema);