
const Notification = require('../../model/notification')
const { getIo } = require('../../config/socketManager')

class ApiController {
    async getAll(req, res) {
        try {
            if (!req.body.userId) return res.json([])
            const noti = await Notification.find({ userId: { $in: [req.body.userId, null] } }).sort({ time: -1, seen: 1 })
            res.json(noti)
        } catch (error) {
            console.log(error)
            res.json({ code: 500 })
        }
    }

    async seenAll(req, res) {
        try {
            res.json({ code: 200 })
            await Notification.updateMany({ userId: { $in: [req.body.userId, null] }, seen: false }, { $set: { seen: true } })
        } catch (error) {
            console.log(error)
            res.json({ code: 500 })
        }
    }

    async delete(req, res) {
        try {
            res.json({ code: 200 })
            const noti = await Notification.deleteOne({ _id: req.body.notificationId })
        } catch (error) {
            console.log(error)
            res.json({ code: 500 })
        }
    }

    async deleteAll(req, res) {

        try {
            res.json({ code: 200 })
            await Notification.deleteMany({ userId: req.body.userId, })
        } catch (error) {
            console.log(error)
            res.json({ code: 500 })
        }
    }
}









module.exports = new ApiController;


// const io = getIo();
