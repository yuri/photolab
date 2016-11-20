const path = require('path');
const existingBatchDirectories = require('./existingBatchDirectories');
const alphabet = require('./alphabet');

const makeDestinationDirGetter = rootDirs => {

  const lastLetterByDate = existingBatchDirectories.findLastLetterForEachDate(rootDirs);
  return date => {
    const lastUsedLetter = lastLetterByDate[date];
    // start with the last letter used by existing batches for this date.
    let index = lastLetter ? alphabet.getLetterForPosition(lastUsedLetter) : 0;
    return batch => {
      index += 1;
      const nextLetter = alphabet.getLetterForPosition(index);
      return batch.date + '-' + nextLetter;
    };
  };
};

class DestinationDirectoryNameGetter {
  constructor(destinationDirectory, otherLocalLocations) {
    const rootDirs = [destinationDirectory, ...otherLocalLocations];
    this.destinationDirectory = destinationDirectory;
    this.lastLetterByDate = existingBatchDirectories.findLastLetterForEachDate(rootDirs);
  }

  setDate(newDate) {
    this.date = date;
    this.lastUsedLetter = this.lastLetterByDate[date];
    this.index = this.lastUsedLetter ? alphabet.getLetterForPosition(this.lastUsedLetter) : 0;
  }

  getNewBatchDirectoryName() {
    this.index += 1;
    this.usedRandomSuffixes = {};
    const batchDirectory = this.date + '-' + alphabet.getLetterForPosition(this.index);
    this.batchDirectoryPath = path.join(this.destinationDirectory, batchDirectory);
    return this.batchDirectoryPath;
  }

  getRandomSuffix() {
    const randomSuffix = ('' + (10000 + Math.random() * 10000)).slice(1,5);
    if (this.usedRandomSuffixes[randomSuffix]) {
      return this.getRandomSuffix(); // try again recursively
    }
    this.usedRandomSuffixes[randomSuffix] = true;
    return randomSuffix;
  }

  getNewDestinationPath(timestamp, extension) {
      const fileNameBase = timestamp.format('YYYYMMDD_HHmmss');
      const randomSuffix = this.getRandomSuffix();
      const fileName = fileNameBase + '_' + randomSuffix + '.' + extension;
      return path.join(this.batchDirectoryPath, fileName);
  }
}

exports.DestinationDirectoryNameGetter = DestinationDirectoryNameGetter;

