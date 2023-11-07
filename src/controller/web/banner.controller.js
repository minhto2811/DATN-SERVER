const bannerModel = require("../../model/news");
const Brand = require("../../model/brand");
const { uploadImage, deleteImage } = require("../../utils/uploadImage");

class Controller {
  async list(req, res) {
    try {
      const array = await bannerModel.find();
      res.render("banner/viewBanner", { layout: "layouts/main", data: array });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      const data = await bannerModel.findById({ _id: req.params.id });
      res.render("banner/detailBanner", { layout: "layouts/main", data: data });
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

        await bannerModel
          .create(body)
          .then((rs) => {
            res.redirect(`/banner/edit/${rs._id}`);
          })
          .catch((err) => res.json(err));
      } catch (error) {
        console.log(error);
      }
    }
    const arrBrand = await Brand.find();
    res.render("banner/addBanner", { layout: "layouts/main", arrBrand  });
  }

  async putContent(req, res) {
    const data = req.body;
    const id_banner = req.params.id;
    if (req.file != null && req.file != undefined) {
      const filename = req.file.filename;
      const filepath = req.file.path;
      const url = await uploadImage(filepath, filename);
      data.image = url;
    }
    if (Object.keys(data).length > 0) {
      try {
        const banner = await bannerModel.findById(id_banner);
        if (!banner) {
          throw "banner not found";
        }
        banner.content.push(data);
        await banner.save();
      } catch (error) {
        console.log(error);
        res.json(error);
      }
    }
    res.redirect(`/banner/edit/${id_banner}`);
  }

  async edit(req, res) {
    const id = req.params.id;
    const data = await bannerModel.findById({ _id: req.params.id });
    const arrBrand = await Brand.find();

    res.render("banner/editBanner", {
      layout: "layouts/main",
      data,
      arrBrand
    });
  }

  async editPost(req, res) {
    let { brand, image, _id, img } = req.body;

    if (req.file != null && req.file != undefined) {
      await deleteImage(img);
      const filename = req.file.filename;
      const filepath = req.file.path;
      const url = await uploadImage(filepath, filename);
      image = url;
    }

    await bannerModel.findByIdAndUpdate(_id, {
      brand: brand,
      image: image,
    });

    res.redirect("/banner");
  }

  async delete(req, res) {
    const id = req.params.id;

    await bannerModel
      .findByIdAndDelete(id)
      .then((banner) => {
        if (!banner) {
          throw "Banner not found!";
        }
        for (let i = 0; i < banner.content.length; i++) {
            deleteImage(banner.content[i].image)
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
