var express = require('express');
var router = express.Router();
var fs = require('fs');
var mongodb = require('mongodb');
var url = require('url');

var connectionUri = url.parse(process.env['MONGOHQ_URL']);
var dbName = connectionUri.pathname.replace(/^\//, '');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET add file page. */
router.get('/newfile', function(req, res) {
  res.render('newfile', { title: 'Upload File' });
});

/* POST for uploading the selected file. */
router.post('/uploadfile', function(req, res) {
  fs.readFile(req.files.fileForCount.path, function (err, data) {
    res.write(data);
    res.end();
  });
});

/* GET for android devices to sign up. Should probably be a post. */
router.get('/signup', function(req, res) {
  mongodb.Db.connect(process.env.MONGOHQ_URL, function(err, db) {
    var collection = new mongodb.Collection(db, 'phone-users');
    var droid_id = req.param('android_id');
    var documents = collection.find({android_id: droid_id}, {});
    documents.toArray(function(err, docs) {
      if (docs.length == 0) {
        collection.insert({android_id: droid_id}, function(err, result) {
          if (err) {
            return console.error(err);
          }
          res.send(200);
        });
      } else {
          res.end('id already exists');
      }
    });
  });
});

/* GET for reading files. */
router.get('/readfile', function(req, res) {
  fs.readdir('./uploads/', function(err, files) {
    if (files.length == 0) {
      res.write("");
      res.end();
    } else {
      var filepath = "./uploads/" + files[0];
      var droid_id = req.param("android_id");
      var idarr = new Array();
      mongodb.Db.connect(process.env.MONGOHQ_URL, function(err, db) {
        var collection = new mongodb.Collection(db, 'phone-users');
        var docs = collection.distinct('_id', function(err, result) {
          for (i = 0; i < result.length; i++) {
            idarr.push(result[i].toString());
          }
          console.log('idarr ', idarr);
          idarr.sort();
          var thisDevice = collection.find({android_id:droid_id}, {fields:{android_id:0}});
          thisDevice.toArray(function(err, result) {
            console.log("thisdevice ", result[0]._id);
            var index = idarr.indexOf(result[0]._id.toString());
            console.log(index);
            fs.readFile(filepath, function(err, data) {
              if (err) throw err;
              var linesArray = String(data).split('\n');
              var linesPerPhone = Math.floor(linesArray.length / idarr.length);
              var rem = linesArray.length % idarr.length;
              var myStartLine = index * linesPerPhone;
              if (index == (idarr.length - 1)) linesPerPhone += rem;
              var specLines = linesArray.slice(myStartLine, myStartLine + linesPerPhone);
              var output = specLines.join('\n');
              res.write(output);
              res.end();
            });
          });
        });
      });
    }
  });
});

/* Post request to read list of keyvals from android map. */
router.post('/mapresponse', function(req, res) {
  var keyvals = req.param('keyvals');
  var droid_id = req.param('android_id');
  mongodb.Db.connect(process.env.MONGOHQ_URL, function(err, db) {
    var collection = new mongodb.Collection(db, 'map-key-vals');
    var lines = keyvals.split("\n");
    for (i = 0; i < lines.length; i++) {
      var linearr = lines[i].split("\t");
      var key = linearr[0];
      var val = linearr[1];
      collection.insert({android_id: droid_id, word: key, count: val}, function(err, result) {
        if (err) return console.error(err);
      });
    }
  });
  mongodb.Db.connect(process.env.MONGOHQ_URL, function(err, db) {
    var collection = new mongodb.Collection(db, 'map-key-vals');
    collection.distinct('android_id', function(err, result) {
      var numReturned = result.length;
      var phoneCollection = new mongodb.Collection(db, 'phone-users');
      phoneCollection.count(function(err, num) {
        if (num == numReturned) {
          var words = collection.find({}, {fields:{word:1, count:1}});
          words.toArray(function(err, keyValArray) {
            console.log(keyValArray);
            var reduceInput = {};
            for (i = 0; i < keyValArray.length; i++) {
              if (reduceInput[keyValArray[i].word] != undefined) {
                reduceInput[keyValArray[i].word].push(parseInt(keyValArray[i].count));
              } else {
                reduceInput[keyValArray[i].word] = [parseInt(keyValArray[i].count)];
              }
            }
            console.log(reduceInput);
          });
        } else {
          console.log('else');
        }
      });
    });
  });
});
    
 
module.exports = router;





