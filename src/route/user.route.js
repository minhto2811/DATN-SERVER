
const router = require('express').Router()
const controller = require('../controller/user.controller.api')
const upload = require('../ultils/handleFile')

router.post('/receive-otp', controller.insertOtp)
router.post('/verify-otp', controller.verifyOtp)
router.post('/create-account', controller.createAccount)
router.post('/login', controller.login)
router.post('/auto-login', controller.loginWithToken)
router.post('/forgot-password', controller.forgotPassword)





module.exports = router