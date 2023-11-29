
const Banner = require('../../model/news')

class ApiController {
    add(req, res) {
        const data = req.body
        Banner.create(data).then((rs) => res.json(rs)).catch((err) => res.json(err))
    }

    async update(req, res) {
        const code = req.body.code
        const id_product = req.body.id_product
        try {
            const banners = await Banner.findOne({ code: code })
            if (!banners) {
                throw "not found"
            }
            banners.list_id_product.push(id_product)
            console.log(banners)
            await banners.save()
            res.json("save successful")
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async getAll(req, res) {
        try {
            const banners = await Banner.find({}).sort({ time: -1 }).lean()
            res.json(banners)
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async getById(req, res) {
        const id = req.params.id
        try {
            const banner = await Banner.findOne({ _id: id })
            res.json(banner)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }
}









module.exports = new ApiController;