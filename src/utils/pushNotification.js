const axios = require('axios');
const Token = require('../model/token')

class PushNotification {
    async sendPushNotification(obj) {
        try {
            console.log(obj)
            const key = await Token.findOne({ userId: String(obj.userId) })
            if (!key) throw "Không tìm thấy device token"
            const data = {
                to: key.token,
                sound: "default",
                title: obj.title,
                body: obj.body,
                data: {
                    image: obj.image,
                    route: obj.route,
                    billId: String(obj.billId)
                }
            }
            console.log('data', data)
            const response = await axios.post('https://exp.host/--/api/v2/push/send', data);
            console.log('Push notification sent successfully:', response.data);
        } catch (error) {
            console.error('Failed to send push notification:', error.message);
        }
    }
}

module.exports = new PushNotification();
