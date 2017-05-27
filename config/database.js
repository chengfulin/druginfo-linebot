var mongoose = require("mongoose");
var dbUri = "mongodb://meanadmin:R77K9ESG8TLY@ds059722.mlab.com:59722/mean276";

mongoose.Promise = global.Promise;
mongoose.connect(dbUri)
    .then(function () {
        console.log("Mongoose connected ...");
    })
    .catch(function (error) {
        console.log("Mongoose connection error: " + error.message);
    });
