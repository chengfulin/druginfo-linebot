const express = require('express');
const morgan = require('morgan');
const linebot = require('linebot');
const textMessageHandler = require('./TextMessageHandler');

const bot = linebot({
    channelId: '1517058705',
    channelSecret: 'f2b0bd7ed2faf7f3fcddc58a67306561',
    channelAccessToken: 'poBOF4jaxKKd8zfQjz79UqBNK1U69117TE1d80T75cE1G8ZYKeS/5pdGSqoanGNppBP717mlFuE/TE0sDvs6qER0Y7Uwt1TH/oouJ0VFMKGM6cysqnDjLL0Do1hgT9FjrqkLkp0q4YLj8SUWw3KY6wdB04t89/1O/w1cDnyilFU=',
    verify: true // Verify 'X-Line-Signature' header (default=true) 
});

const app = express();
const linebotParser = bot.parser();
app.use(morgan('dev')); // log every request on console
app.use(express.static(__dirname + '/public'));

app.post('/', linebotParser);

// handle message event
bot.on('message', function (event) {
    if (event.type === "text") textMessageHandler.process(event);
});

app.listen(process.env.PORT || 8080, () => {
    console.log('> server is running on port ' + process.env.PORT || 8080);
});