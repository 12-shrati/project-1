const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId


const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    authorId: {
        type: ObjectId,
        required: true,
        ref: 'author'
    },

    tags: [{ type: String, trim: true }],
    catogory: {
        type: String,
        trim: true,
        required: true
    },
    subCatogory: [{ type: String, trim: true }],

    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },

    isPublished: {
        type: Boolean,
        Default: false
    },
    publishedAt: {
        type: Date,
        default: null
    }



}, { timestamps: true })

module.exports = mongoose.model('blog', blogSchema)