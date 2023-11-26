const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Favorite = new Schema({
    userId: { type: Schema.ObjectId, require: true },
    product_id: { type: String, require: true }
}, {
    collection: "Favorite"
})



module.exports = mongoose.model('Favorite', Favorite) 