require('dotenv').config()

const express = require('express')
const app = express()
const server = require('http').createServer(app)


const db = require('./src/config/db')
const router = require('./src/route')


const { PORT, SECRECT, URI_MONGODB } = process.env
const { passport } = require('./src/utils/authModule')
const flash = require('connect-flash');
const MongoStore = require('connect-mongo')

app.use(require('express-session')({
    secret: SECRECT,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: URI_MONGODB,
        collectionName: 'Sessions',
        
    })
}))


app.use(passport.initialize())
app.use(passport.session())
// Connect flash
app.use(flash());

//meaasge
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    res.locals.error = req.flash('error');
    delete req.session.message;
    next();
  });


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




