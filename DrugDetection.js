const exec = require('child_process').exec;

class DrugDetection {

    process(res) {
        // var options = {
        //     args: ['morphine.jpg']
        // };

        // PythonShell.run('./python/tf_files/label_image.py', options, function (err, results) {
        //     if (err) throw err;
        //     // results is an array consisting of messages collected during execution
        //     console.log('results: %j', results);
        // });
        let outputData;
        exec('python ./python/tf_files/label_image.py morphine.jpg', (error, stdout, stderr) => {
            if (error) {
                console.log(`>> exec error: ${error}`);
                res.status(500).send('/trydetect failed');
                return;
            }
            res.send(`output: ${stdout}`);
        });
    }
}

module.exports = new DrugDetection();
