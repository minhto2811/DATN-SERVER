
const router = require('express').Router()
const controller = require('../../controller/api/voucher.controller')
const {checkUser} = require('../../midleware/authentication')

router.get('/get-all', controller.getAll)// lấy voucher không cần đăng nhập
router.post('/get-all', checkUser,controller.getAllByUser)// lấy tất cả voucher trên hệ thống mà người dùng chưa thêm
router.post('/add',  controller.add)
router.post('/get', checkUser, controller.get)// lấy voucher của user

router.post('/create',  controller.create)

module.exports = router