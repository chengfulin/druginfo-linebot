const spawn = require('child_process').spawn;
const py = spawn('python', ['./python/tf_files/label_image.py', 'morphine.jpg']);

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
        const py = spawn('python', ['./python/tf_files/label_image.py', 'morphine.jpg']);
        py.stdout.on('data', (data) => {
            dataString += data.toString();
        });
        py.stdout.on('end', () => {
            console.log('Sum of numbers=',dataString);
        });
        py.stdin.write(JSON.stringify(data));
        py.stdin.end();
    }
}

module.exports = new DrugDetection();
