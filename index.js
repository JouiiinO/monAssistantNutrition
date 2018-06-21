// modules dependencies
const bodyParser = require('body-parser');
const express = require('express');

// server config dependencies
const serverConfig = require('./server/server.js');

// Connect the Mongo Nutritions Database
const mongoDB = require('./database/connect.js');
mongoDB.start();

// load and test .env required var
require('dotenv').config();
if (!(process.env.MESSENGER_APP_SECRET && process.env.MESSENGER_VALIDATION_TOKEN && process.env.MESSENGER_PAGE_ACCESS_TOKEN)) {
  console.error('Missing config values');
  process.exit(1);
}

const app = express();
app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json({ verify: serverConfig.verifyRequestSignature }));

// WebHook Validation
app.get('/webhook', (req, res) => {
  serverConfig.webhookValidation(req, res);
});

// privacy policy
app.get('/privacy-policy', (req, res) => {
  serverConfig.sendPrivacyPolicy(req, res);
});

app.post('/webhook', (req, res) => {
  serverConfig.messageReceived(req, res);
});

// Start server
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));

  serverConfig.appListeningInitialisation();
});

module.exports = app;
