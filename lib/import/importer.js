var R = require('ramda');
var Q = require('q');
var source = require('./source.js');
var destination = require('./destination.js');
var path = require('path');

function copyGroupToDestination(group) {
  console.log();
  console.log('# Batch ', group.key, '-', group.date, '-----------------');
  var getter = destination.makeDestinationGetter(group);

  group.items.forEach(function(item) {
    var source = path.join(item.parentDir, item.batchDir, item.fileName);
    destinationPath = getter.getItemPath(item);
    console.log('cp -a', source, destinationPath);
  });
}

var copyToDestination = function(groups) {

  return R.map(copyGroupToDestination)(groups);
};

exports.import = function(config) {
  var sourceDirs = source.makeSources(config);
  var allDone = Q.all(sourceDirs.map(function(sourceDir) {
    return sourceDir.getItems()
      .then(copyToDestination)
      .then(function() {
        console.log('mv', sourceDir.path, config.sourceDirectory + '/Archive/');
      })
      .then(function() {
        return sourceDir;
      });
  }));

  allDone
    .then(null, function(error) {
      console.log(error);
    });
};