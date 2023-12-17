const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Brand = new Schema({
    brand: { type: String, require: true, unique: true },
    image: { type: String, require: true },
    description: { type: String },
    delete: { type: Boolean, default: false },
    time: { type: Date, default: Date.now }
}, {
    collection: "Brand"
})



module.exports = mongoose.model('Brand', Brand) 