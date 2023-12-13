const User = require("../../model/user");
const Otp = require("../../model/otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { sendEmail } = require("../../utils/emailSender");
const { uploadImage, deleteImage } = require("../../utils/uploadImage");

require("dotenv").config;

const SECRECT = process.env.SECRECT;

class Controller {
  pageLogin(req, res) {
    res.render("auth/login.ejs", { layout: "layouts/auth", data: null });
  }

  pageRegister(req, res) {
    res.render("auth/register.ejs", {
      layout: "layouts/auth",
      email: null,
      error: null,
      fullname: null,
      password: null,
    });
  }

  async login(req, res) {
    const data = req.body;

    try {
      const user = await User.findOne({ username: data.username, role: true });
      if (!user) {
        throw "Không tìm thấy người dùng";
      }
      const hashPassword = user.password;
      const matches = await bcrypt.compare(data.password, hashPassword);
      if (!matches) {
        throw "Tên đăng nhập hoặc mật khẩu không hợp lệ";
      }

      user.password = null;
      const token = await jwt.sign(
        { username: user.username, password: user.password, role: user.role },
        SECRECT
      );
      res.redirect("/product");
    } catch (error) {
      data.error = error;
      console.log(data);
      res.render("auth/login.ejs", {
        layout: "layouts/auth",
        data: data,
      });
    }
  }

  async sendOtp(req, res) {
    const email = req.params.email;
    try {
      const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      const isEmail = emailPattern.test(email);
      if (!isEmail) {
        throw "Email không hợp lệ!";
      }
      const check = await User.findOne({ username: email });
      if (check) {
        throw "Email đã tồn tại!";
      }
      const num = await otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      const salt = await bcrypt.genSalt(10);
      const subject = "Xác nhận email";
      const text = `Mã xác nhận của bạn là ${num}`;
      sendEmail(email, subject, text);
      const otp = await bcrypt.hash(num, salt);
      await Otp.create({ username: email, otp: otp });
      res.render("auth/register.ejs", {
        layout: "layouts/auth",
        email: email,
        error: null,
        fullname: null,
        password: null,
      });
    } catch (error) {
      console.log(error);
      res.render("auth/register.ejs", {
        layout: "layouts/auth",
        email: email,
        error: error,
        fullname: null,
        password: null,
      });
    }
  }
  async fogortpw(req, res) {
    res.render("auth/email.ejs", {
      layout: "layouts/auth",
      error: null,
    });
  }

  async fogortpw2(req, res) {

      const email = req.body.email;
        const emailPattern = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        const isEmail = emailPattern.test(email);
        if (!isEmail) {
          return res.render("auth/email.ejs", {
            layout: "layouts/auth",
            error: "Email không hợp lệ!",
          });
        }

        const check = await User.findOne({ username: email, role: true });
        if (!check) {
          return res.render("auth/email.ejs", {
            layout: "layouts/auth",
            error: "Không tìm thấy người dùng",
          });
        }
        
        const num = await otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          specialChars: false,
          lowerCaseAlphabets: false,
        });
        const salt = await bcrypt.genSalt(10);
        const subject = "Xác nhận email";
        const text = `Mã xác nhận của bạn là ${num}`;

        sendEmail(email, subject, text);
        const otp = await bcrypt.hash(num, salt);
        await Otp.create({ username: email, otp: otp });

        res.render("auth/otp.ejs", {
          layout: "layouts/auth",
          error: null,
          username: email
        });
     
  }

  async sendOtp2(req, res) {

    const otp = req.body.code;
    const username = req.body.username;

    try {
      const otpHolder = await Otp.findOne({username: req.body.username}).sort({
        time: -1,
      });
      if (!otpHolder) {
        throw "Xác thực OTP không thành công!";
      }
      const hashOtp = otpHolder.otp;
      const matches = await bcrypt.compare(otp, hashOtp);
      if (!matches) {
        throw "OTP không đúng!";
      }
      await Otp.deleteMany({username: req.body.username});

      res.render("auth/password.ejs", {
        layout: "layouts/auth",
        error: null,
        username
      });

    } catch (error) {
      console.log(error);
      res.render("auth/otp.ejs", {
        layout: "layouts/auth",
        error: error,
        username
      });
    }

  }

  async passWd(req, res) {
    const {username, password, password1} = req.body;
    const user = await User.findOne({ username: req.body.username })

    if(password1.length < 6){
      return res.render("auth/password.ejs", {
        layout: "layouts/auth",
        error: 'Mật khẩu phải đủ 6 kí tự trở lên!',
        username
      });
    }

    if(password != password1){
      return res.render("auth/password.ejs", {
        layout: "layouts/auth",
        error: 'Mật khẩu không trùng nhau!',
        username
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(password, salt);
    user.password = hashPass;
    user.save();

    res.redirect('/user/login');

  }

  async register(req, res) {
    const body = req.body;
    console.log(body);
    const otp = body.code;
    delete body.code;
    try {
      const otpHolder = await Otp.findOne({ username: body.username }).sort({
        time: -1,
      });
      if (!otpHolder) {
        throw "OTP authentication failed!";
      }
      if (otpHolder.length == 0) {
        throw "Please verify your email before registering";
      }
      const hashOtp = otpHolder.otp;
      const matches = await bcrypt.compare(otp, hashOtp);
      if (!matches) {
        throw "OTP not correct!";
      }
      await Otp.deleteMany({ username: body.username });
      body.role = true;
      const salt = await bcrypt.genSalt(10);
      const password = body.password;
      const hashPass = await bcrypt.hash(password, salt);
      body.password = hashPass;
      await User.create(body);
      res.render("auth/register.ejs", {
        layout: "layouts/auth",
        email: null,
        error: "Register successful",
        fullname: null,
        password: null,
      });
    } catch (error) {
      console.log(error);
      res.render("auth/register.ejs", {
        layout: "layouts/auth",
        email: body.username,
        error: error,
        fullname: body.fullname,
        password: body.password,
      });
    }
  }

  async list(req, res) {
    try {
      const array = await User.find({ role: false });
      console.log(array.length);
      res.render("user/viewUser", {
        layout: "layouts/main",
        data: array,
        title: "Người dùng",
      });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      const data = await User.findById({ _id: req.params.id });
      res.render("user/detailUser", {
        layout: "layouts/main",
        data: data,
        title: "Người dùng",
      });
    } catch (error) {
      res.json(error);
    }
  }

  async insert(req, res) {
    if (req.method == "POST") {
      req.session.message = {
        type: "success",
        message: "Đã tạo thành công",
      };

      const body = req.body;
      const salt = await bcrypt.genSalt(10);
      const password = body.password;
      const hashPass = await bcrypt.hash(password, salt);
      body.password = hashPass;
      body.avatar = "https://s.net.vn/za1l";
      await User.create(body);
      return res.redirect("/user");
    }
    res.render("user/addUser", { layout: "layouts/main", title: "Người dùng" });
  }

  async edit(req, res) {
    const id = req.params.id;
    const data = await User.findById({ _id: req.params.id });

    res.render("user/editUser", {
      layout: "layouts/main",
      data,
      title: "Người dùng",
    });
  }

  async editPost(req, res) {}

  async delete(req, res) {
    const id = req.params.id;

    req.session.message = {
      type: "success",
      message: "Đã xoá thành công",
    };

    await User.findByIdAndDelete(id)
      .then((user) => {
        if (!user) {
          throw "User not found!";
        }
        // if(user.avatar != 'https://s.net.vn/za1l') deleteImage(user.avatar);
        res.redirect("/user");
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  }

  async logout(req, res) {
    res.render("auth/logout", { layout: "layouts/main", title: "Đăng xuất" });
  }

  async logoutP(req, res) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  }
}

module.exports = new Controller();
