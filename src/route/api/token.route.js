
const router = require('express').Router()
const controller = require('../../controller/api/token.controller')
const { checkUser } = require('../../midleware/authentication')


router.post('/update', checkUser, controller.update)
router.post('/delete', checkUser, controller.delete)

module.exports = router