const express = require('express');
const crypto = require('crypto');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const line = require('@line/bot-sdk');

const channelSecret = 'f2b0bd7ed2faf7f3fcddc58a67306561'; // Channel secret string

const app = express();
app.use(morgan('dev')); // log every request on console
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // parsing application/json

app.post('/', (req, res) => {
    const signature = crypto.createHmac('SHA256', channelSecret)
        .update(JSON.stringify(req.body))
        .digest('base64');
    if (req.get('X-Line-Signature') === signature) {
        res.status = 200;
    }
});

app.listen(process.env.PORT || 8080, () => {
    console.log('> server is running on port' + process.env.PORT || 8080);
});