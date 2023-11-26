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
    shipping_method: { type: String, require: true },//phương thức vận chuyển
    payment_method: { type: String, require: true,default:"Thanh toán khi nhận hàng" },//phương thức thanh toán
    voucher: { type: Number },//giá trị voucher
    total_price: { type: Number, require: true },//tổng tiền thu
    import_total: { type: Number},//tổng tiền chi
    status: { type: Number, default: 0 },//trạng thái đơn
    note: { type: String },
    time: { type: Date, default: Date.now },
    cancel_order: { type: String },//lý do hủy đơn
    delete: { type: Boolean, require: true, default: false }
}, {
    collection: "Bill"
})



module.exports = mongoose.model('Bill', Bill) 