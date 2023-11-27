const router = require('express').Router()
const controller = require('../../controller/api/cart.controller')
const { checkUser } = require('../../midleware/authentication')



router.post('/add', checkUser, controller.add)
router.get('/get-all', checkUser, controller.getAll)
router.post('/delete', checkUser, controller.delete)
router.post('/update', checkUser, controller.update)


module.exports = router