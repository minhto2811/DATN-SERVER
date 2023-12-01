const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Token = new Schema({
    userId: { type: String, require: true },
    token: { type: String, require: true },
}, {
    collection: "Token"
})




module.exports = mongoose.model('Token', Token) 