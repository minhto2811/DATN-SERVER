const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Shipping = new Schema({
    code:{type: Number, require: true, unique: true},
    name: { type: String, require: true, unique: true },
    price: { type: Number, require: true }
}, {
    collection: "Shipping"
})




module.exports = mongoose.model('Shipping', Shipping) 