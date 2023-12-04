const express = require('express')
const controller = require('../../controller/web/product.controller')
const router = express.Router()
const upload = require('../../utils/handleFile')
const { checkAdmin } = require('../../midleware/authentication')

router.use(checkAdmin);

router.post('/add', controller.newProduct)
router.get('/', controller.pageHome)
router.get('/new', controller.pageNewProduct)
router.get('/update/:id', controller.detailProduct)
router.put('/update/:id', controller.updateProduct)
router.delete('/delete/:id', controller.deleteProduct)

router.get('/:id/variations', controller.pageVariations)
router.get('/:id/variations/add', controller.pageNewVariations)
router.post('/:id/variations/add', upload.single('image'), controller.NewVariations)
router.get('/:product_id/variations/edit/:id', controller.editVariations)
router.post('/variations/edit', upload.single('image'), controller.editPostVariations)
router.delete('/:product_id/variations/delete/:id', controller.deleteVariations)

router.get('/description/:id', controller.pageDescription)
router.post('/description/add/:id', upload.single('image'), controller.addDescription);
router.get('/description/add/:id', controller.add2Description);
router.get('/:product_id/description/edit/:id', controller.editDescription);
router.post('/description/edit', upload.single('image'), controller.edit2Description);

router.delete('/:id_product/delete/description/:id', controller.deleteDescription)


module.exports = router
