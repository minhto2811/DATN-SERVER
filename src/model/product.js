const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema(
  {
    product_name: { type: String, require: true },
    brand_id: { type: String, require: true },
    percent_discount: { type: Number, default: 0 },
    image_preview: { type: String },
    vote: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    time: { type: Date, default: Date.now },
    product_type_id: { type: String },
    min_price: { type: Number },
    max_price: { type: Number },
    delete: { type: Boolean, require: true, default: false }
  }, {
  collection: "Product"
});



module.exports = mongoose.model('Product', Product)

