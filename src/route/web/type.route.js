var express = require('express')
var controller = require('../../controller/web/type.controller')
var router = express.Router()
const upload = require('../../utils/handleFile')
const { checkAdmin } = require('../../midleware/authentication')

router.use(checkAdmin);

router.get('/', controller.list);
router.get('/insert', controller.insert);
router.post('/insert', upload.single('image'), controller.insert);
router.get('/edit/:id', controller.edit);
router.post('/edit', upload.single('image'), controller.editPost);
router.delete('/delete/:id', controller.delete)


module.exports = router
