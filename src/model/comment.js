const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Comment = new Schema({
    userId: { type: String, require: true },
    productId: { type: String, require: true },
    varitationId: { type: String, require: true },
    content: { type: String, require: true },
    numStar: { type: Number, require: true },
    image: [{ type: String }]
}, {
    collection: "Comment"
})



module.exports = mongoose.model('Comment', Comment) 