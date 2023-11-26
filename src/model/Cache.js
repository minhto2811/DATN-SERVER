const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Cache = new Schema({
    userId: { type: Schema.ObjectId, require: true },
    productId: { type: Schema.ObjectId, require: true },
    varitationId: { type: Schema.ObjectId, require: true },
    time: { type: Date, default: Date.now, index: { expires: '14d' } }
}, {
    collection: "Cache"
})



module.exports = mongoose.model('Cache', Cache) 