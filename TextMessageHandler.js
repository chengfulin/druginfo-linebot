var fetch = require('node-fetch');
const drugsInfo = require('./drugs.json');

class TextMessageHandler{
    constructor() {
        this._keywords = {
            echo: /^##\s+/,
            drugInfo: /^#druginfo\s+/
        };
        this._pattern = {
            echo: /^##\s+.+/,
            drugInfo: /^#druginfo\s+.+/
        };
    }

    /**
     * Process LINE text message event
     * @param {*} event 
     */
    process(event) {
        if (this._pattern.echo.test(event.message.text)) {
            this.processEcho(event);
        }
        else if (this._pattern.drugInfo.test(event.message.text)) {
            this.processDrugInfo(event);
        }
    }

    processEcho(event) {
        const output = event.message.text.substring(event.message.text.match(this._keywords.echo)[0].length);
        event.reply(output)
        .then(function (data) {
            // success 
        })
        .catch(function (error) {
            // error 
        });
    }

    processDrugInfo(event) {
        const search = event.message.text.substring(event.message.text.match(this._keywords.drugInfo)[0].length);
        let info = "";
        for (let index = 0; index < drugsInfo.length; ++index) {
            const names = drugsInfo[index][1]['藥物名稱'] + drugsInfo[index][2]['俗名'];
            if (names.indexOf(search) !== -1) {
                info = drugsInfo[index][6]['說明'];
                return false;
            }
        }
        if (info && info.length > 0) event.reply(info);
        else event.reply("no such drug");
    }
}

module.exports = new TextMessageHandler();