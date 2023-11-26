
const router = require('express').Router()
const controller = require('../../controller/api/product.controller')

router.get('/search',controller.search)
router.get('/get-all',controller.getAll)
router.post('/:id',controller.getItem)
router.post('/variation/:id',controller.getVariation)
module.exports = router