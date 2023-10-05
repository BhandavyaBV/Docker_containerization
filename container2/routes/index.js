var express = require('express');
var router = express.Router();
const csv = require('csv-parser')
const fs = require('fs')
const results = []

/* GET home page. */
router.post('/', function(req, res, next) {
  var body = req.body;
  var name = body.name;
  var file = body.file;
  var temperature = body.temperature;
  var result={}
  fs.createReadStream("/tmp/"+file)
  .on('error',function(err){
    result={
      file:file,
      "error":"File not found"
    }
    res.status(200).json(result).end();
  })
  .pipe(csv())
  .on('data', (data) => {
    var currData={};
    Object.keys(data).forEach(key=>{
      currData[key.trim()] = data[key]
    })
    results.push(currData)
  })
  .on('end', () => {
    var matchItem = null;
    for(let item of results){
      if(item.name==name){
        matchItem = item;
        break;
      }
    }
    if(matchItem){
      result={
        "file":file,
        "temperature":parseInt(matchItem['temperature'])
      }
      res.status(200).json(result).end();
    }
    else{
      result={
        "file":file,
        "error":"Temperature not found"
      }
      res.status(200).json(result).end();
    }
  });
});

module.exports = router;


// docker tag local-image:tagname new-repo:tagname
// docker push new-repo:tagname
