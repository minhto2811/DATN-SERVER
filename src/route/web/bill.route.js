var express = require('express')
var controller = require('../../controller/web/bill.controller')
var router = express.Router()

const { checkAdmin } = require('../../midleware/authentication')

router.use(checkAdmin);

router.get('/', controller.list);
router.get('/detail/:id', controller.detail);
router.get('/confirmBill/:id', controller.confirmBill);

router.get('/dashboard', controller.dashboard);



module.exports = router
