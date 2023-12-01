require('dotenv').config()

const { uploadImage, deleteImage } = require('../../utils/uploadImage')
const Message = require('../../model/message')

class ApiController {
    async history(req, res) {
        try {
            const message = await Message.find({ roomId: req.body.userId }).limit(25)
            res.json(message)
        } catch (error) {
            console.log(error)
            res.json([])
        }

    }


    async seen(req, res) {
        try {
            const update = await Message.find({ roomId: req.body.userId, seen: false, userId: { $ne: req.body.userId } })
            if (update.length == 0) return res.json({ code: 200 })
            await Promise.all(update.map(async (item) => {
                item.seen = true
                return await item.save()
            }))
        } catch (error) {
            console.log(error)
            res.json({ code: 500 })
        }
    }



}








module.exports = new ApiController;