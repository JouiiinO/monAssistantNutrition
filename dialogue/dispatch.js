// Dialogue helpers
const productsDialogueHelpers = require('./productsHelpers.js');
const globalDialogueHelpers = require('./global.js');

// users table helpers
const helpersUsersTable = require('../database/helpersUsers.js');

exports.typeMessage = (event) => {
  const senderID = event.sender.id;
  const message = event.message;

  if (message.is_echo) {
    console.log(`Received echo for message ${message.mid} and app ${message.app_id} with metadata ${message.metadata}`);
    return;
  }

  console.log(`Received message for user ${senderID} and page ${event.recipient.id} at ${event.timestamp} with message:${JSON.stringify(message)}`);

  // check user status
  helpersUsersTable.getUserByFacebookid(senderID, (userObject) => {
    // check if user exist
    if (!userObject) {
      // if not exist, create user and then display welcome message
      helpersUsersTable.createUser(senderID, () => {
        // globalDialogueHelpers.welcome(senderID);
      });
    }
    // user exists and ask to get list of products based on request
    productsDialogueHelpers.getProductsNameSendList(message.text, senderID);
  });
};

exports.typePostback = (event) => {
  const senderID = event.sender.id;
  const payloadSplitted = event.postback.payload.split('_');

  console.log(`Postback received with payload ${event.postback.payload}`);

  if (payloadSplitted[0].toLowerCase() === 'product') {
    // if the payload concern product
    if (payloadSplitted[1].toLowerCase() === 'pick') {
      // if user choose a product
      productsDialogueHelpers.getProductSendDetails(payloadSplitted[2], senderID);
    } else if (payloadSplitted[1].toLowerCase() === 'change') {
      // if user choose a product
      productsDialogueHelpers.changeProduct(senderID);
    } else if (payloadSplitted[1].toLowerCase() === 'details') {
      // if user desire to know more about the product
      if (payloadSplitted[2].toLowerCase() === 'nutrition') {
        // user want infos about nutritions
        productsDialogueHelpers.getProductSendNutritions(payloadSplitted[3], senderID);
      } else if (payloadSplitted[2].toLowerCase() === 'ingredients') {
        // user want infos about ingredients
        productsDialogueHelpers.getProductSendIngredients(payloadSplitted[3], senderID);
      } else if (payloadSplitted[2].toLowerCase() === 'palmoil') {
        // user want infos about palm oil
        productsDialogueHelpers.getProductSendPalmOil(payloadSplitted[3], senderID);
      } else if (payloadSplitted[2].toLowerCase() === 'allergen') {
        // user want infos about palm oil
        productsDialogueHelpers.getProductSendAllergen(payloadSplitted[3], senderID);
      }
    }
  } else if (payloadSplitted[0].toLowerCase() === 'user') {
    if (payloadSplitted[1].toLowerCase() === 'started') {
      globalDialogueHelpers.welcome(senderID);
    }
  }
};
