const mongoose = require('mongoose');

const products = new mongoose.Schema({
  packaging: String,
  creator: String,
  product_name_fr: String,
  code: String,
  image_small_url: String,
  generic_name_fr: String,
  complete: Boolean,
  states_hierarchy: [String],
  brands: String,
  brands_tags: [String],
  _keywords: [String],
});

exports.buildModel = () => {
  mongoose.model('products2', products);
};
