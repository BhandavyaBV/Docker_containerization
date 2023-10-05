var express = require('express');
var router = express.Router();
const csv = require('csv-parser')
const fs = require('fs')
const axios = require('axios')
const results = [];

/* GET users listing. */
router.post('/', function(req, res, next) {
  var body = req.body;
  var file = body.file?body.file:null;
  var name = body.name?body.name:null;
  var key = body.key?body.key:null;
  var result = {}

  if(file){
    if(name && key){
      if(key!="temperature" && key!="location")
      {
          result={
            file:file,
            "error":"Invalid key parameters"
        }
        res.status(200).json(result).end();
      }
       
      else{
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
            if(results.length==0){
              res.status(200).json({
                file:file,
                "error":"File not in csv format"
              }).end();
            }
            else{
              if(key=="location"){
                var matchItem = null;
              for(let item of results){
                if(item.name && item.latitude && item.longitude && item['temperature']){
                  if(item.name==name){
                    matchItem = item;
                    break;
                  }
                }
                else{
                  res.status(200).json({
                    file:file,
                    "error":"File not in csv format"
                  }).end();
                  return;
               }    
            }
            if(matchItem){
              result={
                "file":file,
                "latitude":parseFloat(matchItem.latitude),
                "longitude":parseFloat(matchItem.longitude)
              }
              res.status(200).json(result).end();
            }
            else{
              result={
                "file":file,
                "error":"Name not found"
              }
              res.status(200).json(result).end();
            }
            
           }else{
              var data = body;
              axios.post('http://container2:6000/user-info',data).then(response=>{
                if(response.status==200)
                  res.status(200).json(response.data).end();
                else
                  res.status(200).json({
                    file:file,
                    "error":"Error with container 2"
                  }).end();
              })
           }
          }
        });
      }
    }
    else{
      result={
        "file":file,
        "error":"Missing parameters"
      }
      res.status(200).json(result).end();
    }
    
  }
  else{
    result={
      "file":file,
      "error":"Invalid JSON Input"
    }
    res.status(200).json(result).end();
  }
});

module.exports = router;
