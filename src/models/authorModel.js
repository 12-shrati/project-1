const mongoose = require("mongoose")


const authorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        enum: ["Mr", "Mrs", "Miss"],
        trim: true
    },
    email: {
        type: String,
        required: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    }

}, { timestamps: true })

module.exports = mongoose.model('author', authorSchema)