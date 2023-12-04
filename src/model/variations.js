const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const Variations = new Schema({
    productId: { type: String, require: true },
    import_price: { type: Number, require: true},
    price: { type: Number, require: true, default: 0 },
    image: { type: String },
    color: { type: String },
    ram: { type: String },
    rom: { type: String },
    quantity: { type: Number, require: true, default: 0 },
    delete: { type: Boolean, require: true, default: false }
}, {
    collection: "Variations"
});



module.exports = mongoose.model('Variations', Variations)