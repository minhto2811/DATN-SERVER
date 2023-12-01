const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Notification = new Schema({
    userId: { type: String },
    title: { type: String, require: true },
    body: { type: String, require: true },
    image: { type: String, require: true },
    seen: { type: Boolean, default: false },
    route: { type: String, require: true, default: 'Buttomnavigation' },// có thể trống => điều hướng ứng dụng
    time: { type: Date, default: Date.now, index: { expires: 2592000 } },
    productId: { type: String },// có thể trống
    variationId: { type: String },// có thể trống
    billId: { type: String },// có thể trống
}, {
    collection: "Notification"
})



module.exports = mongoose.model('Notification', Notification) 