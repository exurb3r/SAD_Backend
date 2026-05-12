const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
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
    contactNum: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('Admins', adminSchema);