const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSubschema = new Schema({
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
    }
})

const userGymLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    email: {
        type: String,
        required: true
    },
    userlog: {
        type: [logSubschema],
        default: []
    }
});

module.exports = mongoose.model('UserSideGymLog', userGymLogSchema);