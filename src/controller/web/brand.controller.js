const Brand = require("../../model/brand");
const { uploadImage, deleteImage } = require("../../utils/uploadImage");

class Controller {
  async list(req, res) {
    try {
      const data = await Brand.find();
      res.render("brand/viewBrand", { layout: "layouts/main", data, title: "Thương hiệu" });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      const data = await Brand.findById({ _id: req.params.id });
      res.render("brand/detailBrand", { layout: "layouts/main", data: data, title: "Thương hiệu" });
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
  
        await Brand.create(body);
        return res.redirect("/brand");
      } catch (error) {
        console.log(error);
      }
     
    }
    res.render("brand/addBrand", { layout: "layouts/main", title: "Thương hiệu" });
  }

  async edit(req, res) {
    const data = await Brand.findById({ _id: req.params.id });

    res.render("brand/editBrand", {
      layout: "layouts/main",
      data,
      title: "Edit Brand"
    });
  }

  async editPost(req, res) {
    let { brand, description, image, _id, img } = req.body;

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
  
    await Brand.findByIdAndUpdate(_id,{
      brand: brand,
      description : description,
      image: image
    });
  
    res.redirect('/brand');
  }

  async delete(req, res) {
     const id = req.params.id;

     req.session.message = {
      type: "success",
      message: "Đã xoá thành công",
    };

    await Brand.findByIdAndDelete(id)
      .then((brand) => {
        if (!brand) {
          throw "Brand not found!";
        }
        deleteImage(brand.image);
        res.redirect("/brand");
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  }
}

module.exports = new Controller();
