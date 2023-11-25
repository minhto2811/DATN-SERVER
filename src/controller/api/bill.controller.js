
const Product = require('../../model/product')
const Bill = require('../../model/bill')
const Cart = require('../../model/cart')
const Voucher = require('../../model/voucher')
const Variations = require('../../model/variations')
const Address = require('../../model/address')
const Shipping = require('../../model/shipping')
class ApiController {
    async createBill(req, res) {
        try {
            var data = req.body
            const listCart = await Cart.find({ _id: { $in: data.listIdCart } })
            if (!listCart || listCart.length == 0) throw "Không tìm thấy sản phẩm"
            let total_price = 0
            await Promise.all([
                (async () => {
                    const address = await Address.findById(data.address).lean()
                    if (!address) throw "Không tìm thấy địa chỉ"
                    delete address._id
                    delete address.__v
                    delete address.time
                    data.address = address
                })(),
                (async () => {
                    const shipping = await Shipping.findById(data.shipping_id)
                    if (!shipping) throw "Không tìm thấy phương thức vận chuyển"
                    delete data.shipping_id
                    data.shipping_method = shipping.name
                    data.transport_fee += shipping.price
                })()
            ])


            data.proudutcs = []
            var variationsUpdate = []
            data.products = []
            await Promise.all(listCart.map(async (item) => {
                const variations_id = item.variations_id
                const variations = await Variations.findById(variations_id)
                if (!variations) {
                    throw "Không tìm thấy biến thể"
                }
                if (variations.quantity < 1) {
                    throw "Số lượng biến thể nhỏ hơn 1"
                }
                if (variations.quantity < item.quantity) {
                    throw `Số lượng sản phẩm không đủ ${variations._id}`
                }
                const product = await Product.findById(variations.productId)
                if (!product) {
                    throw "Không tìm thấy sản phẩm"
                }
                data.products.push({
                    variations_id: variations_id,
                    price: variations.price,
                    quantity: item.quantity
                })
                variations.quantity -= item.quantity
                variationsUpdate.push(variations)
                total_price += item.quantity * variations.price * product.percent_discount
            }))


            if (data.voucher_id != null) {
                data.voucher = 0
                const voucher = await Voucher.findOne({ _id: data.voucher_id, userId: data.userId, used: false, expiration_date: { $gte: new Date() } })
                if (!voucher) {
                    throw "Voucher không hợp lệ"
                }
                if (voucher.condition > (total_price + data.transport_fee)) {
                    throw "Voucher không phù hợp với hóa đơn này"
                }

                if (voucher.type == 0) {
                    if (voucher.discount_type == 0) {
                        data.voucher = data.transport_fee - voucher.discount_value
                    } else {
                        data.voucher = data.transport_fee * voucher.discount_value / 100
                    }
                } else {
                    if (voucher.discount_type == 0) {
                        data.voucher = total_price - voucher.discount_value
                    } else {
                        data.voucher = total_price * voucher.discount_value / 100
                    }
                }
                total_price = total_price + data.transport_fee - data.voucher
                delete data.voucher_id
                await Voucher.deleteOne({ _id: data.voucher_id })
            } else {
                total_price += data.transport_fee
            }
            data.total_price = total_price
            const bill = await Bill.create(data)
            if (!bill) {
                throw "Tạo hóa đơn thất bại"
            }

            await Promise.all(variationsUpdate.map(async (item) => {
                return item.save()
            }))
            await Cart.deleteMany({ _id: { $in: data.listIdCart } })
            delete data.listIdCart
            res.json({ message: "Đơn hàng của bạn đã tồn tại trên hệ thống" })
        } catch (error) {
            console.log(error)
            res.json(error)
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
                    if (product) {
                        i.product_name = product.product_name
                    }
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
            const bills = await Bill.find({ userId: userId, status: status, delete: false }).lean()
            if (!bills) {
                throw "Không tìm thấy danh sách hóa đơn của bạn"
            }
            console.log(bills)
            await Promise.all(bills.map(async (item) => {
                await Promise.all(item.products.map(async (i) => {
                    console.log(i.variations_id)
                    const variations = await Variations.findById(i.variations_id)
                    if (variations) {
                        i.ram = variations.ram
                        i.rom = variations.rom
                        i.image = variations.image
                        console.log(variations.productId)
                        const product = await Product.findById(variations.productId)
                        if (product) {
                            i.product_name = product.product_name
                        }
                    }
                }))
            }))

            res.json(bills)
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async getAll(req, res) {

        try {
            const userId = req.body.userId
            const bills = await Bill.find({ userId: userId, delete: false }).lean()
            if (!bills) {
                throw "Không tìm thấy danh sách hóa đơn của bạn"
            }
            console.log(bills)
            await Promise.all(bills.map(async (item) => {
                await Promise.all(item.products.map(async (i) => {
                    console.log(i.variations_id)
                    const variations = await Variations.findById(i.variations_id)
                    if (variations) {
                        i.ram = variations.ram
                        i.rom = variations.rom
                        i.image = variations.image
                        console.log(variations.productId)
                        const product = await Product.findById(variations.productId)
                        if (product) {
                            i.product_name = product.product_name
                        }
                    }
                }))
            }))

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
            if (!bill) {
                throw "Không tìm thấy hóa đơn"
            }
            if (bill.status != 0)
                throw "Đơn hàng không thể hùy"
            bill.status = -1
            bill.cancel_order = cancel_order
            await bill.save()
            res.json({ code: 200, message: "Hủy đơn thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }
}









module.exports = new ApiController;