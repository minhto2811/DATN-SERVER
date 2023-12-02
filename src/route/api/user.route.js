
const router = require('express').Router()
const controller = require('../../controller/api/user.controller')
const upload = require('../../utils/handleFile')
const { checkUser } = require('../../midleware/authentication')


//xác thực email
router.post('/receive-otp', controller.insertOtp)
router.post('/verify-otp', controller.verifyOtp)

//người dùng
router.post('/create-account', controller.createAccount)
router.post('/login', controller.login)
router.post('/auto-login', controller.loginWithToken)
router.post('/forgot-password', controller.forgotPassword)

//địa chỉ
router.post('/address/new', checkUser, controller.addAddress)
router.get('/address/get-all', checkUser, controller.getAddress)
router.post('/address/update', checkUser, controller.updateAddress)
router.delete('/address/delete', checkUser, controller.deleteAddress)

//Cập nhật
router.post('/update/avatar',  upload.single('avatar') , checkUser, controller.updateAvatar)
router.post('/update/background',  upload.single('background') , checkUser, controller.updateBackground)
router.post('/update/fullname', checkUser, controller.updateFullname)
router.post('/update/password', checkUser, controller.updatePassword)



module.exports = router