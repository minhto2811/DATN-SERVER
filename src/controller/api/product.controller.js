require('dotenv').config()
const Product = require('../../model/product')
const Brand = require('../../model/brand')
const Variations = require('../../model/variations')
const Description = require('../../model/description')
const TypeProduct = require('../../model/typeProduct')
const Favorite = require('../../model/favorite')
const { json } = require('express')
class ApiController {
    async getAll(req, res) {
        try {
            const products = await Product.find({ delete: false }).sort({ time: -1 }).lean()
            if (!products) throw "Không tìm thấy sản phẩm"
            await Promise.all(products.map(async (item) => {
                await Promise.all([
                    (async () => {
                        const type_product = await TypeProduct.findById(item.product_type_id)
                        if (type_product) {
                            item.product_type = type_product.name
                        }
                    })(),
                    (async () => {
                        if (!item.brand_id) {
                            return
                        }
                        const brand = await Brand.findById(item.brand_id)
                        if (brand) {
                            item.brand_name = brand.brand
                        }
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
    async getItem(req, res) {
        try {
            const productId = req.params.id
            const product = await Product.findOne({ _id: productId, delete: false }).lean()
            if (!product) {
                throw "Không tìm thấy sản phẩm"
            }
            delete product.delete
            product.total_quantity = 0
            await Promise.all([
                (async () => {
                    const variations = await Variations.find({ productId: productId, delete: false, quantity: { $gt: 0 } }).lean()
                    if (variations) {
                        variations.forEach((item) => {
                            delete item.productId
                            delete item.__v
                            delete item.delete
                            product.total_quantity += item.quantity
                        })
                        product.variations = variations
                    }
                })(),
                (async () => {
                    const type_product = await TypeProduct.findById(product.product_type_id)
                    if (type_product) {
                        product.product_type = type_product.name
                    }
                })(),
                (async () => {
                    if (!product.brand_id) {
                        return
                    }
                    const brand = await Brand.findById(product.brand_id)
                    if (brand) {
                        product.brand_name = brand.brand
                        product.brand_logo = brand.image
                    }
                })(),
                (async () => {
                    const userId = req.body.userId
                    if (userId) {
                        const favorite = await Favorite.findOne({ userId: userId, productId: productId })
                        product.like = favorite != null
                    }
                })(),
                (async () => {
                    const description = await Description.find({ id_follow: productId }).lean()
                    if (description) {
                        description.forEach((item) => {
                            delete item._id
                            delete item.id_follow
                            delete item.__v
                        })
                        product.description = description
                    }
                })(),
            ])
            delete product.__v
            res.json(product)
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Lấy dữ liệu thất bại" })
        }
    }

    async search(req, res) {
        const query_text = req.query.query_text
        const min_price = req.query.min_price
        const max_price = req.query.max_price
        console.log(query_text, min_price, max_price)
        var array = []
        try {
            if (query_text) {
                const products_text = await Product.find({
                    $or: [
                        { product_name: { '$regex': query_text, '$options': 'i' } },
                        { brand_name: { '$regex': query_text, '$options': 'i' } },
                        { description: { '$regex': query_text, '$options': 'i' } }]
                })
                if (!products_text) {
                    throw "Lọc theo text thất bại"
                }
                array.concat(products_text)
            }

            if (!min_price && !max_price) {
                const products_prict = await Product.find({
                    default_price: { $gte: min_price },
                    max_price: { $lte: max_price }
                })
                if (!products_prict) {
                    throw "Lọc theo giá thất bại"
                }
                array.concat(products_prict)
            }
            res.json({ code: 200, message: "Lọc thành công", array })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async getVariation(req, res) {
        try {
            const variationId = req.params.id
            const variation = await Variations.findOne({ _id: variationId, delete: false })
            if (!variation) throw "Sản phầm ngừng kinh doanh"
            const product = await Product.findOne({ _id: variation.productId, delete: false })
            if (!product) throw "Sản phầm ngừng kinh doanh"
            variation.productName = product.product_name
            res.json(variation)
        } catch (error) {
            console.log(error)
            res.json(json)
        }
    }

    async related(req, res) {
        try {
            const productId = req.params.id
            const product = await Product.findById(productId)
            if (!product) throw "Không tìm thấy sản phẩm"
            const listProduct = await Product.find({ _id: { $ne: productId }, product_type_id: product.product_type_id, brand_id: product.brand_id })
            console.log(listProduct)
            res.json(listProduct)
        } catch (error) {
            console.log(error)
            res.json(error)
        }

    }

}








module.exports = new ApiController;