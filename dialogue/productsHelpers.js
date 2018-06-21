// send templates dependency
const sendTemplates = require('./sendTemplates.js');

// products table helpers
const helpersProductsTable = require('../database/helpersProducts.js');

// global dialogue helpers
const globalDialogueHelpers = require('./global.js');

const getProductsList = (productName, callback) => {
  helpersProductsTable.getByProductsName(productName, (products) => {
    if (products.length <= 0) {
      // no product match, try with product name + brand
      helpersProductsTable.getByProductsNameAndBrand(productName, (productsWithBrand) => {
        // if no product, return false, if product return the list
        if (productsWithBrand <= 0) {
          callback(false);
        } else {
          callback(productsWithBrand);
        }
      });
    } else {
      callback(products);
    }
  });
};

exports.getProductsNameSendList = (productName, senderID) => {
  getProductsList(productName, (products) => {
    if (!products) {
      sendTemplates.textMessage(senderID, 'Il semble y avoir un soucis avec le produit demandé, peux-tu tenter un autre nom ?');
    } else {
      if (products.length === 1) {
        // if there is only one product
        helpersProductsTable.getProductDetails(products[0].code, (err, productsDetailed) => {
          sendTemplates.productCard(senderID, productsDetailed.product);
        });
      } else {
        // get async details with the API
        helpersProductsTable.getProductsDetails(products, (productsDetailed) => {
          // if too much products
          if (!productsDetailed) {
            sendTemplates.textMessage(senderID, 'Ce produit est trop generique, peux-tu etre plus specifique ?');
          } else {
            sendTemplates.productsList(senderID, productsDetailed);
          }
        });
      }
    }
  });
};

exports.getProductSendDetails = (productCode, senderID) => {
  helpersProductsTable.getProductDetails(productCode, (err, product) => {
    sendTemplates.productCard(senderID, product.product);
  });
};

exports.getProductSendNutritions = (productCode, senderID) => {
  helpersProductsTable.getProductDetails(productCode, (err, product) => {
    // send the nutrition grade
    sendTemplates.textMessage(senderID, `Score nutritionnel : ${globalDialogueHelpers.findNutritionGradeMessage(product.product.nutrition_grades)}`, null, () => {
      // send the product details
      sendTemplates.textMessage(senderID, globalDialogueHelpers.nutritionFactsMessage(product.product), null, () => {
        // send again the product card to continue
        sendTemplates.productCard(senderID, product.product, 'light');
      });
    });
  });
};

exports.getProductSendIngredients = (productCode, senderID) => {
  helpersProductsTable.getProductDetails(productCode, (err, product) => {
    // send the product ingredients
    sendTemplates.textMessage(senderID, globalDialogueHelpers.ingredientsMessage(product.product), null, () => {
      // send again the product card to continue
      sendTemplates.productCard(senderID, product.product, 'light');
    });
  });
};

exports.getProductSendPalmOil = (productCode, senderID) => {
  helpersProductsTable.getProductDetails(productCode, (err, product) => {
    // send the product palm oil details
    sendTemplates.textMessage(senderID, globalDialogueHelpers.palmOilMessage(product.product), null, () => {
      // send again the product card to continue
      sendTemplates.productCard(senderID, product.product, 'light');
    });
  });
};

exports.getProductSendAllergen = (productCode, senderID) => {
  helpersProductsTable.getProductDetails(productCode, (err, product) => {
    // send the product palm oil details
    sendTemplates.textMessage(senderID, globalDialogueHelpers.allergenMessage(product.product.allergens), null, () => {
      // send again the product card to continue
      sendTemplates.productCard(senderID, product.product, 'light');
    });
  });
};

exports.changeProduct = (senderID) => {
  sendTemplates.textMessage(senderID, 'Tu as fini avec ce produit ?\nN\'hésites pas à en taper un nouveau 😎');
};
