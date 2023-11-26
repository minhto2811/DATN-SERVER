const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Message = new Schema({
    roomId: { type: Schema.ObjectId, require: true },
    userId: { type: String, require: true },
    text: { type: String },
    image: [{ type: String }],
    time: { type: Date, default: Date.now, index: { expires: '30d' } },
}, {
    collection: "Message"
})



module.exports = mongoose.model('Message', Message) 