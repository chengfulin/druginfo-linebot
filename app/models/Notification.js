var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    time: { type: Date, "default": Date.now },
    address: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
});

module.exports = mongoose.model("Notification", NotificationSchema);