const mongoose = require('mongoose')
const Schema = mongoose.Schema



const TypeProduct = new Schema({
    image: { type: String, require: true },
    name: { type: String, require: true, unique: true },
    delete: { type: Boolean, default: false },
    time: { type: Date, default: Date.now }
}, {
    collection: "TypeProduct" 
})



module.exports = mongoose.model('TypeProduct', TypeProduct) 