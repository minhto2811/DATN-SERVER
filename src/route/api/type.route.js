
const router = require('express').Router()
const controller = require('../../controller/api/type.controller')
const upload = require('../../utils/handleFile')


router.get('/get/:name', controller.getByType)// lấy danh sách sản phẩm theo brand
router.get('/get-all', controller.getAll)//lấy danh sách brand
router.post('/add', upload.single('image'), controller.add)
module.exports = router