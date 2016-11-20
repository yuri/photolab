var R = require('ramda');
var Q = require('q');
var source = require('./source.js');
var destinationPaths = require('./destinationPaths.js');
var path = require('path');

const constants = require('../../constants');

// function copyGroupToDestination(group) {
//   console.log();
//   console.log('# Batch ', group.key, '-', group.date, '-----------------');
//   var getter = destination.makeDestinationGetter(group);

//   group.items.forEach(function(item) {
//     var source = path.join(item.parentDir, item.batchDir, item.fileName);
//     destinationPath = getter.getItemPath(item);
//     console.log('cp -a', source, destinationPath);
//   });
// }

// var copyToDestination = function(groups) {

//   return R.map(copyGroupToDestination)(groups);
// };

function printComment(comment) {
  console.log('# ' + comment);
}

function printNewLine() {
  console.log();
}

const escapePath = path => path.replace(' ', '\\ ');

const makeCommand = (command, ...paths) =>
  console.log(command + ' ' + paths.map(escapePath).join(' '));

exports.import = function(config) {
  const batchesByDate = source.getNewishFilesByDateAndBatch();
  const nameGetter = new destinationPaths.DestinationDirectoryNameGetter(
    constants.DESTINATION,
    constants.OTHER_LOCATIONS
  );

  for (date in batchesByDate) {
    printNewLine();
    printComment(date);
    nameGetter.setDate(date);
    for (batch of batchesByDate[date]) {
      const dir = nameGetter.getNewBatchDirectoryName();
      printNewLine();
      makeCommand('mkdir', dir);
      for (item of batch.items) {
        const destinationFilePath = nameGetter.getNewDestinationPath(
          item.timestamp,
          item.path.split('.').pop()
        );
        makeCommand('cp -p', item.path, destinationFilePath);
      }
    }
  }


  // const batchesByDate = source.getNewishFilesByDateAndBatch();
  // //console.log(JSON.stringify(batchesByDate, null, 2));
  // console.log(localRoots);
  // const getGetterForDate = destinationPaths.makeDestinationDirGetter(localRoots);

  // for (date in batchesByDate) {
  //   printComment(date);
  //   const getGetterForBatch = getGetterForDate(date);
  //   for (batch of batchesByDate[date]) {
  //     printComment(batch.batchNumber + '  ' + getGetterForBatch(batch));
  //   }
  // }

  // var sourceDirs = source.makeSources(config);
  // var allDone = Q.all(sourceDirs.map(function(sourceDir) {
  //   return sourceDir.getItems()
  //     .then(copyToDestination)
  //     .then(function() {
  //       console.log('mv', sourceDir.path, config.sourceDirectory + '/Archive/');
  //     })
  //     .then(function() {
  //       return sourceDir;
  //     });
  // }));

  // allDone
  //   .then(null, function(error) {
  //     console.log(error);
  //   });
};