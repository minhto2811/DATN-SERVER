const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Favorite = new Schema({
    userId: { type: String, require: true },
    productId: { type: String, require: true }
}, {
    collection: "Favorite"
})



module.exports = mongoose.model('Favorite', Favorite) 