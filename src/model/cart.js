const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Cart = new Schema({
    userId: { type: Schema.ObjectId, require: true },
    variations_id: { type: String, required: true },
    quantity: { type: Number, default: 1, required: true },
}, {
    collection: "Cart"
})



module.exports = mongoose.model('Cart', Cart) 