const mongoose = require("mongoose");

const listUser = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const listAdmin = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

const listTodos = new mongoose.Schema({
    todoname: {
        type: String,
        required: true
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

const listSchema = new mongoose.Schema({
    listname: {
        type: String,
        required: true,
        minlength: 3
    },
    admins: [listAdmin],
    users: [listUser],
    todos: [listTodos],
    edit: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {collection: "lists"});

module.exports = mongoose.model("List", listSchema);