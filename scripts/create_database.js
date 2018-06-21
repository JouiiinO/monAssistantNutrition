// mongoose dependecy
const mongoose = require('mongoose');
mongoose.Promise = Promise;

// Connect the Mongo Nutritions Database
const mongoDB = require('../database/connect.js');

// raw model schema
const productRawModel = require('../database/productRawModel.js');

const statesHierarchy = ['en:complete', 'en:nutrition-facts-completed', 'en:ingredients-completed'];

const getRawList = (callback) => {
  const ProductsRaw = mongoose.model('products2');

  ProductsRaw.find({
    product_name_fr: { $exists: true, $ne: null },
    states_hierarchy: { $all: statesHierarchy },
  }, 'product_name_fr code complete states_hierarchy brands brands_tags _keywords', (err, productsList) => {
    const productFiltered = productsList.filter((product) => product.product_name_fr);
    console.log('Got the raw list');
    callback(productFiltered);
  });
};

const importToProductsCollection = (rawList, callback) => {
  const Products = mongoose.model('products');

  Products.remove({}, () => {
    console.log('database removed');
    const insert = Products.insertMany(rawList);

    console.log('Start import to Products collection');
    insert.then(() => {
      callback();
    });
  });
};

mongoDB.start(() => {
  productRawModel.buildModel();
  getRawList((rawList) => {
    importToProductsCollection(rawList, () => {
      console.log('import done');
      process.kill(process.pid);
    });
  });
});
