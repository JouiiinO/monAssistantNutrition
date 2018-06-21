// node dependencies
const crypto = require('crypto');
const request = require('request');
const path = require('path');

// messages dispatch dependency
const messageDispatch = require('../dialogue/dispatch.js');

exports.verifyRequestSignature = (req, res, buf) => {
  const signature = req.headers['x-hub-signature'];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an
    // error.
    console.error('Couldn\'t validate the signature.');
  } else {
    const elements = signature.split('=');
    const signatureHash = elements[1];

    const expectedHash = crypto.createHmac('sha1', process.env.MESSENGER_APP_SECRET)
    .update(buf)
    .digest('hex');

    if (signatureHash !== expectedHash) {
      throw new Error('Couldn\'t validate the request signature.');
    }
  }
};

exports.webhookValidation = (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' &&
  req.query['hub.verify_token'] === process.env.MESSENGER_VALIDATION_TOKEN) {
    console.log('Validating webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Failed validation. Make sure the validation tokens match.');
    res.sendStatus(403);
  }
};

exports.messageReceived = (req, res) => {
  const data = req.body;
  // Make sure this is a page subscription
  if (data.object === 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach((pageEntry) => {
      // Iterate over each messaging event
      pageEntry.messaging.forEach((messagingEvent) => {
        if (messagingEvent.message) {
          messageDispatch.typeMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          messageDispatch.typePostback(messagingEvent);
        } else {
          console.log('Webhook received unknown messagingEvent: ', messagingEvent);
        }
      });
    });

    res.sendStatus(200);
  }
};

exports.sendPrivacyPolicy = (req, res) => {
  console.log(__dirname);
  res.sendFile(path.join(`${__dirname}'/../html/privacypolicy.htm`));
};

exports.appListeningInitialisation = () => {
  // initialise domain names allowed
  request({
    uri: 'https://graph.facebook.com/v2.8/me/thread_settings',
    qs: { access_token: process.env.MESSENGER_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      setting_type: 'domain_whitelisting',
      whitelisted_domains: [
        'https://petersfancybrownhats.com',
        'https://peterssendreceiveapp.ngrok.io',
      ],
      domain_action_type: 'add',
    },
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log('Whitelist domains initialised!');
    } else {
      console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
    }
  });

  // greeting text
  request({
    uri: 'https://graph.facebook.com/v2.8/me/thread_settings',
    qs: { access_token: process.env.MESSENGER_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      setting_type: 'greeting',
      greeting: {
        text: 'Bonjour {{user_first_name}}, je vais tacher de faire de mon mieux afin de t\'aider à trouver des produits alimentaires de qualité !\n\nLe fonctionnement est simple : donnes moi un nom de produit et je vais tacher de le retrouver, ensuite tu pourras avoir accès à des informations precieuse comme les nutriments presents ou encore si le produit contient de l\'huile de palme.',
      },
    },
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log('Greeting text initialised!');
    } else {
      console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
    }
  });

  // get started button
  request({
    uri: 'https://graph.facebook.com/v2.8/me/thread_settings',
    qs: { access_token: process.env.MESSENGER_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: {
      setting_type: 'call_to_actions',
      thread_state: 'new_thread',
      call_to_actions: [{
        payload: 'USER_STARTED',
      }],
    },
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      console.log('Get started button initialised!');
    } else {
      console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
    }
  });
};
