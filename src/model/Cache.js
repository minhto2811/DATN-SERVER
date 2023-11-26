const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Cache = new Schema({
    userId: { type: String, require: true },
    productId:{ type: String, require: true },
    varitationId:{ type: String, require: true },
    time: { type: Date, default: Date.now, index: { expires: '14d' } }
}, {
    collection: "Cache"
})



module.exports = mongoose.model('Cache', Cache) 