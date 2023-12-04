const Noti = require("../../model/notification");
const { uploadImage, deleteImage } = require("../../utils/uploadImage");

class Controller {
  async list(req, res) {
    try {
      const data = await Noti.find({all: true});
      res.render("notification/viewNoti", { layout: "layouts/main", data, title: "Notification" });
    } catch (error) {
      res.json(error);
    }
  }

  async detail(req, res) {
    try {
      delete req.session.message;
      const data = await Noti.findById({ _id: req.params.id });
      res.render("notification/detailNoti", { layout: "layouts/main", data, title: "Detail notification" });
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
          message: "Created successfully",
        };

        body.all = true;
    
        await Noti.create(body);
        return res.redirect("/notification");
      } catch (error) {
        console.log(error);
      }
     
    }
    req.session.message = '';
    res.render("notification/addNoti", { layout: "layouts/main", title: "Add notification"  });
  } 

  async edit(req, res) {
    const data = await Noti.findById({ _id: req.params.id });
    delete req.session.message;

    res.render("notification/editNoti", {
      layout: "layouts/main",
      data,
      title: "Notification of successful editing"
    });
  }

  async editPost(req, res) {
    let { title, description, image, _id, img } = req.body;

    if (req.file != null && req.file != undefined) {
      await deleteImage(img);
      const filename = req.file.filename;
      const filepath = req.file.path;
      const url = await uploadImage(filepath, filename);
      image = url;
    }

    req.session.message = {
      type: "success",
      message: "Edited successfully",
    };
  
    await Noti.findByIdAndUpdate(_id,{
      title: title,
      description : description,
      image: image
    });
  
    res.redirect('/notification');
  }

  async delete(req, res) {
     const id = req.params.id;

     req.session.message = {
      type: "success",
      message: "Deleted successfully",
    };

    await Noti.findByIdAndDelete(id)
      .then((notification) => {
        if (!notification) {
          throw "Notification not found!";
        }
        deleteImage(notification.image);
        res.redirect("/notification");
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
  }
}

module.exports = new Controller();
