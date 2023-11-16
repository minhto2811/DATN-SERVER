
const Variations = require('../../model/variations')
const Product = require('../../model/product')
const Cart = require('../../model/cart')

class ApiController {
    async getAll(req, res) {
        const username = req.body.username
        try {
            const carts = await Cart.find({ username: username }).lean()
            if (!carts) {
                throw "Không lấy được danh sách giỏ hàng"
            }
            var rs = []
            await Promise.all(carts.map(async (item) => {
                const variations = await Variations.findOne({ _id: item.variations_id, delete: false })
                if (!variations)
                    return
                const product = await Product.findOne({ _id: variations.productId, delete: false })
                if (!product)
                    return
                item.price = variations.price
                item.image = variations.image
                item.product_name = product.product_name
                item.brand_name = product.brand_name
                item.percent_discount = product.percent_discount
                rs.push(item)
            }))

            res.json(rs)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async add(req, res) {
        const data = req.body
        try {
            const variations = await Variations.findOne({ _id: data.variations_id, delete: false })
            if (!variations) {
                throw "Biến thể không tồn tại"
            }
            const cart = await Cart.create(data)
            if (!cart) {
                throw "Thêm giỏ hàng thất bại"
            }
            res.json(cart)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async delete(req, res) {
        const listIdCart = req.body.listIdCart
        const username = req.body.username
        try {
            const del = await Cart.deleteMany({ username: username, _id: { $in: listIdCart } })
            console.log("Đã xóa giỏ hàng: ", del.deletedCount)
            res.json(del.deletedCount) //trả về số lượng bản ghi đã xóa 
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async update(req, res) {
        const cart_id = req.body.cart_id
        const quantity = req.body.quantity
        try {
            const cart = await Cart.findOneAndUpdate({ _id: cart_id }, { $set: { quantity: quantity } })
            if (!cart) {
                throw ""
            }
            res.json({ code: 200, message: "Cập nhật giỏ hàng thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }
}









module.exports = new ApiController;