const config = require('../config.json')
const routing = require('./routing')
const express = require("express");
const app = express();

const accountSid = config.sms.accountSid
const authToken = config.sms.authToken

const client = require('twilio')(accountSid, authToken)

// Recieving 
const http = require('http');
const bodyParser = require('body-parser');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// Allows incoming to not include unnecessary information
app.use(bodyParser.urlencoded({
  extended: false
}));

app.post('/sms', async (req, res) => {
    const twiml = new MessagingResponse();
    console.log(`Message is ${req.body.Body.toLowerCase()}`)
    // Routing
    let reply = await routing.route(req.body)
    twiml.message(reply);
    // Honestly not sure what this is - Maybe the end of a prommise?
    res.writeHead(200, {
      'Content-Type': 'text/xml'
    });
    res.end(twiml.toString());
})

// Server to listen to incoming webhooks on
http.createServer(app).listen(config.sms.port, () => {
    console.log(`Express server listening on port ${config.sms.port} for incoming SMS requests`);
  });

