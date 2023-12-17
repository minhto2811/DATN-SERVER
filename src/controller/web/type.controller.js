const Type = require("../../model/typeProduct");
const { uploadImage, deleteImage } = require("../../utils/uploadImage");

class Controller {
  async list(req, res) {
    try {
      const data = await Type.find({delete: false});
      res.render("typePro/viewType", { layout: "layouts/main", data, title: "Loại sản phẩm" });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      const data = await Brand.findById({ _id: req.params.id });
      res.render("typePro/detailBrand", { layout: "layouts/main", data: data, title: "Loại sản phẩm" });
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
  
        await Type.create(body);
        return res.redirect("/type");
      } catch (error) {
        console.log(error);
      }
     
    }
    res.render("typePro/addType", { layout: "layouts/main", title: "Loại sản phẩm" });
  }

  async edit(req, res) {
    const data = await Type.findById({ _id: req.params.id });

    res.render("typePro/editType", {
      layout: "layouts/main",
      data,
      title: "Loại sản phẩm"
    });
  }

  async editPost(req, res) {
    let { name,  image, _id, img } = req.body;

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
  
    await Type.findByIdAndUpdate(_id,{
      name: name,
      image: image
    });
  
    res.redirect('/type');
  }

  async delete(req, res) {
     const id = req.params.id;

    
     req.session.message = {
      type: "success",
      message: "Đã xoá thành công",
    };

    try {
      const type = await Type.findByIdAndUpdate(id, { $set: { delete: true } })
      if (!type) {
        throw "types not found!"
      }
      res.redirect('/type')
    } catch (error) {
      console.log(error)
      res.json(error)

    }

   
  }
}

module.exports = new Controller();
