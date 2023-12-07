require('dotenv').config()
const User = require('../../model/user')
const Otp = require('../../model/otp')
const Address = require('../../model/address')
const Notification = require('../../model/notification')
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const SECRECT = process.env.SECRECT
const { sendEmail } = require('../../utils/emailSender')
const { uploadImage, deleteImage } = require('../../utils/uploadImage')

class ApiController {
    async insertOtp(req, res) {
        const username = req.body.username.toLowerCase()
        const forgotPassword = req.body.forgotPassword
        const type = (forgotPassword == true) ? 2 : 1
        try {
            const user = await User.findOne({ username: username })
            if (type == 1) {
                if (user) {
                    throw "Gmail này đã tồn tại, đăng ký bằng gmail khác"
                }
            } else {
                if (!user) {
                    throw "Không tìm thấy tài khoản"
                }
            }
            const num = await otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
            const salt = await bcrypt.genSalt(10)
            const otp = await bcrypt.hash(num, salt)
            const numberPhonePattern = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/
            const isNumberPhone = numberPhonePattern.test(username)
            if (isNumberPhone) {
                // gửi otp sms 
                throw "Hãy đăng ký bằng email"

            } else {
                const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
                const isEmail = emailPattern.test(username)
                if (isEmail) {
                    const subject = "Xác nhận email"
                    const text = `Mã xác nhận của bạn là ${num}`
                    sendEmail(username, subject, text)
                } else {
                    throw "Tài khoản không hợp lệ"
                }
            }

            const rs = await Otp.create({ username: username, otp: otp, type: type })
            res.json({ code: 200, message: "Tạo otp thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: error })
        }
    }

    async verifyOtp(req, res) {
        const username = req.body.username.toLowerCase()
        const otp = req.body.otp
        try {
            const otpHolder = await Otp.findOne({ username: username }).sort({ _id: -1 })
            if (!otpHolder) {
                return res.json({ code: 400, message: "Mã xác minh hết hạn" })
            }

            console.log(otpHolder)
            const hashOtp = otpHolder.otp
            const matches = await bcrypt.compare(otp, hashOtp)
            if (matches) {
                const lastOtpId = otpHolder._id
                const rs = await Otp.findByIdAndUpdate(lastOtpId, { $set: { confirm: true } })
                if (!rs) {
                    return res.json({ code: 400, message: "Mã xác minh hết hạn" })
                }
                return res.json({ code: 200, message: "Xác nhận mã thành công" })
            }
            res.json({ code: 404, message: "Mã xác minh không chính xác" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }

    }


    async createAccount(req, res) {
        const account = req.body
        try {
            const username = account.username.toLowerCase()
            const otp = await Otp.findOne({ username: username }).sort({ _id: -1 })
            if (!otp || otp.type != 1 || otp.confirm == false) {
                throw "Yêu cầu xác nhận email"
            }

            const userFind = await User.findOne({ username: username })
            if (userFind) {
                throw "Tài khoản đã tồn tại"
            }
            const salt = await bcrypt.genSalt(10)
            const password = account.password
            const hashPass = await bcrypt.hash(password, salt)
            account.password = hashPass
            const user = await User.create(account)
            if (!user) throw "Tạo tài khoản thất bại"
            res.json({ code: 200, message: "Tạo tài khoản thành công" })
            let noti = {
                userId: user._id,
                title: `Hi, ${user.fullname}!`,
                body: "Chào mừng bạn đến với ứng dụng mua sắm điện thoại E-tech",
                image: "https://img.freepik.com/premium-vector/e-tech-logo_110852-50.jpg"
            }
            await Notification.create(noti)

        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Tạo tài khoản thất bại" })
        }

    }

    async login(req, res) {
        const { username, password } = req.body
        console.log(username, password)
        try {
            const user = await User.findOne({ username: username.toLowerCase(), enable: true, role: false }).lean()
            if (!user) {
                throw "Tài khoản hoặc mật khẩu không chính xác"
            }
            const hashPassword = user.password
            const matches = await bcrypt.compare(password, hashPassword)
            if (matches == false) {
                throw "Tài khoản hoặc mật khẩu không chính xác"
            }
            delete user.password
            delete user.enable
            delete user.role
            delete user.__v
            if (!user.avatar) {
                user.avatar = "https://firebasestorage.googleapis.com/v0/b/shopping-6b085.appspot.com/o/user%2Fuser.png?alt=media&token=794ad4dc-302b-4708-b102-ccbaf80ea567&_gl=1*e1jpw6*_ga*NDE5OTAxOTY1LjE2OTUwMDQ5MjM.*_ga_CW55HF8NVT*MTY5NzExMzA0MS4yMS4xLjE2OTcxMTMzMjcuNTkuMC4w"
            }
            if (!user.background) {
                user.background = "https://s3.cloud.cmctelecom.vn/tinhte2/2019/07/4731556_Cover.jpg"
            }
            const token = await jwt.sign({ userId: user._id, password: password }, SECRECT)
            res.json({ code: 200, message: "Đăng nhập thành công", user, token: token })
        } catch (error) {
            console.log(error)
            res.json({ code: 404, message: error })
        }
    }

    async loginWithToken(req, res) {
        try {
            const token = req.headers['authorization']
            if (!token) throw "Token null"
            const account = await jwt.verify(token, SECRECT)
            if (!account) throw "Token Không hợp lệ"
            const user = await User.findOne({ _id: account.userId, role: false, enable: true }).lean()
            if (!user) return res.json({ code: 404, message: "Token không hợp lệ" })
            const matches = await bcrypt.compare(account.password, user.password)
            if (matches != true)
                throw "Token hết hạn"
            if (!user.avatar) {
                user.avatar = "https://firebasestorage.googleapis.com/v0/b/shopping-6b085.appspot.com/o/user%2Fuser.png?alt=media&token=794ad4dc-302b-4708-b102-ccbaf80ea567&_gl=1*e1jpw6*_ga*NDE5OTAxOTY1LjE2OTUwMDQ5MjM.*_ga_CW55HF8NVT*MTY5NzExMzA0MS4yMS4xLjE2OTcxMTMzMjcuNTkuMC4w"
            }
            if (!user.background) {
                user.background = "https://s3.cloud.cmctelecom.vn/tinhte2/2019/07/4731556_Cover.jpg"
            }
            delete user.password
            delete user.enable
            delete user.role
            delete user.__v
            console.log(user)
            res.json({ code: 200, message: "Đăng nhập thành công", user })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async forgotPassword(req, res) {
        const username = req.body.username
        const password = req.body.password
        try {
            const otp = await Otp.findOne({ username: username }).sort({ _id: -1 })
            if (!otp || otp.type != 2 || otp.confirm == false) {
                throw "Yêu cầu xác nhận email"
            }
            const salt = await bcrypt.genSalt(10)
            const hashPass = await bcrypt.hash(password, salt)
            const update = await User.updateOne({ username: username }, { $set: { password: hashPass } })
            if (!update) {
                throw "Cập nhật thất bại"
            }
            res.json({ code: 200, message: "Cập nhật thành công" })
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Đã xảy ra lỗi" })
        }
    }

    async addAddress(req, res) {
        const data = req.body
        try {
            const numberPhonePattern = /^(0[2-9]|84[2-9]|\\+84[2-9]|00842[2-9])[0-9]{8}$/
            const isNumberPhone = numberPhonePattern.test(data.numberphone)
            if (!isNumberPhone) throw "Số điện thoại không hợp lệ!"
            const address = await Address.create(data)
            res.json({ code: 200, message: "Thêm địa chỉ thành công" })
            const user = await User.findById(data.userId)
            if (!user.default_address) {
                user.default_address = address
                await user.save()
            }
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: error })
        }

    }


    async getAddress(req, res) {
        const userId = req.body.userId
        try {
            const address = await Address.find({ userId: userId })
            res.json(address)
        } catch (error) {
            console.log(error)
            res.json([])
        }
    }

    async updateAddress(req, res) {
        const data = req.body
        try {
            const address = await Address.findById(data._id)
            if (!address) {
                throw "Không tìm thấy địa chỉ!"
            }
            res.json({ code: 200, message: "Cập nhật địa chỉ thành công" })
            await address.updateOne({ $set: data })
            const user = await User.findById(data.userId)

            if (data._id == user.default_address._id) {
                user.default_address = data
                await user.save()
            }


        } catch (error) {
            console.log(error)
            res.json({ code: 404, message: error })
        }
    }

    async deleteAddress(req, res) {

        try {
            const addressId = req.body.addressId
            const address = await Address.findById(addressId)
            if (!address) {
                throw "Không tìm thấy địa chỉ!"
            }
            res.json({ code: 200, message: "Xóa địa chỉ thành công" })
            address.deleteOne()
            const user = await User.findById(req.body.userId)
            if (user.default_address._id == addressId) {
                const newAdress = await Address.findOne({ userId: req.body.userId })
                if (newAdress) {
                    user.default_address = newAdress
                    await user.save()
                }
            }
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: error })
        }
    }


    async deleteListAddress(req, res) {
        try {
            const listAddressId = req.body.listAddressId
            if (listAddressId.length == 0) throw "Lỗi"
            res.json({ code: 200, message: "Xóa địa chỉ thành công" })
            const deletePromises = listAddressId.map(async (id) => {
                const result = await Address.findByIdAndDelete(id);
                return result;
            });
            await Promise.all(deletePromises)
            const user = await User.findById(req.body.userId)
            if (listAddressId.lastIndexOf(user.default_address._id) > 0) {
                const newAdress = await Address.findOne({ userId: data.userId })
                if (newAdress) {
                    user.default_address = newAdress
                    await user.save()
                }
            }

        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: error })
        }
    }

    async updateAvatar(req, res) {

        try {
            const userId = req.body.userId
            if (req.file != null && req.file != undefined) {
                const filename = req.file.filename
                const filepath = req.file.path
                const url = await uploadImage(filepath, filename)
                const rs = await User.findOneAndUpdate({ _id: userId }, { $set: { avatar: url } })
                rs.avatar = url
                res.json({ code: 200, user: rs })
            } else {
                res.json({ code: 500, message: "Cập nhật thất bại" })
            }
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Cập nhật thất bại" })
        }

    }

    async updateBackground(req, res) {
        try {
            const userId = req.body.userId
            if (req.file != null && req.file != undefined) {
                const filename = req.file.filename
                const filepath = req.file.path
                const url = await uploadImage(filepath, filename)
                const rs = await User.findOneAndUpdate({ _id: userId }, { $set: { background: url } })
                rs.background = url
                res.json({ code: 200, user: rs })
            } else {
                res.json({ code: 500, message: "Cập nhật thất bại" })
            }
        } catch (error) {
            console.log(error)
            res.json({ code: 500, message: "Cập nhật thất bại" })
        }

    }

    updateFullname(req, res) {
        const userId = req.body.userId
        const fullname = req.body.fullname
        User.findOneAndUpdate({ _id: userId }, { $set: { fullname: fullname } })
            .then((rs) => {
                rs.fullname = fullname
                res.json({ code: 200, user: rs })
            })
            .catch((error) => {
                console.log(error)
                res.json({ code: 500, message: "Cập nhật thất bại" })
            })
    }

    async updatePassword(req, res) {
        const { userId, oldPass, newPass } = req.body
        try {
            const user = await User.findById(userId)
            if (!user) {
                throw "Không tìm thấy user"
            }
            if (user.role == true) {
                throw "Tài khoản không có quyền truy cập"
            }
            const matches = await bcrypt.compare(oldPass, user.password)
            if (matches == false) {
                throw "Mật khẩu cũ không chính xác"
            }
            const salt = await bcrypt.genSalt(10)
            const hashPass = await bcrypt.hash(newPass, salt)
            user.password = hashPass
            await user.save()
            const token = await jwt.sign({ userId: user._id, password: newPass }, SECRECT)
            if (!token) throw "Tạo token mới thất bại"
            res.json({ token: token })
        } catch (error) {
            console.log(error)
            res.json(error)
        }
    }

}









module.exports = new ApiController;

