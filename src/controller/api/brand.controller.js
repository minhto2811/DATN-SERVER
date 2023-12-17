require('dotenv').config()
const Product = require('../../model/product')
const Brand = require('../../model/brand')
const TypeProduct = require('../../model/typeProduct')
class ApiController {
    async getAll(req, res) {
        try {
            const brand = await Brand.find({ delete: false }).sort({ brand_name: 1 }).lean()
            res.json(brand)
        } catch (error) {
            console.log(error)
            res.json(error)
        }

    }


    async brand(req, res) {
        const brand_name = req.params.name
        try {
            const brand = await Brand.findOne({ brand: brand_name })
            res.json(brand)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async getBtBrand(req, res) {
        try {
            const brand_id = req.params.brand_id
            const products = await Product.find({ brand_id: brand_id, delete: false }).sort({ time: -1 }).lean()
            if (products.length == 0) return res.json([])
            await Promise.all(products.map(async (item) => {
                await Promise.all([
                    (async () => {
                        const type_product = await TypeProduct.findById(item.product_type_id)
                        if (type_product) item.product_type = type_product.name
                    })(),
                    (async () => {
                        if (!item.brand_id) {
                            return
                        }
                        const brand = await Brand.findById(item.brand_id)
                        if (brand) item.brand_name = brand.brand
                    })(),
                    (() => {
                        delete item.delete
                    })()
                ])
            }))
            res.json(products)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

}








module.exports = new ApiController;