const request = require('request');

exports.send = (type, messageData, callback = null) => {
  request({
    uri: `https://graph.facebook.com/v2.8/me/${type}`,
    qs: { access_token: process.env.MESSENGER_PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData,
  }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const recipientId = body.recipient_id;
      const messageId = body.message_id;

      if (messageId) {
        console.log(`Successfully sent message with id ${messageId} to recipient ${recipientId}`);
      } else {
        console.log(`Successfully called Send API for recipient %${recipientId}`);
      }

      if (callback) {
        callback();
      }
    } else {
      console.error('Failed calling Send API', response.statusCode, response.statusMessage, body.error);
    }
  });
};
