const R = require('ramda');

// Assigns items to batches separated by a specified time difference.
function annotateWithBatchNumbers(items, threshold = 1800) {
  var lastSeconds = items[0].timestamp.unix();
  var batchCounter = 0;
  function makeNewBatchNumber () {
    return batchCounter += 1;
  }
  var batchNumber = makeNewBatchNumber();

  return items.map(item => {
    const seconds = item.timestamp.unix();
    if (seconds - lastSeconds > threshold) {
      batchNumber = makeNewBatchNumber();
    }
    lastSeconds = seconds;
    item.batchNumber = batchNumber;
    return item;
  });
}

// Adds the date representing the date of the whole batch.
const addBatchDate = (batch, getDate) => {
  batch.date = batch.items[0].timestamp.format('YYYY.MM.DD');
  return batch;
}

// Turns a list of items, into a sorted list of objects representing each the
// different batch.
const groupIntoBatches = items => R.pipe(
  // Add batch numbers to individual items
  annotateWithBatchNumbers,
  // Group the items by those batch numbers.
  R.groupBy(x => x.batchNumber),
  // Convert the object we got from grouping into a list of pairs.
  R.toPairs,
  // Convert the pairs into objects representing batches.
  R.map(batchNumberPlusItems => ({
    batchNumber: batchNumberPlusItems[0],
    items: batchNumberPlusItems[1]
  })),
  // Sort the batches by batch numbers.
  R.sort((a, b) => a.batchNumber - b.batchNumber),
  // Figure out the date for the batch.
  R.map(addBatchDate)
)(items);

exports.groupIntoBatches = groupIntoBatches;

exports.test = {
  annotateWithBatchNumbers,
}