
const router = require('express').Router()
const controller = require('../../controller/api/bill.controller')
const {checkUser} = require('../../midleware/authentication')

router.post('/create', checkUser, controller.createBill)
router.get('/detail/:id', checkUser, controller.detail)
router.get('/get-all',checkUser,controller.getAll)
router.get('/:status', checkUser, controller.getByStatus)
router.post('/cancel', checkUser, controller.cancelBill)


module.exports = router