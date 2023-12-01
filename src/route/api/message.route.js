
const router = require('express').Router()
const controller = require('../../controller/api/message.controller')
const {checkUser} = require('../../midleware/authentication')


router.get('/history', checkUser,controller.history)
router.get('/seem-all',checkUser, controller.seen)
module.exports = router