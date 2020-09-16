// Include the cluster module
var cluster = require('cluster');

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

    app.get('/listexperimentimages', function(req, res) {
        var params = {
            Bucket: "experimentset1", 
            MaxKeys: 1000 // 1000 should be enough for our use case
          };

        s3.listObjectsV2(params, function(s3_err, s3_res) {
            if (s3_err) {
              console.log('S3 Error: ' + s3_err, s3_err.stack);
            } else {
                // take our list of images and sort them
                s3_res.Contents.sort(function (a,b) {
                       return a.Key.localeCompare(b.Key);
                });

                // pair up the images
                let pairedImages = [];
                for (var i = 0; i < s3_res.Contents.length; i += 2) {
                    pairedImages.push([s3_res.Contents[i], s3_res.Contents[i+1]]);
                }

                // shuffle the data
                function shuffle(array) {
                    for (let i = array.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * i);
                        const temp = array[i];
                        array[i] = array[j];
                        array[j] = temp;
                    }
                }
                shuffle(pairedImages);
                // add the shuffled and paired images to res object under mydata
                s3_res.mydata = {};
                s3_res.mydata.shuffledPairedImages = pairedImages;
                res.json(s3_res);
            }          
        });
    });

    app.get('/experimentimage', function(req, res) {
        console.log(req);
        let params = {
            Bucket: "experimentset1", 
            Key: req.query.key
          };

        s3.getObject(params, function(err, data) {
            if (err) {
                console.log('S3 Error: ' + err, err.stack);
            }

            function encode(data){
                let buf = Buffer.from(data);
                let base64 = buf.toString('base64');
                return base64
              }

            res.json({img:encode(data.Body)});
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