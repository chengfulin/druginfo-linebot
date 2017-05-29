const spawn = require('child_process').spawn;

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
        const py = spawn('python', ['./python/tf_files/label_image.py']);
        py.stdout.on('data', (data) => {
            outputData = data.toString();
            console.log('>> on data: ' + data.toString());
        });
        py.stdout.on('end', () => {
            console.log('>> on end');
            res.send(outputData || 'no data');
        });
        py.stdin.write('morphine.jpg\n');
        py.stdin.end();
    }
}

module.exports = new DrugDetection();
