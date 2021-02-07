// Include the cluster module
const cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {
  // Count the machine's CPUs
  const cpuCount = require('os').cpus().length;

  // Create a worker for each CPU
  for (let i = 0; i < cpuCount; i += 1) {
    cluster.fork();
  }

  // Listen for terminating workers
  cluster.on('exit', (worker) => {
    // Replace the terminated workers
    console.log(`Worker ${worker.id} died :(`);
    cluster.fork();
  });

// Code to run if we're in a worker process
} else {
  const isDevelopmentMachine = process.env.IS_DEVELOPMENT_MACHINE;

  const webgl = require('./webgl');
  const AWS = require('aws-sdk');
  const express = require('express');
  const bodyParser = require('body-parser');
  const path = require('path');

  AWS.config.region = process.env.REGION;

  const ddb = new AWS.DynamoDB();

  const ddbTable = process.env.EXPERIMENT_DATA_TABLE;
  const app = express();

  app.use(express.static(path.join(__dirname, 'public')));
  app.use('/build/', express.static(path.join(__dirname, 'node_modules/three/build')));
  app.use('/jsm/', express.static(path.join(__dirname, 'node_modules/three/examples/jsm')));
  if (typeof isDevelopmentMachine !== 'undefined' && isDevelopmentMachine.localeCompare('TRUE') === 0) {
    app.use(express.static('.'));
  }

  app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: false,
    parameterLimit: 1000000, // experiment with this parameter and tweak
  }));

  app.get('/', (req, res) => {
    res.render('index', {
      static_path: 'static',
      flask_debug: process.env.FLASK_DEBUG || 'false',
    });
  });

  app.get('/getsurface', (req, res) => {
    const verticesPoints = webgl.hillsAndValleys(req.query.seed);
    const extremaIndex = webgl.getLocalExtremaInCenter(verticesPoints, req.query.choice);
    const heightMap = webgl.hillsAndValleysZ(verticesPoints);
    res.json({ heightMap, extremaIndex });
  });

  app.post('/submitexperiment', (req, res) => {
    const item = {
      Id: { S: req.body.id },
      data: { S: req.body.data },
    };

    ddb.putItem({
      TableName: ddbTable,
      Item: item,
    }, (err, data) => {
      if (err) {
        let returnStatus = 500;

        if (err.code === 'ConditionalCheckFailedException') {
          returnStatus = 409;
        }

        res.status(returnStatus).end();
        console.log(`DDB Error: ${err}`);
      } else {
        console.log(`Success: MTurk ID: ${req.body.id}`);
        res.status(200).end();
      }
    });
  });

  const port = process.env.PORT || 3000;

  const server = app.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}/`);
  });
}
