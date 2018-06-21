const fetch = require('node-fetch');
const async = require('async');
const mongoose = require('mongoose');

// default states_hierarchy parameters for product query
const statesHierarchy = ['en:complete', 'en:nutrition-facts-completed', 'en:ingredients-completed'];
const queryElmsToReturn = 'code product_name_fr complete brands_tags';

const compare = (array1, array2) => {
  if (array1.length !== array2.length) {
    if (array1[0] !== array2[0]) return false;
  } else {
    for (let i = 0; i < array2.length; i++) {
      if (array1[i].compare) {
        if (!array1[i].compare(array2[i])) return false;
      } else if (array1[i] !== array2[i]) return false;
    }
  }
  return true;
};

// group products to get only 1 barcode per product
const groupByProductNameFr = (products) => {
  const productsGrouped = [];
  products.map((a) => {
    if (a.complete && a.product_name_fr) {
      if (!productsGrouped.some(x => (a.product_name_fr && x.productName === a.product_name_fr && compare(a.brands_tags.sort(), x.productBrands.sort())))) {
        productsGrouped.push({
          productName: a.product_name_fr,
          productBrands: a.brands_tags,
          barcode: a.code,
        });
      }
    }
    return true;
  });

  return productsGrouped;
};

// get product details from API with fetch method
const getProductDetails = (product, callback) => {
  fetch(`https://world.openfoodfacts.org/api/v0/product/${product.hasOwnProperty('barcode') ? product.barcode : product}.json`)
  .then((res) => res.json())
  .then((json) => callback(null, json));
};
exports.getProductDetails = getProductDetails;

// loop to get products details based on products barcode
exports.getProductsDetails = (products, callback) => {
  const productsToGetDetails = groupByProductNameFr(products);
  if (productsToGetDetails.length > 30) {
    callback(false);
  } else {
    async.map(productsToGetDetails, getProductDetails, (err, results) => {
      callback(results);
    });
  }
};

exports.getByProductsNameAndBrand = (productName, callback) => {
  const Products = mongoose.model('products');
  const productNames = productName.split(' ').splice(1).join(' ');

  // get product by name and brand
  Products.find({
    product_name_fr: { $regex: `.*(?:^|\\W)${productName.split(' ').join('.*(?:^|\\W)')}(?:$|\\W).*`, $options: 'i' },
    states_hierarchy: { $all: statesHierarchy },
  }, queryElmsToReturn, (errWithBrand, productsWithBrand) => {
    if (errWithBrand) console.log(errWithBrand);

    if (productsWithBrand.length <= 0) {
      // get product by name with random word
      Products.find({
        product_name_fr: { $regex: `.*(?:^|\\W)${productNames.split(' ').join('.*(?:^|\\W)')}(?:$|\\W).*`, $options: 'i' },
        brands: { $regex: `.*(?:^|\\W)${productName.split(' ')[0]}(?:$|\\W).*`, $options: 'i' },
        states_hierarchy: { $all: statesHierarchy },
      }, queryElmsToReturn, (errWithoutBrand, productsWithoutBrand) => {
        if (errWithoutBrand) console.log(errWithoutBrand);

        callback(productsWithoutBrand);
      });
    } else {
      callback(productsWithBrand);
    }
  });
};

// get product by name and complete
exports.getByProductsName = (productName, callback) => {
  const Products = mongoose.model('products');

  Products.find({
    _keywords: { $all: productName.split('\'').join('-').split(' ') },
    states_hierarchy: { $all: statesHierarchy },
  },
  queryElmsToReturn,
  (err, products) => {
    if (err) console.log(err);

    callback(products);
  });
};
