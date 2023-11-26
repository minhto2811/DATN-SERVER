
const router = require('express').Router()
const controller = require('../../controller/api/product.controller')

router.get('/search',controller.search)
router.get('/get-all',controller.getAll)
router.post('/:id',controller.getItem)
router.get('/variation/:id',controller.getVariation)
router.get('/related/:id',controller.related)
module.exports = router