const path = require('path');
const fs = require('fs');
const R = require('ramda');

const fakeFsForTesting = {};

// Returns safely a list of children for a directory. Returns an empty list if
// called a file that is not a directory.
const getChildrenSafely = parent => {
  if (Object.keys(fakeFsForTesting).length > 0) {
    return fakeFsForTesting[parent] || [];
  }
  return (fs.statSync(parent).isDirectory() && fs.readdirSync(parent)) || [];
}

const batchDirRegex = /^20[0-9][0-9]\.[0-9][0-9]\.[0-9][0-9]/;

// Recursively finds subdirectories that contain batches of photos/videos.
const findBatchesInDirectory = parent => getChildrenSafely(parent)
  .map(subDirectory => {
    const isBatchDir = batchDirRegex.test(subDirectory);
    if (isBatchDir) {
      return subDirectory.split(' ')[0];
    }
    return findBatchesInDirectory(path.join(parent, subDirectory));
  });

const findAllExistingBatches = (roots) => R.flatten(
  roots.map(findBatchesInDirectory)
);

const findLastLetterForEachDate = (roots) => R.fromPairs(
  findAllExistingBatches(roots)
    .sort()
    .map(batch => batch.split('-'))
);

const setFakeFsForTesting = (parent, structure) => {
  const children = Object.keys(structure);
  fakeFsForTesting[parent] = children;
  children.forEach(key => {
    setFakeFsForTesting(parent + '/' + key, structure[key]);
  });  
};

exports.findLastLetterForEachDate = findLastLetterForEachDate;
exports.test = {
  setFakeFsForTesting,
}