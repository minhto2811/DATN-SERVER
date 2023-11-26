var express = require('express')
var controller = require('../../controller/web/voucher.controller')
var router = express.Router()
const { checkAdmin } = require('../../midleware/authentication')

router.use(checkAdmin);

router.get('/', controller.list);
router.get('/detail/:id', controller.detail);
router.get('/insert', controller.insert);
router.post('/insert', controller.insert);
router.get('/edit/:id', controller.edit);
router.post('/edit', controller.editPost);
router.delete('/delete/:id', controller.delete)


module.exports = router
