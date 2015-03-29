var fs = require('fs');
var _ = require('lodash');
var Q = require('q');
var exif = require('exif');
var R = require('ramda');
var path = require('path');

function logError(error) {
  console.error(error);
};

var getExifData = Q.denodeify(function(path, callback) {
  new exif.ExifImage({image: path}, callback);
});

var getExifDate = R.pPipe(
  getExifData,
  R.prop('exif'),
  R.prop('DateTimeOriginal'),  
  R.replace(/[\s\:]/g, '')
);

var getExifDate = R.pPipe(
  getExifData,
  R.prop('exif'),
  R.prop('DateTimeOriginal'),  
  R.replace(/[\s\:]/g, '')
);

function getDatePromise(item) {
  if (item.extension==='.JPG') {
    return getExifDate(item.path);
  } else if (item.extension==='.MTS') {
    return Q.when(item.fileName.split('.')[0]);
  } else {
    return Q.reject(new Error('Not a supported file type:', item.extension));
  }
}

function addDate(item) {
  return getDatePromise(item)
   .then(function(date) {
      item.date = date;
      return item;
    });
}

function getSeconds(date) {
  var isoDate = [
    date.slice(0,4), '-',
    date.slice(4,6), '-',
    date.slice(6,8), 'T',
    date.slice(8,10), ':',
    date.slice(10,12), ':',
    date.slice(12,14)
  ].join('');
  return new Date(isoDate).getTime() / 1000;
}

function annotateWithBatches(items) {
  var lastSeconds = getSeconds(items[0].date);
  var groupCounter = 0;
  function makeNewBatch () {
    return groupCounter += 1;
  }
  var batch = makeNewBatch();
  var annotate = R.map(function(item) {
    var seconds = getSeconds(item.date);
    if (seconds - lastSeconds > 2000) { // 30 minutes
      batch = makeNewBatch();
    }
    lastSeconds = seconds;
    item.batch = batch;
    return item;
  });
  return annotate(items);
}

function getDirectory(config) {
  config = config || {};
  var dirs = fs.readdirSync(config.sourceDirectory)
    .filter(config.filterFunction)
    .sort();
  return config.sourceDirectory + '/' + dirs[0];
}

function getFiles(directoryPath) {
  return R.map(function(fileName) {
      return path.join(directoryPath, fileName);
    })(fs.readdirSync(directoryPath));
}

function makeItem(filePath) {
  var pathParts = path.dirname(filePath).split('/');
  var batchDir = pathParts.pop();
  return {
    extension: path.extname(filePath),
    parentDir: pathParts.join('/'),
    batchDir: batchDir,
    fileName: filePath.split('/').pop(),
    path: filePath
  };
}

function log(x) {
  console.log(x);
  return x;
}

var compareNumerically = function(a, b) {
  return a - b;
};

var getSortedGroups = function(groups) {
  function makeGroupForKey (key) {
    var firstItemDate = groups[key][0].date;
    var groupDate = [
      firstItemDate.slice(0,4),
      firstItemDate.slice(4,6),
      firstItemDate.slice(6,8)
    ].join('.');
    return {
      date: groupDate,
      key: key,
      items: groups[key]
    };
  }
  return R.pPipe(
    R.keys,
    R.sort(compareNumerically),
    R.map(makeGroupForKey)
  )(groups);
};

function makeImporter(config) {
  return R.pPipe(
    getFiles,
    // R.filter(config.filterFunction),
    R.map(makeItem),
    R.filter(function (item) {
      return (item.extension==='.JPG') || (item.extension==='.MTS');
    }),
    R.map(addDate),
    Q.all,
    R.sortBy(function(x) { return x.date; }),
    annotateWithBatches,
    R.groupBy(function(x) { return x.batch; }),
    getSortedGroups
  );
};

exports.makeSource = function(config) {
  var getItems = makeImporter(config);
  var dir = getDirectory(config);
  return {
    path: dir,
    getItems: function() {
      return getItems(dir)
        .then(null, logError);
    }
  };
};