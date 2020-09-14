/* Functions that wrap all s3 function calls*/
function getObjectList(s3, params) {
  s3.listObjectsV2(params, function(err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      // successful response
      return data;
    }          
  });
}

function getExperimentSet1ObjectList(s3) {
  var params = {
    Bucket: "experimentset1", 
    MaxKeys: 1000 // 1000 should be enough for our use case
  };

  var data = getObjectList(s3, params);

  console.log(data);

  return data;
}