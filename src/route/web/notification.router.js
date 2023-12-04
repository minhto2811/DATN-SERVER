const express = require('express')
const controller = require('../../controller/web/notification.controller')
const router = express.Router()
const upload = require('../../utils/handleFile')
const { checkAdmin } = require('../../midleware/authentication')

router.use(checkAdmin);

router.get('/', controller.list);
router.get('/detail/:id', controller.detail);
router.get('/insert', controller.insert);
router.post('/insert', upload.single('image'), controller.insert);
router.get('/edit/:id', controller.edit);
router.post('/edit', upload.single('image'), controller.editPost);
router.delete('/delete/:id', controller.delete)


module.exports = router
