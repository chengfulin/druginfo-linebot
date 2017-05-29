const spawn = require('child_process').spawn;

class DrugDetection {

    process() {
        // var options = {
        //     args: ['morphine.jpg']
        // };

        // PythonShell.run('./python/tf_files/label_image.py', options, function (err, results) {
        //     if (err) throw err;
        //     // results is an array consisting of messages collected during execution
        //     console.log('results: %j', results);
        // });
        const py = spawn('python', ['./python/tf_files/label_image.py']);
        py.stdout.on('data', (data) => {
            console.log('>> on data: ' + data);
        });
        py.stdout.on('end', () => {
            console.log('>> on end');
        });
        py.stdin.write('morphine.jpg');
        py.stdin.end();
    }
}

module.exports = new DrugDetection();
