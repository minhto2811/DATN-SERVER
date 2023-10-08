const express = require('express')
const expressHbs = require('express-handlebars')
require('dotenv').config()
const path = require('path')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.engine('.hbs', expressHbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, '/src/public/views/layouts'),
    partialsDir: path.join(__dirname, '/src/public/views/partials')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, '/src/public/views'))
app.enable('view cache')

const PORT = process.env.PORT | 3000
const db = require('./src/config/db')
const router = require('./src/route')

router(app)


db.connect()

app.listen(PORT, () => {

    console.log(`>>> Gửi otp  POST {username: String,forgotPassword:boolean }  
        http://localhost:${PORT}/api/user/receive-otp`)

    console.log(`>>> Xác nhận otp  POST {username: String, otp:String }
        http://localhost:${PORT}/api/user/verify-otp`)

    console.log(`>>> Tạo tài khoản  POST {username: String, password:String,fullname:String }
        http://localhost:${PORT}/api/user/create-account`)

    console.log(`>>> Đăng nhập bằng token  POST {token: String}
        http://localhost:${PORT}/api/user/auto-login`)

    console.log(`>>> Quên mật khẩu  POST {username: String,password: String}
        http://localhost:${PORT}/api/user/forgot-password`)


})




