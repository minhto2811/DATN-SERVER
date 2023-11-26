
const Product = require("../../model/product")
const Variations = require("../../model/variations")
const Description = require("../../model/description")
const Banner = require("../../model/news")
const Brand = require("../../model/brand")
const { uploadImage, deleteImage } = require('../../utils/uploadImage')
const TypeProduct = require("../../model/typeProduct")


class Controller {
  async pageHome(req, res) {
    try {
      const array = await Product.find({ delete: false }).lean()
      await Promise.all(array.map(async (item) => {
        delete item.delete

        const type_product = await TypeProduct.findById(item.product_type_id)
        if (type_product) {
          item.product_type = type_product.name
        }
        if (item.brand_id) {
          const brand = await Brand.findById(item.brand_id)
          if (brand) {
            item.brand_name = brand.brand
          }
          delete item.brand_id
        }
        delete item.product_type_id
        
      }))
      res.render("product/viewProduct.ejs", {
        layout: "layouts/main",
        data: array,
      });
    } catch (error) {
      res.json(error);
    }
  }


  async pageNewProduct(req, res) {
    try {
      var arrBrand, typeProduct
      await Promise.all([(async () => {
        arrBrand = await Brand.find({})
        if (!arrBrand) {
          throw ""
        }
      })(), (async () => {
        typeProduct = await TypeProduct.find({})
        if (!typeProduct) {
          throw ""
        }
      })()
      ])

      res.render("product/newProduct.ejs", { layout: "./layouts/main", brand: arrBrand, type: typeProduct });
    } catch (error) {
      console.log(error)
      res.json(error)
    }
  }

  newProduct(req, res) {
    const body = req.body
    Product.create(body)
      .then((rs) => {
        res.redirect('/product')
      })
      .catch((err) => res.json(err));
  }



  async deleteProduct(req, res) {
    try {
      const id = req.params.id
      await Promise.all([
        (async () => {
          const product = await Product.findByIdAndUpdate(id, { $set: { delete: true } })
          if (!product) {
            throw "Product not found!";
          }
        })(),
        (async () => {
          await Variations.findOneAndUpdate({ productId: id }, { $set: { delete: true } })
        })(),
      ])

      console.log("Delete product successful")
      res.redirect('/product')
    } catch (error) {
      console.log(error)
      res.json(error)
    }
  }

  async updateProduct(req, res) {
    const body = req.body
    const id = req.params.id
    try {
      const update = await Product.findOneAndUpdate({ _id: id }, { $set: body })
      if (!update) {
        throw ""
      }
      res.redirect(`/product`)
    } catch (error) {
      console.log(error)
      res.json(error)
    }
  }

  async addDescription(req, res) {
    const data = req.body
    const id = req.params.id
    try {
      const product = await Product.findById(id)
      if (!product) {
        const banner = await Banner.findById(id)
        if (!banner) {
          throw "Không tìm id tương ứng"
        }
      }

      if (req.file != null) {
        const filename = req.file.filename
        const filepath = req.file.path
        const url = await uploadImage(filepath, filename)
        data.image = url
      }

      if (data.title.length == 0 && data.description.length == 0 && !data.image) {
        throw "Không thể tạo dữ liệu trống"
      }
      data.id_follow = id
      const description = await Description.create(data)
      if (!description) {
        throw "Thêm mô tả thất bại"
      }
      res.redirect(`/product/description/${id}`)
    } catch (error) {
      console.log(error)
      res.json(error)
    }
  }

  async deleteDescription(req, res) {
    const id_product = req.params.id_product
    const id_description = req.params.id_description
    try {
      const product = await Product.findOne({ _id: id_product });
      if (!product) {
        throw "Không tìm thấy sản phẩm";
      }


      for (let i = 0; i < product.description.length; i++) {
        if (product.description[i]._id == id_description) {
          product.description.slice(i, 1)
          break
        }
      }
      await product.save()
      res.redirect(`/home/product/${id_product}`)
    } catch (error) {
      console.log(error);
      res.json({ code: 500, message: "Đã xảy ra lỗi" });
    }
  }

  async pageVariations(req, res) {
    const productId = req.params.id
    try {
      const data = await Variations.find({ productId: productId, delete: false }).sort({ _id: -1 })
      data.forEach(item => delete item.delete)
      res.render('product/variations.ejs', { layout: './layouts/main', data, productId: productId })
    } catch (error) {
      res.json(error)
    }

  }

  async detailProduct(req, res) {
    const productId = req.params.id
    try {
      var arrBrand, typeProduct, data
      await Promise.all([(async () => {
        arrBrand = await Brand.find({})
        if (!arrBrand) {
          throw "Không tìm thấy thương hiệu"
        }
      })(),
      (async () => {
        typeProduct = await TypeProduct.find({})
        if (!typeProduct) {
          throw "Không tìm thấy phân loại"
        }
      })(),
      (async () => {
        data = await Product.findOne({ _id: productId, delete: false })
        if (!data) {
          throw "Không tìm thấy sản phẩm"
        }
      })()
      ])
      res.render('product/detailProduct.ejs', { layout: './layouts/main', product: data, brand: arrBrand, type: typeProduct })
    } catch (error) {
      res.json(error)
    }
  }

  async pageNewVariations(req, res) {
    try {
      const productId = req.params.id
      const product = await Product.findOne({ _id: productId, delete: false })
      if (!product)
        throw "Không tìm thấy sản phẩm"
      const condition = (product.product_type_id == "6554f942866f4e5773778e10")
      res.render('product/newVariations.ejs', { layout: './layouts/main', productId: productId, condition: condition })
    } catch (error) {
      res.json(error)
    }
  }

  async NewVariations(req, res) {
    const data = req.body
    const productId = req.params.id
    data.productId = productId

    try {
      if (!req.file) {
        throw "e1"
      }
      const filename = req.file.filename
      const filepath = req.file.path
      const url = await uploadImage(filepath, filename)
      console.log("url " + url)
      data.image = url
      const variations = await Variations.create(data)
      if (!variations) {
        throw ""
      }
      const product = await Product.findById(productId)
      if (!product) {
        throw ""
      }

      if (!product.min_price) {
        product.min_price = data.price

      } else {
        if (product.min_price > data.price) {
          product.min_price = data.price

        }
      }
      if (!product.max_price) {
        product.max_price = data.price

      } else {
        if (product.max_price < data.price) {
          product.max_price = data.price

        }
      }
      if (!product.image_preview) {
        product.image_preview = data.image

      }
      product.total_quantity += variations.quantity



      await product.save()

      res.redirect(`/product/${productId}/variations`)
    } catch (error) {
      console.log(error)
      res.json(error)
    }


  }


  async pageDescription(req, res) {
    const id = req.params.id
    try {

      const descriptions = await Description.find({ id_follow: id })
      if (!descriptions) {
        throw "Không lấy được mô tả sản phẩm"
      }
      res.render('description/description.ejs', { layout: './layouts/main', id_follow: id, descriptions: descriptions })
    } catch (error) {
      console.log(error)
      res.json(error)
    }
  }


  async deleteVariations(req, res) {
    const id = req.params.id
    try {
      const variation = await Variations.findByIdAndUpdate(id, { $set: { delete: true } })
      if (!variation) {
        throw "Variations not found!"
      }
      res.redirect(`/product/${product_id}/variations`)
    } catch (error) {
      console.log(error)
      res.json(error)

    }
  }
}

module.exports = new Controller()
