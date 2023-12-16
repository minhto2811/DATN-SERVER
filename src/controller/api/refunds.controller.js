require('dotenv').config()
const Product = require('../../model/product')
const TypeProduct = require('../../model/typeProduct')

const Brand = require('../../model/brand')
const Refunds = require('../../model/refunds')

class ApiController {
    async getRefundsByStatus(req, res) {
        try {
            const status = req.params.status ?? 0
            const { userId } = req.body
            const response = await Refunds.find({ userId: userId, status: status })
            res.json({ code: 200, data: response })
        } catch (error) {
            console.log(error)
            res.json({ code: 500 })
        }
    }

}








module.exports = new ApiController;