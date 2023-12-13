const bannerModel = require("../../model/news");
const Brand = require("../../model/brand");
const Product = require("../../model/product");
const { uploadImage, deleteImage } = require("../../utils/uploadImage");

class Controller {
  async list(req, res) {
    try {
      const array = await bannerModel.find();

      await Promise.all(
        array.map(async (i) => {
          const product = await Product.findById(i.productId);
          if (product) {
            i.product_name = product.product_name;;  
          }
        })
      );

      res.render("banner/viewBanner", { layout: "layouts/main", data: array, title: "Banner" });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      const data = await bannerModel.findById({ _id: req.params.id });
      const product = await Product.findById(data.productId);
      if (product) {
        data.product_name = product.product_name;;  
      }
      res.render("banner/detailBanner", { layout: "layouts/main", data: data, title: "Detail Banner" });
    } catch (error) {
      res.json(error);
    }
  }

  async insert(req, res) {
    if (req.method == "POST") {
      try {
        const body = req.body;

        if (req.file != null && req.file != undefined) {
          const filename = req.file.filename;
          const filepath = req.file.path;
          const url = await uploadImage(filepath, filename);
          body.image = url;
        }

        req.session.message = {
          type: "success",
          message: "Đã tạo thành công",
        };

          await bannerModel.create(body);
          return res.redirect("/banner");
      } catch (error) {
        console.log(error);
      }
    }

    const arr_Pro = await Product.find({ delete: false }).sort({time: -1}).lean();

    res.render("banner/addBanner", { layout: "layouts/main", arr_Pro, title: "Add Banner"});
  }


  async edit(req, res) {
    const data = await bannerModel.findById({ _id: req.params.id });
    const arr_Pro = await Product.find({ delete: false }).sort({time: -1}).lean();

    res.render("banner/editBanner", {
      layout: "layouts/main",
      data,
      arr_Pro,
      title: "Edit Banner"
    });
  }

  async editPost(req, res) {
    let { title, productId, image, _id, img } = req.body;

    if (req.file != null && req.file != undefined) {
      await deleteImage(img);
      const filename = req.file.filename;
      const filepath = req.file.path;
      const url = await uploadImage(filepath, filename);
      image = url;
    }

    req.session.message = {
      type: "success",
      message: "Đã chỉnh sửa thành công",
    };

    await bannerModel.findByIdAndUpdate(_id, {
      title: title,
      productId: productId,
      image: image,
    });

    res.redirect("/banner");
  }

  async delete(req, res) {
    const id = req.params.id;

    req.session.message = {
      type: "success",
      message: "Đã xoá thành công",
    };

    await bannerModel
      .findByIdAndDelete(id)
      .then((banner) => {
        if (!banner) {
          throw "Banner not found!";
        }
        deleteImage(banner.image);
        res.redirect("/banner");
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  }
}

module.exports = new Controller();
