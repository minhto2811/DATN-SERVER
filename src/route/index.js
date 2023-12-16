

//route api
const userApi = require('./api/user.route')
const productApi = require('./api/product.route')
const billApi = require('./api/bill.route')
const cartApi = require('./api/cart.route')
const favoriteApi = require('./api/favorite.route')
const bannerApi = require('./api/banner.route')
const newsApi = require('./api/news.route')
const notiApi = require('./api/notification.route')
const voucherApi = require('./api/voucher.route')
const brandApi = require('./api/brand.route')
const typeApi = require('./api/type.route')
const shippingApi = require('./api/shipping.route')
const commentApi = require('./api/comment.route')
const messageApi = require('./api/message.route')
const tokenApi = require('./api/token.route')
const addressApi = require('./api/address.route')
const refundsApi = require('./api/refunds.route')
//route web

const userWeb = require('./web/user.route')
const productWeb = require('./web/product.route')
const billWeb = require('./web/bill.route')
const brandWeb = require('./web/brand.route')
const bannerWeb = require('./web/banner.route')
const voucherWeb = require('./web/voucher.router')
const notificationWeb = require('./web/notification.router')
const typedWeb = require('./web/type.route')



const { checkAdmin } = require('../midleware/authentication')



function route(app) {

    //api

    app.use('/api/user', userApi) // tài khoản
    app.use('/api/product', productApi) //sản phẩm
    app.use('/api/bill', billApi) //hóa đơn
    app.use('/api/cart', cartApi)//giỏ hàng
    app.use('/api/favorite', favoriteApi) //yêu thích
    app.use('/api/banner', bannerApi) // banner
    app.use('/api/news', newsApi) // banner
    app.use('/api/notification', notiApi) // thông báo
    app.use('/api/voucher', voucherApi) // voucher
    app.use('/api/brand', brandApi) // voucher
    app.use('/api/type-product', typeApi) // Loại sản phẩm
    app.use('/api/shipping', shippingApi) // Loại vận chuyển
    app.use('/api/comment', commentApi)
    app.use('/api/message', messageApi)
    app.use('/api/token', tokenApi)
    app.use('/api/address', addressApi)
    app.use('/api/refunds', refundsApi)
    //web


    app.get('/', checkAdmin, (req, res) => {
        res.redirect('/bill/?status=0')
    })



    app.use('/user', userWeb)
    app.use('/product', productWeb)
    app.use('/bill', billWeb)
    app.use('/brand', brandWeb)
    app.use('/banner', bannerWeb)
    app.use('/voucher', voucherWeb)
    app.use('/notification', notificationWeb)
    app.use('/type', typedWeb)

}

module.exports = route