const drugsInfo = require('./drugs.json');
const base64 = require('node-base64-image');
const Notification = require("./app/models/Notification");

class TextMessageHandler{
    constructor() {
        this._keywords = {
            echo: /^##\s+/
        };
        this._pattern = {
            echo: /^##\s+.+/
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
        else if (event.message.type === 'text') {
            this.processDrugInfo(event);
        }
        else if (event.message.type === 'location') {
            this.processNotification(event);
        }
    }

    processEcho(event) {
        const output = event.message.text.substring(event.message.text.match(this._keywords.echo)[0].length);
        event.reply(output.trim())
        .then(function (data) {
            // success 
        })
        .catch(function (error) {
            // error 
        });
    }

    /**
     * 查詢藥品資訊
     * @param {*} event 
     */
    processDrugInfo(event) {
        let info = "";
        let foundDrugName = "";
        for (let index = 0; index < drugsInfo.length; ++index) {
            const names = drugsInfo[index][1]['藥物名稱'] + drugsInfo[index][2]['俗名'];
            if (names.indexOf(event.message.text.trim()) !== -1) {
                info = drugsInfo[index][6]['說明'];
                foundDrugName = drugsInfo[index][1]['藥物名稱'];
                break;
            }
        };
        // console.log(foundDrugImg);
        if (info && info.length > 0) {
            event.reply(info)
                .then((data) => {
                    console.log(">> template success");
                    console.log(data);
                })
                .catch(error => console.log(error.message));
        }
        else event.reply("抱歉！沒有您找的管制藥品。");
    }

    /**
     * 通報位置
     * @param {*} event 
     */
    processNotification(event) {
        let notification = new Notification();
        notification.time = new Date(event.timestamp);
        notification.address = event.message.address || "";
        notification.latitude = event.message.latitude;
        notification.longitude = event.message.longitude;
        notification.save()
            .then(() => {
                console.log('> new notification');
                event.reply('通報成功');
            })
            .catch((error) => {
                console.log(error.message);
                event.reply('通報失敗');
            });
    }
}

module.exports = new TextMessageHandler();