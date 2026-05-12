const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSubSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String,
        required: true
    },
    contents: {
        type: String,
        required: true
    }
})

const gymCommunityPostSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    post: [ postSubSchema ]
})

module.exports = mongoose.model('GymCommunityPost', gymCommunityPostSchema);