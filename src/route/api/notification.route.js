const router = require('express').Router()
const controller = require('../../controller/api/notification.controller')
const { checkUser } = require('../../midleware/authentication')



router.get('/get-all', checkUser,controller.getAll)

router.get('/seen-all', checkUser,controller.seenAll)

router.delete('/delete', checkUser,controller.delete)

router.delete('/delete-all', checkUser,controller.deleteAll)

module.exports = router