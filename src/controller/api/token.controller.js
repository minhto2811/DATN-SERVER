require('dotenv').config()
const token = require('../../model/token')
const Token = require('../../model/token')


class ApiController {

    async update(req, res) {
        try {
            const { token, userId } = req.body
            const keyFind = await Token.findOne({ token: token, userId: userId })
            if (!keyFind) await Token.create(req.body)
            res.json({ code: 200, message: "Lưu device token thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Lưu device token thất bại" })
        }

    }

    async delete(req, res) {
        try {
            await Token.findOneAndDelete({ userId: req.body.userId })
            res.json({ code: 200, message: "Xóa device token thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Xóa device token thất bại" })
        }
    }

}








module.exports = new ApiController;