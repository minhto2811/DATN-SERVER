const mongoose = require('mongoose')
const Schema = mongoose.Schema

// const currentDate = new Date();
// const expirationDate = new Date(currentDate);
// expirationDate.setDate(currentDate.getDate() + 30);

const Voucher = new Schema({
    userId: { type: String },
    code: { type: String, require: true },
    all: { type: Boolean, default: false },
    condition: { type: Number, default: 0, require: true },// Điều kiện sử dụng, giá trị hóa đơn bao gồm phí vận chuyển
    type: { type: Number, require: true }, // 0 là giảm tiền ship, 1 giảm giá sản phẩm
    discount_type: { type: Number, require: true }, // 0 giảm tiền mặt, 1 giảm phần trăm
    discount_value: { type: Number, required: true },
    used: { type: Boolean, require: true, default: false },// đã sử dụng 
    description: { type: String, require: true },
    release_date: { type: Date, default: Date.now },
    expiration_date: { type: Date, require: true }, //ngày hết hạn
}, {
    collection: "Voucher"
})

Voucher.index({ "expiration_date": 1 }, { expireAfterSeconds: 0 });


module.exports = mongoose.model('Voucher', Voucher) 