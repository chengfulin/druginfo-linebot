var PythonShell = require('python-shell');

class DrugDetection {

    process() {
        var options = {
            args: ['morphine.jpg']
        };

        PythonShell.run('./python/tf_files/label_image.py', options, function (err, results) {
            if (err) throw err;
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
        });
    }
}

module.exports = new DrugDetection();
