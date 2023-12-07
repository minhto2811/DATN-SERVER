
const router = require('express').Router()
const controller = require('../../controller/api/address.controller')
const upload = require('../../utils/handleFile')

router.get('/info/path_with_type', controller.pwt)
router.get('/provinces', controller.provinces)
router.get('/districts/:parent_code', controller.districts)
router.get('/wards/:parent_code', controller.wards)

module.exports = router