const R = require('ramda');
const path = require('path');
const fs = require('fs');
const moment = require('moment');

// Returns the list of files in a directory.
const getFilesForDirectory = (directoryPath) =>
  fs.readdirSync(directoryPath)
    .map(fileName => path.join(directoryPath, fileName));

// Returns the list of all the files in a list of directories.
const getFiles = directoryPaths =>
  [].concat.apply([], directoryPaths.map(getFilesForDirectory));


// Gets birth timestamp for a file.
const getFileTimestamp = path => moment(fs.statSync(path).birthtime);

// Returns the list of all files in a list of directories with timestamps.
const getFilesWithTimestamps = directoryPaths =>
  getFiles(directoryPaths)
    .map(path => ({path, timestamp: getFileTimestamp(path) }));

const getFilesWithTimestampsSorted = directoryPaths =>
  R.sortBy(
    x => x.timestamp,
    getFilesWithTimestamps(directoryPaths)
  );

exports.getFilesWithTimestampsSorted = getFilesWithTimestampsSorted;
exports.getSubdirectories = getFilesForDirectory;

exports.test = {
  getFiles,
  getFileTimestamp,
};