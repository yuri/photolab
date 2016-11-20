const R = require('ramda');
const batch = require('./batch');
const sourceFileList = require('./sourceFileList');

// var fs = require('fs');
// var Q = require('q');

// var path = require('path');
// var process = require('process');
// var moment = require('moment');

// function logError(error) {
//   console.error(error);
// };


// function log(x) {
//   console.log(x);
//   return x;
// }


// function makeImporter(config) {
//   return R.pPipe(
//     getFiles,
//     // R.filter(config.filterFunction),
//     R.map(makeItem),
//     R.filter(function (item) {
//       return (item.extension==='.JPG') || (item.extension==='.MTS');
//     }),
//     R.map(addDate),
//     Q.all,
//     R.sortBy(function(x) { return x.date; }),
//     annotateWithBatches,
//     R.groupBy(function(x) { return x.batch; }),
//     getSortedGroups
//   );
// };

exports.getNewishFilesByDateAndBatch = function(config) {

  const imageDirectories = sourceFileList.getSubdirectories('/Volumes/Camera\ Card/DCIM/');

  const dirs = [
    '/Volumes/Camera\ Card/PRIVATE/AVCHD/BDMV/STREAM/',
    ...imageDirectories
  ];

  const files = sourceFileList.getFilesWithTimestampsSorted(dirs);
  const batches = batch.groupIntoBatches(files);

  return R.groupBy((batch) => batch.date)(batches);

  // const getItems = makeImporter(config);
  // const dirs = getDirectories(config);
  // return dirs.map( dir => ({
  //   path: dir,
  //   getItems: function() {
  //     return getItems(dir)
  //       .then(null, logError);
  //   }
  // }));
};