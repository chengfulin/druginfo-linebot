const drugsInfo = require('./drugs.json');
const Notification = require("./app/models/Notification");

class TextMessageHandler{
    constructor() {
        this._keywords = {
            notify: /^(通報|我要通報)\s+/,
            search: /^(查詢|我要查詢)\s+/,
            cancel: /^是的$/
        };
        this._pattern = {
            notify: /^(通報|我要通報)\s+.+/,
            search: /^(查詢|我要查詢)\s+.+/,
            cancel: /^是的$/
        };
    }

    /**
     * Process LINE text message event
     * @param {*} event 
     */
    process(event) {
        if (this._pattern.notify.test(event.message.text)) {
            this.processNotificationDrug(event);
        }
        else if (this._pattern.search.test(event.message.text)) {
            this.processDrugInfo(event);
        }
        else if (event.message.type === 'location') {
            this.processNotification(event);
        }
        else if (this._pattern.cancel.test(event.message.text)) {
            this.cancelNotification(event);
        }
        else {
            this.checkToCompleteNotification(event);
        }
    }

    /**
     * 查詢藥品資訊
     * @param {*} event 
     */
    processDrugInfo(event) {
        const output = event.message.text.substring(event.message.text.match(this._keywords.search)[0].length);
        let info = "";
        let foundDrugName = "";
        for (let index = 0; index < drugsInfo.length; ++index) {
            const names = drugsInfo[index][1]['藥物名稱'] + drugsInfo[index][2]['俗名'];
            if (names.indexOf(output.trim()) !== -1) {
                info = drugsInfo[index][6]['說明'];
                foundDrugName = drugsInfo[index][1]['藥物名稱'];
                break;
            }
        }
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
        const token = this.getToken(event);
        Notification.findOne({ token: token })
            .then((notification) => {
                notification.time = new Date(event.timestamp);
                notification.address = event.message.address || "";
                notification.latitude = event.message.latitude;
                notification.longitude = event.message.longitude;
                notification.token = null;
                notification.save()
                    .then(() => {
                        console.log('> save notification');
                        event.reply('通報成功');
                    })
                    .catch((error) => {
                        console.log(error.message);
                        event.reply('通報失敗');
                    });
            })
            .catch(() => {
                // no such document
            });
    }

    /**
     * Create new notification with drug name
     * @param {*} event 
     */
    processNotificationDrug(event) {
        const token = this.getToken(event);
        const output = event.message.text.substring(event.message.text.match(this._keywords.notify)[0].length);
        let foundDrugName = "";
        for (let index = 0; index < drugsInfo.length; ++index) {
            const names = drugsInfo[index][1]['藥物名稱'];
            if (names.indexOf(output.trim()) !== -1) {
                foundDrugName = drugsInfo[index][1]['藥物名稱'];
                break;
            }
        }
        if (foundDrugName.length === 0) {
            event.reply('請輸入正確的藥品名稱。');
        }
        else {
            let notification = new Notification();
            notification.drug = foundDrugName;
            notification.token = token;
            notification.save()
                .then(() => { 
                    console.log('> new notification');
                    event.reply('請在左下角"+"號，選擇通報位置資訊。');
                })
                .catch((error) => {
                    console.log(error.message);
                    event.reply('設定通報失敗');
                });
        }
    }

    /**
     * Check whether complete the notification or not
     * @param {*} event 
     */
    checkToCompleteNotification(event) {
        const token = this.getToken(event);
        Notification.findOne({ token: token })
            .then(() => {
                event.reply({
                    "type": "template",
                    "altText": "確認取消通報",
                    "template": {
                        "type": "confirm",
                        "text": "要取消通報嗎？",
                        "actions": [
                            {
                                "type": "message",
                                "label": "是的",
                                "text": "是的"
                            },
                            {
                                "type": "message",
                                "label": "不是",
                                "text": "不是"
                            }
                        ]
                    }
                });
            });
    }

    /**
     * To cancel notification
     * @param {*} event 
     */
    cancelNotification(event) {
        const token = this.getToken(event);
        Notification.findOneAndRemove({ token: token })
            .then((notification) => {
                console.log('> cancel creating notification');
                event.reply('取消通報。');
            })
            .catch((error) => {
                console.log(error.message);
            });
    }

    /**
     * Get token to identify creating notification
     * @param {*} event 
     */
    getToken(event) {
        return event.source.type === "user"
            ? event.source.userId : event.source.type === "group"
                ? event.source.groupId : event.source.roomId;
    }
}

module.exports = new TextMessageHandler();