const mongoose = require('mongoose')
const Schema = mongoose.Schema



const Notification = new Schema({
    userId: { type: Schema.ObjectId, require: true },
    title: { type: String, require: true },
    descrition: { type: String, require: true },
    image: { type: String, require: true },
    seen:{type:Boolean,default:false},
    action:{
        type:{type:Number,default:0},
        //mặc định id  =  undefine
        //type = 0 không có hành động
        //       1 thông báo thông tin đơn hàng -> id = id hóa đơn
        //       2 thông báo đổi mật khẩu
        id:{type:String}
    },
    time: { type: Date, default: Date.now, index: { expires: 2592000 } }
}, {
    collection: "Notification"
})



module.exports = mongoose.model('Notification', Notification) 