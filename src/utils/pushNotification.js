const axios = require('axios');
const Token = require('../model/token')
const { google } = require('googleapis')
const MESSAGEING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging"
const SCOPES = [MESSAGEING_SCOPE]


class PushNotification {
    getAccessToken() {
        return new Promise(function (resolve, reject) {
            var key = require('../config/serviceAccountKey.json')
            var jwtClient = new google.auth.JWT(
                key.client_email,
                null,
                key.private_key,
                SCOPES,
                null
            )
            jwtClient.authorize(function (err, tokens) {
                if (err) {
                    reject(err)
                    return
                }
                resolve(tokens)
            })
        })

    }
    async sendPushNotification(obj) {
        try {
            const { access_token } = await this.getAccessToken()
            console.log(access_token)
            const filter = obj.userId ? { userId: String(obj.userId) } : {}
            const key = await Token.find(filter)
            if (key.length == 0) throw "Không tìm thấy device token"
            key.map(async (item) => {
                try {
                    const message = {
                        message: {
                            token: item.token,
                            notification: {
                                body: obj.body,
                                title: obj.title,
                                image: obj.image
                            },
                            data: {
                                route: obj.route,
                                dataId: String(obj.dataId)
                            }
                        }
                    }
                    const response = await axios.post(
                        'https://fcm.googleapis.com/v1/projects/shopping-6b085/messages:send',
                        message,
                        {
                            headers: {
                                'Authorization': `Bearer ${access_token}`
                            }
                        }
                    )
                    console.log('Push notification sent successfully:', response.data);
                } catch (error) {
                    console.log(error)
                }
            })

        } catch (error) {
            console.error('Failed to send push notification:', error.message);
        }
    }
}

module.exports = new PushNotification();