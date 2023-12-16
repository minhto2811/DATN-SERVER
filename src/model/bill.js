const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Bill = new Schema({
    userId: { type: Schema.ObjectId, require: true },
    address: { type: Object, require: true },
    products: [{
        variations_id: { type: String, required: true },
        price: { type: Number, require: true },
        quantity: { type: Number, default: 1, required: true }
    }],
    transport_fee: { type: Number, require: true, default: 0 },//tiền vận chuyển
    shipping_method: { type: Number, require: true, default: 0 },//phương thức vận chuyển
    payment_method: { type: Number, require: true, default: 0 },// 0 "Thanh toán khi nhận hàng",1 momo
    payment_status: { type: Number, require: true, default: 0 }, // trạng thái thanh toán 0 chưa thanh toán, 1 đã thanh toán
    voucher: { type: Number, default: 0 },//giá trị voucher
    total_price: { type: Number, require: true },//tổng tiền thu
    import_total: { type: Number },//tổng tiền chi
    status: { type: Number, default: 0 },//trạng thái đơn
    refund: { type: Number, default: 0 },//trạng thái hoàn tiền
    note: { type: String },
    time: { type: Date, default: Date.now },
    cancel_order: { type: String },//lý do hủy đơn
    delete: { type: Boolean, require: true, default: false }
}, {
    collection: "Bill"
})



module.exports = mongoose.model('Bill', Bill) 