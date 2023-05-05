const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {collection: "tokens"});

module.exports = mongoose.model("Token", tokenSchema);