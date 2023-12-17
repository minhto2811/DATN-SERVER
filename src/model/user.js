const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const User = new Schema({
    fullname: { type: String, require: true },
    avatar: { type: String, require: false },
    background: { type: String, require: false },
    role: { type: Boolean, default: false },
    username: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    enable: { type: Boolean, default: true },
    rewardPoints: { type: Number, default: 0 },
    default_address: { type: Object },
    delete: { type: Boolean, default: false },
    time: { type: Date, default: Date.now }
}, {
    collection: "User"
});



module.exports = mongoose.model('User', User);