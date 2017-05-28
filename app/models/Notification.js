var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var NotificationSchema = new Schema({
    time: { type: Date, 'default': Date.now },
    address: { type: String },
    latitude: { type: Number, required: true, 'default': 0.0 },
    longitude: { type: Number, required: true, 'default': 0.0 },
    drug: { type: String, required: true },
    token: { type: String, 'default': null }
});

module.exports = mongoose.model('Notification', NotificationSchema);