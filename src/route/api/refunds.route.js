
const router = require('express').Router()
const controller = require('../../controller/api/refunds.controller')
const { checkUser } = require('../../midleware/authentication')


router.get('/:status', checkUser, controller.getRefundsByStatus)

module.exports = router