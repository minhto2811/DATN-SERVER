
const Favorite = require('../../model/favorite')
const Product = require('../../model/product')
const Brand = require('../../model/brand')
const Variations = require('../../model/variations')
const Description = require('../../model/description')
const TypeProduct = require('../../model/typeProduct')

class ApiController {
    async add(req, res) {
        const userId = req.body.userId
        const productId = req.body.productId
        try {
            res.json({ code: 200, message: "Thêm sản phẩm yêu thích thành công" })
            const favoriteFind = await Favorite.findOne({ userId: userId, productId: productId })
            if (!favoriteFind) await Favorite.create({ userId: userId, productId: productId })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Thêm sản phẩm yêu thích thất bại" })
        }
    }

    async getAll(req, res) {
        const userId = req.body.userId
        try {
            const favorite = await Favorite.find({ userId: userId })
            if (favorite.length == 0) return res.json([])
            var list_favorite = []
            await Promise.all(favorite.map(async (item) => {
                let product = await Product.find({ _id: item.productId, delete: false }).lean()
                if (!product) return
                await Promise.all([
                    (async () => {
                        const type_product = await TypeProduct.findById(product.product_type_id)
                        if (type_product) product.product_type = type_product.name
                    })(),
                    (async () => {
                        if (!item.brand_id) {
                            return
                        }
                        const brand = await Brand.findById(product.brand_id)
                        if (brand) {
                            product.brand_name = brand.brand
                            product.brand_logo = brand.image
                        }
                    })(),
                ])
                list_favorite.push(product)
            }))
            res.json(list_favorite)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async delete(req, res) {
        const userId = req.body.userId
        const productId = req.body.productId
        try {
            res.json({ code: 200, message: "Xóa dữ liệu thành công" })
            await Favorite.findOneAndDelete({ userId: userId, productId: productId })
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async check(req, res) {
        const userId = req.body.userId
        const productId = req.body.productId
        try {
            const favorite = await Favorite.findOne({ userId: userId, productId: productId })
            res.json(!(!favorite))
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }
}









module.exports = new ApiController;