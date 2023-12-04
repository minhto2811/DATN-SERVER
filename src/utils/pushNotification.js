const axios = require('axios');
const Token = require('../model/token')

class PushNotification {
    async sendPushNotification(obj) {
        try {
            console.log(obj)
            var filter = {}
            if (obj.userId) filter = { userId: String(obj.userId) }
            const key = await Token.find(filter)
            key.forEach((item) => {
                const data = {
                    to: item.token,
                    sound: "default",
                    title: obj.title,
                    body: obj.body,
                    data: {
                        image: obj.image,
                        route: obj.route,
                        dataId: String(obj.dataId)
                    }
                }
                axios.post('https://exp.host/--/api/v2/push/send', data);
            })
        } catch (error) {
            console.error('Failed to send push notification:', error.message);
        }
    }
}

module.exports = new PushNotification();
