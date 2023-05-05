const mongoose = require("mongoose");

const userInvites = new mongoose.Schema({
    listid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    listname: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: true
    },
    from: {
        type: String,
        required: true
    }
});

const todoSchema = new mongoose.Schema({
    todoname: {
        type: String,
        required: true,
        minlength: 3
    },
    finished: {
        type: Boolean,
        default: false
    },
    edit: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5
    },
    todos: [todoSchema],
    invites: [userInvites],
    verified: {
        type: Boolean,
        required: true,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {collection: "users"});

module.exports = mongoose.model("User", userSchema);