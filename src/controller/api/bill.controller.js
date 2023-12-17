
const Product = require('../../model/product')
const Bill = require('../../model/bill')
const Cart = require('../../model/cart')
const Voucher = require('../../model/voucher')
const Variations = require('../../model/variations')
const Refunds = require('../../model/refunds')
const Shipping = require('../../model/shipping')
class ApiController {
    async createBill(req, res) {
        try {
            var data = req.body
            let import_total = 0
            let total_price = 0
            var listCart = []
            await Promise.all([
                (() => {
                    if (typeof data.address === "string") throw "Vui lòng nhập đúng địa chỉ?"
                    delete data.address._id
                    delete data.address.__v
                    delete data.address.time
                })(),
                (async () => {
                    const shipping = await Shipping.findById(data.shipping_id)
                    if (!shipping) throw "Không tìm thấy phương thức vận chuyển"
                    data.shipping_method = shipping.code
                    data.transport_fee = shipping.price
                })(),
                (async () => {
                    if (!data.listIdCart || data.listIdCart.length == 0) throw "Hãy chọn ít nhất 1 sản phẩm trong giỏ hàng"
                    listCart = await Cart.find({ _id: { $in: data.listIdCart } })
                    if (listCart.length == 0) throw "Hãy chọn ít nhất 1 sản phẩm trong giỏ hàng"
                })()
            ])


            data.proudutcs = []
            var variationsUpdate = []
            data.products = []
            await Promise.all(listCart.map(async (item) => {
                const variations_id = item.variations_id
                const variations = await Variations.findById(variations_id)
                if (!variations) throw "Không tìm thấy biến thể"
                if (variations.quantity < 1) throw "Số lượng biến thể nhỏ hơn 1"
                if (variations.quantity < item.quantity) throw `Số lượng sản phẩm không đủ ${variations._id}`
                const product = await Product.findById(variations.productId)
                if (!product) throw "Không tìm thấy sản phẩm"
                const price_item = variations.price * (1 - product.percent_discount / 100)
                data.products.push({
                    variations_id: variations_id,
                    price: price_item,
                    quantity: item.quantity
                })
                variations.quantity -= item.quantity
                variationsUpdate.push(variations)
                import_total += variations.import_price * item.quantity
                total_price += item.quantity * price_item
            }))


            if (data.voucher_id != null) {
                data.voucher = 0
                const voucher = await Voucher.findOne({ _id: data.voucher_id, userId: data.userId, used: false, expiration_date: { $gte: new Date() } })
                if (!voucher) throw "Voucher không hợp lệ"
                if (voucher.condition > (total_price + data.transport_fee)) throw "Voucher không phù hợp với hóa đơn này"
                if (voucher.type == 0) {
                    if (voucher.discount_type == 0) {
                        data.voucher =  data.transport_fee > voucher.discount_value  ? voucher.discount_value  :  voucher.transport_fee 
                    } else {
                        data.voucher = data.transport_fee * voucher.discount_value / 100
                    }
                } else {
                    if (voucher.discount_type == 0) {
                        data.voucher = total_price > voucher.discount_value  ? voucher.discount_value  :  total_price
                    } else {
                        data.voucher = total_price * voucher.discount_value / 100
                    }
                }
                total_price = total_price + data.transport_fee - data.voucher
                delete data.voucher_id
                await voucher.updateOne({ $set: { used: true } })
            } else {
                total_price += data.transport_fee
            }
            data.total_price = total_price
            data.import_total = import_total
            const bill = await Bill.create(data)
            if (!bill) throw "Tạo hóa đơn thất bại"
            res.json({ billId: bill._id })
            await Promise.all(variationsUpdate.map(async (item) => {
                return item.save()
            }))
            await Cart.deleteMany({ _id: { $in: data.listIdCart } })
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async updateStatusPayment(req, res) {
        try {
            const { billId, status } = req.body
            const response = await Bill.findByIdAndUpdate(billId, { $set: { payment_status: status } })
            if (!response) throw "Cập nhật thất bại"
            res.json({ code: 200, message: "Cập nhật trạng thái thanh toán thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async detail(req, res) {
        try {
            const id = req.params.id
            const bill = await Bill.findOne({ _id: id, delete: false }).lean()
            if (!bill) throw "Không tìm thấy hóa đơn"
            await Promise.all(bill.products.map(async (i) => {
                const variations = await Variations.findById(i.variations_id)
                if (variations) {
                    i.ram = variations.ram
                    i.rom = variations.rom
                    i.image = variations.image
                    const product = await Product.findById(variations.productId)
                    if (product) i.product_name = product.product_name
                }
            }))
            res.json(bill)
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async getByStatus(req, res) {

        try {
            const userId = req.body.userId
            const status = req.params.status
            const bills = await Bill.find({ userId: userId, status: status, delete: false }).sort({ time: -1 }).lean()
            if (!bills) throw "Không tìm thấy danh sách hóa đơn của bạn"
            res.json(bills)
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async getAll(req, res) {
        try {
            const userId = req.body.userId
            const bills = await Bill.find({ userId: userId, delete: false }).sort({ time: -1 }).lean()
            if (!bills) throw "Không tìm thấy danh sách hóa đơn của bạn"
            res.json(bills)
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async cancelBill(req, res) {
        try {
            const id_bill = req.body.id_bill
            const userId = req.body.userId
            const cancel_order = req.body.cancel_order
            const bill = await Bill.findOne({ userId: userId, _id: id_bill })
            if (!bill) throw "Không tìm thấy hóa đơn"
            if (bill.status != 0) throw "Đơn hàng không thể hùy"
            bill.status = -1
            bill.cancel_order = cancel_order
            res.json({ code: 200, message: "Hủy đơn thành công" })
            bill.save()
            await Promise.all([(async () => {
                bill.products.map(async (item) => {
                    const variations = await Variations.findById(item.variations_id)
                    if (variations) {
                        variations.quantity += item.quantity
                        return variations.save()
                    }
                })
            })(),
            (async () => {
                if (bill.payment_method == 1 && bill.payment_status == 1) {
                    const refunds = {
                        userId: bill.userId,
                        billId: bill._id,
                        price: bill.total_price - bill.transport_fee
                    }
                    Refunds.create(refunds)
                }
            })()
            ])

        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }
}


module.exports = new ApiController;