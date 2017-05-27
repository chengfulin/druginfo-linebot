const drugsInfo = require('./drugs.json');

class PostBackHandler {

    process(event) {
        const params = event.postback.data.split('&');
        const name = params[0].split('=')[1];
        const colIndex = parseInt(params[1].split('=')[1]);
        const col = params[2].split('=')[1];

        let replyMsg = "";
        for (let index = 0; index < drugsInfo.length; ++index) {
            if (drugsInfo[index][1]['藥物名稱'] === name) {
                replyMsg = col + '\n' + drugsInfo[index][colIndex][col];
                break;
            }
        }
        if (replyMsg.length > 0) event.reply(replyMsg);
    }
}

module.exports = new PostBackHandler();