
require('dotenv').config()
const User = require('../model/user')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const SECRECT = process.env.SECRECT

async function checkUser(req, res, next) {

    try {
        const token = req.body.token
        const account = await jwt.verify(token, SECRECT)
        if (!account) throw "token không tồn tại"
        console.log(account)
        if (!account.userId) throw "Token hết hạn hãy đăng nhập lại"
        const user = await User.findOne({ _id: account.userId, role: false, enable: true })
        if (!user) throw "không tìm thấy người dùng"
        const matches = await bcrypt.compare(account.password, user.password)
        if (matches != true) throw "Token hết hạn"
        delete req.body.token
        req.body.userId = account.userId
        next()
    } catch (error) {
        console.log(error)
        res.json({ code: 403, message: "Xác thực thất bại" })
    }
}


async function checkAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/user/login')
}

module.exports = { checkUser, checkAdmin }


