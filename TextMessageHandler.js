var fetch = require("node-fetch");

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
        fetch('http://data.fda.gov.tw/cacheData/50_3.json')
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                const info = "";
                data.forEach((drug) => {
                    const names = drug[1]['藥物名稱'] + drug[2]['俗名'];
                    if (names.indexOf(search) !== -1) {
                        info = drug[6]['說明'];
                        return false;
                    }
                });
                return info;
            })
            .then((info) => {
                if (!info || info.length === 0) return;
                event.reply(info);
            })
            .catch(error => console.log(error.message));
    }
}

module.exports = new TextMessageHandler();