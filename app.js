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

  AWS.config.region = process.env.REGION;

  const ddb = new AWS.DynamoDB();

  const ddbTable = process.env.EXPERIMENT_DATA_TABLE;
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', `${__dirname}/views`);
  if (typeof isDevelopmentMachine !== 'undefined' && isDevelopmentMachine.localeCompare('TRUE') == 0) {
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
    const vertices = webgl.hillsAndValleys(webgl.AMPLITUDES[req.query.surfaceSlant],
      req.query.seed);
    const extremaIndex = webgl.getLocalExtremaInCenter(vertices,
      webgl.UMBRELLATHRESHHOLD[req.query.surfaceSlant], req.query.choice);
    res.json({ vertices, extremaIndex });
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
