const express = require('express');
const morgan = require('morgan');
const linebot = require('linebot');
const bodyParser = require("body-parser");

const bot = linebot({
    channelId: '[channel id]',
    channelSecret: '[channel secret]',
    channelAccessToken: '[channel access token]',
    verify: true // Verify 'X-Line-Signature' header (default=true) 
});

require("./config/database");

const app = express();
const linebotParser = bot.parser();
app.use(morgan('dev')); // log every request on console
app.use(express.static(__dirname + '/public'));

app.post('/', linebotParser);
const apiRouter = require('./api/api');
app.use(bodyParser.urlencoded({ extended: true })); // parsing application/x-www-form-urlencoded
app.use(bodyParser.json())
app.use('/api', apiRouter);
app.get('/trydetect', (req, res) => {
    const detector = require('./DrugDetection');
    detector.process(res);
});

// handle message event
const textMessageHandler = require('./TextMessageHandler');
bot.on('message', (event) => {
    textMessageHandler.process(event);
});

// handle postback event
const postbackHandler = require('./PostBackHandler');
bot.on('postback', (event) => {
    postbackHandler.process(event);
});

app.listen(process.env.PORT || 8080, () => {
    console.log('> server is running on port ' + process.env.PORT || 8080);
});