
const Voucher = require('../../model/voucher')



class ApiController {
    async getAll(req, res) {
        const username = req.body.username
        try {
            const voucherUser = await Voucher.find({ username: username })
            let listId = []
            if (!voucherUser) {
                voucherUser.map((item) => listId.push(item._id))
            }
            const vouchers = await Voucher.find({ _id: { $nin: listId }, expiration_date: { $gte: new Date() } })
            if (!vouchers) {
                throw "Không tìm thấy voucher"
            }
            res.json(vouchers)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async get(req, res) {
        const username = req.body.username
        try {
            const currentDate = new Date()
            const vouchers = await Voucher.find({ username: username, used: false, expiration_date: { $gt: currentDate } }).sort({ expiration_date: -1 })
            if (!vouchers) {
                throw "Không tìm thấy voucher"
            }
            res.json(vouchers)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async add(req, res) {
        const username = req.body.username
        const voucherCode = req.body.voucherCode
        const voucherId = req.body.voucherId
        try {
            const voucherUser = await Voucher.findOne({ username: username, code: voucherCode })
            if (voucherUser) {
                throw "Voucher đã thêm trước đó"
            }
            const currentDate = new Date()
            const voucher = await Voucher.findOne({ _id: voucherId, expiration_date: { $gt: currentDate } }).lean()
            if (!voucher) {
                throw "Không tìm thấy voucher muốn thêm hoặc đã hết hạn"
            }
            delete voucher._id
            voucher.username = username
            const addVoucher = await Voucher.create(voucher)
            if (!addVoucher) {
                throw "Thêm thất bại"
            }
            res.json(addVoucher)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }
}









module.exports = new ApiController;