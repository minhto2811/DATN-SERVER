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
            res.json(error)
        }

    }




}








module.exports = new ApiController;