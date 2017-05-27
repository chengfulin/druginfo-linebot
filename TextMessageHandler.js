
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
}

module.exports = new TextMessageHandler();