const mongoose = require('mongoose');

const products = new mongoose.Schema({
  product_name_fr: String,
  code: String,
  complete: Boolean,
  states_hierarchy: [String],
  brands: String,
  brands_tags: [String],
  _keywords: [String],
});

exports.buildModel = () => {
  mongoose.model('products', products);
};
