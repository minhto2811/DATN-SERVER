const Voucher = require('../../model/voucher')



class ApiController {

    async getAll(req, res) {
        try {
            const vouchers = await Voucher.find({ userId: null, expiration_date: { $gte: new Date() } })
            res.json(vouchers)
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

    async getAllByUser(req, res) {
        const userId = req.body.userId
        console.log(userId)
        try {
            const voucherUser = await Voucher.find({ userId: userId })
            let listCode = []
            if (voucherUser.length > 0) {
                listCode = voucherUser.map((item) => item.code)
            }
            console.log(listCode)
            const vouchers = await Voucher.find({ code: { $nin: listCode }, used: false, expiration_date: { $gte: new Date() } })
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
        const userId = req.body.userId
        try {
            const currentDate = new Date()
            const vouchers = await Voucher.find({ userId: userId, used: false, expiration_date: { $gt: currentDate } }).sort({ expiration_date: -1 })
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
        const userId = req.body.userId
        const voucherCode = req.body.voucherCode
        const voucherId = req.body.voucherId
        console.log(userId, voucherCode, voucherId)
        try {
            const voucherUser = await Voucher.findOne({ userId: userId, code: voucherCode })
            if (voucherUser) {
                throw "Voucher đã thêm trước đó"
            }
            const currentDate = new Date()
            const voucher = await Voucher.findOne({ _id: voucherId, expiration_date: { $gt: currentDate } }).lean()
            if (!voucher) {
                throw "Không tìm thấy voucher muốn thêm hoặc đã hết hạn"
            }
            delete voucher._id
            voucher.userId = userId
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

    create(req, res) {
        Voucher.create(req.body).then((ok) => res.json(ok)).catch((ok) => res.json(ok))
    }
}









module.exports = new ApiController;