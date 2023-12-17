const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Product = new Schema(
  {
    product_name: { type: String, require: true },
    brand_id: { type: String, require: true },
    percent_discount: { type: Number, default: 0 },
    image_preview: { type: String, default: "https://firebasestorage.googleapis.com/v0/b/shopping-6b085.appspot.com/o/default%2Fnew-product.png?alt=media&token=9ddcc893-c9c4-4fb1-9775-0a45093f50b8" },
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

