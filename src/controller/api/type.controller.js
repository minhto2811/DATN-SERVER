require('dotenv').config()
const Product = require('../../model/product')
const TypeProduct = require('../../model/typeProduct')
const { uploadImage, deleteImage } = require('../../utils/uploadImage')
const Brand = require('../../model/brand')

class ApiController {
    async getAll(req, res) {
        try {
            const type_product = await TypeProduct.find({delete: false})
            if (!type_product)
                throw "Không tìm thấy loại sản phẩm"
            res.json(type_product)
        } catch (error) {
            console.log(error)
            res.json(error)
        }

    }


    async getByType(req, res) {
        const product_type_id = req.params.product_type_id
        try {
            const products = await Product.find({ product_type_id: product_type_id }).sort({ time: -1 }).lean()
            if (!products) {
                throw "Không tìm thấy sản phẩm"
            }
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

    async add(req, res) {
        try {
            const data = req.body
            if (req.file != null && req.file != undefined) {
                const filename = req.file.filename;
                const filepath = req.file.path;
                const url = await uploadImage(filepath, filename);
                data.image = url;
            }
            const type_product = await TypeProduct.create(data)
            res.json(type_product)
        } catch (error) {
            console.log(error)
            res.json(error)
        }

    }

}








module.exports = new ApiController;