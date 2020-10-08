// Include the cluster module
var cluster = require('cluster');
var EXPERIMENT_BUCKET_NAME = 'experimentset1';
var TUTORIAL_BUCKET_NAME = 'tutorialset1';

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {

        // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {
    var isDevelopmentMachine = process.env.IS_DEVELOPMENT_MACHINE;

    var AWS = require('aws-sdk');
    var express = require('express');
    var bodyParser = require('body-parser');

    AWS.config.region = process.env.REGION

    var sns = new AWS.SNS();
    var ddb = new AWS.DynamoDB();
    var s3 = new AWS.S3();

    var ddbTable =  process.env.EXPERIMENT_DATA_TABLE;
    var snsTopic =  process.env.EXPERIMENT_SUBJECT_TOPIC;
    var app = express();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    if (typeof isDevelopmentMachine !== "undefined" && isDevelopmentMachine.localeCompare("TRUE") == 0) {
        app.use(express.static('.'));
    }

    app.use(bodyParser.urlencoded({ 
        limit: '50mb',
        extended: false,
        parameterLimit: 1000000 // experiment with this parameter and tweak
    }));
    
    app.get('/', function(req, res) {
        res.render('index', {
            static_path: 'static',
            flask_debug: process.env.FLASK_DEBUG || 'false',
            s3: s3
        });
    });

    app.get('/tutorialimages', function(req, res) {

        // first fetch the whole list of images from s3
        let listObjectV2Promise = s3.listObjectsV2({
                Bucket: TUTORIAL_BUCKET_NAME, 
                MaxKeys: 1000 // 1000 should be enough for our use case
            }).promise();

        listObjectV2Promise.then(
        function(data) {
            // take our list of images and sort them
            data.Contents.sort(function (a,b) {
                return a.Key.localeCompare(b.Key);
            });
            
            res.json({sortedKeys: data.Contents});
        },
        function(error) {
            console.log("S3 listObjectV2 Error:" + error);
        });
    });

    app.get('/allexperimentimages', function(req, res) {

        // first fetch the whole list of images from s3
        let listObjectV2Promise = s3.listObjectsV2({
                Bucket: EXPERIMENT_BUCKET_NAME, 
                MaxKeys: 1000 // 1000 should be enough for our use case
            }).promise();

        listObjectV2Promise.then(
        function(data) {
            // take our list of images and sort them
            data.Contents.sort(function (a,b) {
                return a.Key.localeCompare(b.Key);
            });
            
            res.json({sortedKeys: data.Contents});
        },
        function(error) {
            console.log("S3 listObjectV2 Error:" + error);
        });
    });

    app.get('/getimage', function(req, res) {

        function encode(data)
        {
            return Buffer.from(data).toString('base64');
        }

        let getImageS3Promise = s3.getObject(req.query).promise();

        getImageS3Promise.then(
            function(data) {
                res.json({s3Object: encode(data.Body)})
            },
            function(error) {
                console.log("S3 getObject Error:" + error);
            }
        );

    });

    app.post('/submitexperiment', function(req, res) {

        let item = {
            'Id': {'S': req.body.id},
            'data': {'S': req.body.data}
        };

        ddb.putItem({
            'TableName': ddbTable,
            'Item': item,       
        }, function(err, data) {
            if (err) {
                var returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }

                res.status(returnStatus).end();
                console.log('DDB Error: ' + err);
            } else {
                console.log('Success: MTurk ID: ' + req.body.id);
                res.status(200).end();
            }
        });
    });

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}