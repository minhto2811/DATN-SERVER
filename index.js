const express = require('express')
require('dotenv').config()

const db = require('./src/config/db')
const router = require('./src/route')


const PORT = process.env.PORT


const app = express()
const server = require('http').createServer(app)

const { initializeSocket } = require('./src/config/socketManager')


const ejsLayout = require('express-ejs-layouts')
const methodOverride = require('method-override')


db.connect()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('./src/public'))

//method overide
app.use(methodOverride('_method'))

// view engine setup
app.use(ejsLayout)
app.set('views', './src/views');
app.set('view engine', 'ejs');
app.set('layout', './src/views/layouts');



//socket io
initializeSocket(server)


router(app)




app.listen(PORT, () => {
    // console.log(`>>> Gửi otp  POST {username: String,forgotPassword:boolean }  
    //     http://localhost:${PORT}/api/user/receive-otp`)

    // console.log(`>>> Xác nhận otp  POST {username: String, otp:String }
    //     http://localhost:${PORT}/api/user/verify-otp`)

    // console.log(`>>> Tạo tài khoản  POST {username: String, password:String,fullname:String }
    //     http://localhost:${PORT}/api/user/create-account`)

    // console.log(`>>> Đăng nhập bằng token  POST {token: String}
    //     http://localhost:${PORT}/api/user/auto-login`)

    // console.log(`>>> Quên mật khẩu  POST {username: String,password: String}
    //     http://localhost:${PORT}/api/user/forgot-password`)


})




