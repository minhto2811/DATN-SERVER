const mongoose = require('mongoose')
const Schema = mongoose.Schema



const TypeProduct = new Schema({
    image: { type: String, require: true },
    name: { type: String, require: true, unique: true },
    time: { type: Date, default: Date.now }
}, {
    collection: "TypeProduct" 
})



module.exports = mongoose.model('TypeProduct', TypeProduct) 