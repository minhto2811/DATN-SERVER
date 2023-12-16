const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Refunds = new Schema({
    userId: { type: String, require: true },
    billId: { type: String, require: true, unique: true }, //id đơn hàng bị hủy
    time: { type: Date, require: true, default: Date.now }, // thời gian yêu cầu hoàn trả, cập nhật cùng lúc khi thay đổi status
    status: { type: Number, default: 0, require: true }, // trạng thái -1 từ chối, 0 chờ xác nhận, 1 đã hoàn trả
    price: { type: Number, require: true },// tiền hoàn trả
}, {
    collection: "Refunds"
})




module.exports = mongoose.model('Refunds', Refunds) 