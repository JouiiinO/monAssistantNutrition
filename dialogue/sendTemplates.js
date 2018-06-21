// send functions dependency
const sendFunctions = require('./sendFunctions.js');

const textMessage = (recipientId, messageText, messageMeta = null, callback = null) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
      metadata: messageMeta,
    },
  };

  sendFunctions.send('messages', messageData, callback);
};
exports.textMessage = textMessage;

const imageMessage = (recipientId, imageUrl, callback = null) => {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: 'image',
        payload: {
          url: imageUrl,
        },
      },
    },
  };

  sendFunctions.send('messages', messageData, callback);
};
exports.imageMessage = imageMessage;

exports.productsList = (recipientId, products) => {
  const productsToSend = [];
  products.map((product) => productsToSend.push({
    title: product.product.product_name_fr,
    image_url: product.product.image_front_url,
    buttons: [
      {
        type: 'postback',
        title: 'Choisir ce produit',
        payload: `PRODUCT_PICK_${product.code}`,
      },
    ],
  }));

  for (let i = 0; i < productsToSend.length; i = i + 4) {
    const messageData = {
      recipient: {
        id: recipientId,
      },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'list',
            top_element_style: 'compact',
            elements: productsToSend.filter((a, idxProduct) => (idxProduct >= i && idxProduct < i + 4)),
          },
        },
      },
    };

    sendFunctions.send('messages', messageData, () => {
      if (productsToSend.length <= i + 4) {
        textMessage(recipientId, `🤔 Il semble qu'il y ait ${productsToSend.length} produits correspondant à ta recherche, Appuie sur "Choisir ce produit" pour sélectionner le bon !`);
      }
    });
  }
};

exports.productCard = (recipientId, product, template = 'large') => {
  const templateMenu = (buttons, title) => ({
    recipient: {
      id: recipientId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title,
              buttons,
            },
          ],
        },
      },
    },
  });

  const buttonsFirstMenu = [
    {
      type: 'postback',
      title: 'Nutritions',
      payload: `PRODUCT_DETAILS_NUTRITION_${product.code}`,
    },
    {
      type: 'postback',
      title: 'Ingrédients',
      payload: `PRODUCT_DETAILS_INGREDIENTS_${product.code}`,
    },
  ];

  const buttonsSecondaryMenu = [
    {
      type: 'postback',
      title: 'Huile de Palme',
      payload: `PRODUCT_DETAILS_PALMOIL_${product.code}`,
    },
    {
      type: 'postback',
      title: 'Allergènes',
      payload: `PRODUCT_DETAILS_ALLERGEN_${product.code}`,
    },
  ];

  const buttonsThirdMenu = [
    {
      type: 'postback',
      title: 'Changer de produit',
      payload: 'PRODUCT_CHANGE',
    },
  ];

  const sendMenu = (callback = null) => {
    // send first menu
    sendFunctions.send('messages', templateMenu(buttonsFirstMenu, 'Informations principales'), () => {
      // send secondary menu
      sendFunctions.send('messages', templateMenu(buttonsSecondaryMenu, 'Informations secondaires'), () => {
        // send third menu
        sendFunctions.send('messages', templateMenu(buttonsThirdMenu, 'Autres'), () => {
          if (callback) {
            callback();
          }
        });
      });
    });
  };

  if (template === 'large') {
    // send text first
    textMessage(recipientId, `Très bien, tu as choisi le produit ${product.product_name_fr} 🤗`, null, () => {
      // send image of the product
      imageMessage(recipientId, product.image_front_url, () => {
        sendMenu(() => {
          // send final text
          textMessage(recipientId, 'Utilises les boutons ci-dessus pour avoir plus d\'informations sur un point précis, n\'hésites pas à taper le nom d\'un autre produit pour changer ! 🙃');
        });
      });
    });
  } else {
    sendMenu();
  }
};
