const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Comment = new Schema({
    userId: { type: Schema.ObjectId, require: true },
    productId: { type: Schema.ObjectId, require: true },
    varitationId: { type: Schema.ObjectId, require: true },
    content: { type: String, require: true },
    numStar: { type: Number, require: true },
    image: [{ type: String }]
}, {
    collection: "Comment"
})



module.exports = mongoose.model('Comment', Comment) 