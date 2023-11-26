const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Address = new Schema({
    userId: { type: Schema.ObjectId, require: true },
    fullname: { type: String, require: true },
    numberphone: { type: String, require: true },
    address: { type: String, require: true },
    time: { type: Date, default: Date.now },
}, {
    collection: "Address"
})

module.exports = mongoose.model('Address', Address) 