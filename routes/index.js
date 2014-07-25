var express = require('express');
var router = express.Router();
var fs = require('fs');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET Hello World page. */
router.get('/helloworld', function(req, res) {
  res.render('helloworld', { title: 'Hello, World!' })
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
  mongo.Db.connect(mongoUri, (function(err, db) {
    db.collection('usercollection', function(er, collection) {
      collection.insert({"android_id":"123456"}, {safe: true}, func(e, rs)) {
        res.write("inserted");
        res.end();
      });
    });
  });
});
/*  collection.find({}, {fields:{android_id:0}}, function(e, docs) {
    var idarr = new Array();
    for (i = 0; i < docs.length; i++) {
      idarr.push(docs[i]._id);
    }
    idarr.sort();
    res.write(idarr.toString());
    res.end();
  });
});*/

/* GET new user page. */
router.get('/newuser', function(req, res) {
  res.render('newuser', { title: 'Add New User' });
});

/* POST to add User Service. */
router.post('/adduser', function(req, res) {
  var db = req.db;
  var collection = db.get('usercollection');
  collection.insert(req.body, function(err, doc) {
    res.send(
      (err === null) ? { msg: '' } : { msg: err }
    );
  });
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
      var db = req.db;
      var collection = db.get('usercollection');
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
    }
  });
});
 
module.exports = router;





