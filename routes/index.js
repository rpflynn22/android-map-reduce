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
    var collection = db.collection('phone-users');
    var droid_id = req.param('android_id');
    collection.find({android_id: droid_id}, {fields:{_id:0}}, function(err, doc) {
      res.write(JSON.stringify(doc));
      //res.write(String(doc.length));
      if (typeof doc.length === 'undefined') {
        collection.insert({android_id: droid_id}, function(err, result) {
          if (err) {
            return console.error(err);
          }
          res.send(200);
        });
      } else {
        res.end("id exists");
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
      // DO STUFF!!!!
      var filepath = "./uploads/" + files[0];
      var droid_id = req.param("android_id");
      mongodb.Db.connect(process.env.MONGOHQ_URL, function(err, db) {
        var collection = db.collection('phone-users');
        collection.find({}, {fields:{android_id:0}}, function(err, results) {
          var idarr = Array();
          for (i = 0; i < results.length; i++) {
            idarr.push(results[i]._id.toString());
          }
          idarr.sort();
          collection.find({android_id:droid_id}, {fields:{android_id:0}}, function(err, target) {
            var index = idarr.indexOf(target[0]._id.toString());
            fs.readFile(filepath, function(err, data) {
              if (err) throw err;
              var linesArray = String(data).split("\n");
              var linesPerPhone = Math.floor(linesArray.length / idarr.length);
              var rem = linesArray.length % idarr.length;
              var myStartLine = index * linesPerPhone;
              if (index == (idarr.length - 1)) linesPerPhone += rem;
              var specLines = linesArray.slice(myStartLine, myStartLine + linesPerPhone);
              var output = specLines.join("\n");
              res.write(output);
              res.end();
            });
          });
        });        
      });
    }
  });
});
 
module.exports = router;





