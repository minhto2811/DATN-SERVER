const Voucher = require("../../model/voucher");
const { uploadImage, deleteImage } = require("../../utils/uploadImage");

class Controller {
  async list(req, res) {
    try {
      const data = await Voucher.find({ all: true, userId: null });
      res.render("voucher/viewVoucher", {
        layout: "layouts/main",
        data,
        title: "Voucher",
      });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      const data = await Voucher.findById({ _id: req.params.id });
      if (data.type != undefined) {
        switch (data.type) {
          case 0:
            data.typeText = "Giảm chi phí vận chuyển";
            break;
          case 1:
            data.typeText = "Giảm giá sản phẩm";
            break;
          default:
            break;
        }
      }

      if (data.discount_type != undefined) {
        switch (data.discount_type) {
          case 0:
            data.discount_type_Text = "Giảm tiền mặt";
            break;
          case 1:
            data.discount_type_Text = "Giảm theo %";
            break;
          default:
            break;
        }
      }
      res.render("voucher/detailVoucher", {
        layout: "layouts/main",
        data: data,
        title: "Voucher",
      });
    } catch (error) {
      res.json(error);
    }
  }

  async insert(req, res) {
    if (req.method == "POST") {
      try {
        const body = req.body;

        if (body.discount_type == 1 && body.discount_value > 100) {
          req.session.message = {
            type: "danger",
            message: "Tạo voucher thất bại: % không được lớn hơn 100",
          };

          return res.redirect("/voucher");
        }

        req.session.message = {
          type: "success",
          message: "Đã tạo thành công",
        };

        body.all = true;

        await Voucher.create(body);
        return res.redirect("/voucher");
      } catch (error) {
        req.session.message = {
          type: "danger",
          message: "Tạo voucher thất bại",
        };

        return res.redirect("/voucher");
      }
    }
    res.render("voucher/addVoucher", {
      layout: "layouts/main",
      title: "Voucher",
    });
  }

  async edit(req, res) {
    const data = await Voucher.findById({ _id: req.params.id });

    res.render("voucher/editVoucher", {
      layout: "layouts/main",
      data,
      title: "Voucher",
    });
  }

  async editPost(req, res) {
    let {
      code,
      type,
      discount_type,
      discount_value,
      description,
      expiration_date,
      expiration_date2,
      _id,
    } = req.body;

    if (expiration_date2 != "") {
      expiration_date = expiration_date2;
    }

    req.session.message = {
      type: "success",
      message: "Đã chỉnh sửa thành công",
    };

    await Voucher.findByIdAndUpdate(_id, {
      code: code,
      type: type,
      discount_type: discount_type,
      discount_value: discount_value,
      expiration_date: expiration_date,
      description: description,
    });

    res.redirect("/voucher");
  }

  async delete(req, res) {
    const id = req.params.id;

    req.session.message = {
      type: "success",
      message: "Đã xoá thành công",
    };

    await Voucher.findByIdAndDelete(id)
      .then((voucher) => {
        if (!voucher) {
          throw "Voucher not found!";
        }

        res.redirect("/voucher");
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  }
}

module.exports = new Controller();
