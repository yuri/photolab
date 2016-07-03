
var fs = require('fs');
var R = require('ramda');

var data = fs.readFileSync('verify/hash.txt').toString();

var src = {};
var dest = {};
var counters = {MTS: 0, JPG: 0};

data.split('\n').forEach(function(line) {
  var parts = line.split(' ');
  var path = parts[0];
  var md5 = parts[1];
  var ext;
  if (/Pictures\/Archive/.test(path)) {
    src[path] = md5;
    ext = path.split('.').slice(-1)[0];
    counters[ext]++;
  } else {
    dest[md5] = path;
  }
});

console.log(counters);

R.keys(src).forEach(function(srcPath) {
  var md5 = src[srcPath];
  var destPath = dest[md5];
  // console.log(srcPath, md5, destPath);
  if (! destPath) {
    console.log(srcPath, md5, destPath);
  }
});
