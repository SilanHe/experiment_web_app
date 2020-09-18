// Include the cluster module
var cluster = require('cluster');
var EXPERIMENT_BUCKET_NAME = 'experimentset1';

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

    var ddbTable =  process.env.STARTUP_SIGNUP_TABLE;
    var snsTopic =  process.env.NEW_SIGNUP_TOPIC;
    var app = express();

    app.set('view engine', 'ejs');
    app.set('views', __dirname + '/views');
    if (isDevelopmentMachine.localeCompare("TRUE") == 0) {
        app.use(express.static('.'));
        app.use(bodyParser.urlencoded({extended:false}));
    } else {
        app.use(bodyParser.urlencoded({extended:false}));
    }
    
    app.get('/', function(req, res) {
        res.render('index', {
            static_path: 'static',
            theme: process.env.THEME || 'flatly',
            flask_debug: process.env.FLASK_DEBUG || 'false',
            s3: s3
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
            return data.Contents;
        },
        function(error) {
            console.log("S3 listObjectV2 Error:" + error);
        }).then(
        function(data) {
            // fetch all images asyncrhonously
            let trialImageRequests = [];
            for (var i = 0; i < data.length; i++) {
                let params = {
                    Bucket: EXPERIMENT_BUCKET_NAME,
                    Key: data[i].Key
                };
                let getObjectPromise = s3.getObject(params).promise();
                trialImageRequests.push(getObjectPromise);
            }

            // nested promise then chaining. not sure if this is good practice
            let trialImages = Promise.all(trialImageRequests).then(
            function(s3Images) {

                function encode(data)
                {
                    return Buffer.from(data).toString('base64');
                }

                // shuffle the s3Images
                function shuffle(array) {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * i);
                        const temp = array[i];
                        array[i] = array[j];
                        array[j] = temp;
                    }
                }
                // pair up the images
                let pairedImages = [];
                for (var i = 0; i < s3Images.length; i += 2) {
                    pairedImages.push({
                        stimulus1_name: data[i].Key,
                        stimulus2_name: data[i+1].Key,
                        stimulus1: encode(s3Images[i].Body),
                        stimulus2: encode(s3Images[i+1].Body)
                    });
                }

                
                shuffle(pairedImages);
                res.json({pairedImages:pairedImages});
            },
            function(error) {
                console.log("S3 getObject Promise All:" + error);
            });
        },
        function(error) {
            console.log("S3 listObjectsV2 Contents Sort Error:" + error);
        });
    });

    app.post('/submitexperiment', function(req, res) {
        let item = {
            'id': {'S': req.body.id},
            'code': {'S': req.body.code},
            'data': {'M': req.body.previewAccess}
        };

        ddb.putItem({
            'TableName': ddbTable,
            'Item': item,
            'Expected': { email: { Exists: false } }        
        }, function(err, data) {
            if (err) {
                var returnStatus = 500;

                if (err.code === 'ConditionalCheckFailedException') {
                    returnStatus = 409;
                }

                res.status(returnStatus).end();
                console.log('DDB Error: ' + err);
            } else {
                sns.publish({
                    'Message': 'MTurk ID: ' + req.body.name + "\r\nCode: " + req.body.code,
                    'Subject': 'New subject experiment!',
                    'TopicArn': snsTopic
                }, function(err, data) {
                    if (err) {
                        res.status(500).end();
                        console.log('SNS Error: ' + err);
                    } else {
                        res.status(201).end();
                    }
                });            
            }
        });
    });

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}