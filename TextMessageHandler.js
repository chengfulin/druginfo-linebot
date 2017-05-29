const drugsInfo = require('./drugs.json');
const Notification = require("./app/models/Notification");
const exec = require('child_process').exec;
const fs = require('fs');

class TextMessageHandler{
    constructor() {
        this._keywords = {
            notify: /^(通報|我要通報)\s+/,
            search: /^(查詢|我要查詢)\s+/,
            cancel: /^是的$/,
            notCancel: /^不是$/,
            help: /^我藥報抱$/
        };
        this._pattern = {
            notify: /^(通報|我要通報)\s+.+/,
            search: /^(查詢|我要查詢)\s+.+/,
            cancel: /^是的$/,
            notCancel: /^不是$/,
            help: /^我藥報抱$/
        };
    }

    /**
     * Process LINE text message event
     * @param {*} event 
     */
    process(event) {
        if (event.message.type === 'image') {
            this.processDrugImage(event);
        }
        else if (event.message.type === 'location') {
            this.processNotification(event);
        }
        else if (this._pattern.help.test(event.message.text)) {
            this.checkToCompleteNotification(event)
                .then((num) => {
                    if (num === 0) this.showHelp(event);
                });
        }
        else if (this._pattern.notify.test(event.message.text)) {
            this.checkToCompleteNotification(event)
                .then((num) => {
                    if (num === 0) this.processNotificationDrug(event);
                });
        }
        else if (this._pattern.search.test(event.message.text)) {
            this.checkToCompleteNotification(event)
                .then((num) => {
                    if (num === 0) this.processDrugInfo(event);
                });
        }
        else if (this._pattern.cancel.test(event.message.text)) {
            this.cancelNotification(event);
        }
        else if (!this._pattern.notCancel.test(event.message.text)) {
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
        let foundDrugImg = "";
        let infoObj = null;
        for (let index = 0; index < drugsInfo.length; ++index) {
            const names = drugsInfo[index][1]['藥物名稱'] + drugsInfo[index][2]['俗名'];
            if (names.indexOf(output.trim()) !== -1) {
                infoObj = drugsInfo[index];
                break;
            }
        }
        if (infoObj) {
            event.reply({
                "type": "template",
                "altText": "管制藥品資訊",
                "template": {
                    "type": "buttons",
                    "thumbnailImageUrl": infoObj[7]['圖片'].split(';')[0],
                    "title": infoObj[1]['藥物名稱'],
                    "text": infoObj[2]['俗名'],
                    "actions": [
                        {
                            "type": "postback",
                            "label": "分級",
                            "data": 'name=' + infoObj[1]['藥物名稱'] + '&index=3&col=分級'
                        },
                        {
                            "type": "postback",
                            "label": "醫療用途",
                            "data": 'name=' + infoObj[1]['藥物名稱'] + '&index=4&col=醫療用途'
                        },
                        {
                            "type": "postback",
                            "label": "濫用方式",
                            "data": 'name=' + infoObj[1]['藥物名稱'] + '&index=5&col=濫用方式'
                        },
                        {
                            "type": "postback",
                            "label": "說明",
                            "data": 'name=' + infoObj[1]['藥物名稱'] + '&index=6&col=說明'
                        }
                    ]}
                })
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
                if (!notification) {
                    event.reply('無此通報資訊');
                    return;
                }
                notification.time = new Date(event.timestamp);
                notification.address = event.message.address || "";
                notification.latitude = event.message.latitude;
                notification.longitude = event.message.longitude;
                notification.token = null;
                notification.save()
                    .then(() => {
                        console.log('> save notification');
                        event.reply('通報成功');
                    });
            })
            .catch((error) => {
                console.log(error.message);
                event.reply('通報失敗');
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
        return Notification.count({ token: token })
            .then((num) => {
                if (num > 0)
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
                return num;
            });
    }

    /**
     * To cancel notification
     * @param {*} event 
     */
    cancelNotification(event) {
        const token = this.getToken(event);
        Notification.count({ token: token })
            .then((num) => {
                if (num === 0) return;
                Notification.deleteMany({ token: token })
                    .then(() => {
                        console.log('> cancel creating notification');
                        event.reply('取消通報。');
                    });
            })
            .catch(error => console.log(error.message));
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

    showHelp(event) {
        event.reply('你好！我藥報抱！\n通報濫用藥物情形\n請告訴我"通報  藥品名"\n查詢管制藥品資訊\n請跟我說"查詢  藥品名"');
    }

    processDrugImage(event) {
        event.message.content()
            .then((content) => {
                const imageData = content.toString('base64');
                this.detectImg(imageData);
            })
            .catch(error => console.log(error));
    }

    detectImg(imageData) {
        var matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        const tempFileName = `${Date.now()}.${response.type}`;
        fs.writeFile(`${Date.now()}.${response.type}`, response.data, (error) => {
            if (error) throw error;
            exec(`python ./python/tf_files/label_image.py ${tempFileName}`, (error, stdout, stderr) => {
                if (error) {
                    throw new Error('>> detect failed');
                } else {
                    event.reply(`辨識結果: ${stdout}`);
                    fs.unlink(tempFileName, (err) => {
                        if (err) throw err;
                        console.log('>> successfully delete temp file');
                    });
                }
            });
        });
    }
}

module.exports = new TextMessageHandler();