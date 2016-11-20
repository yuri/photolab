const R = require('ramda');

var getLastLetter = R.curry(function (targetDate, extension) {
  var lastChildDirectory = batchFoldersByExtension[extension]
    .filter(function(name) {
      var date = name.split('-')[0];
      return date === targetDate;
    })
    .sort().pop();
  return lastChildDirectory && lastChildDirectory.split('-')[1];
});

exports.makeDestinationGetter = function(group) {

  lastDate = lastDate || group.date;
  if (lastDate !== group.date) {
    // Date changed - we need to update the offset.
    keyOffset = parseInt(group.key) - 1;
    console.log('# setting keyoffset:', keyOffset);
    lastDate = group.date;
  }

  var lastIndexUsed = R.pipe(
    R.map(getLastLetter(group.date)),
    R.map(getAlphabetPosition),
    R.max
  )(['.MTS', '.JPG']);

  if (lastIndexUsed < 0) {
    lastIndexUsed = 0;
  }

  console.log('# lastIndexUsed', lastIndexUsed);

  function getFolder(extension) {
    var destFolder = getDestinationFolderByExtension(extension);
    var groupFolder = group.date + '-' + getLetter(group.key);
    return path.join(destFolder, groupFolder);
  }

  return {
    getFolder: getFolder,
    getItemPath: function(item) {
      var groupFolder = getFolder(item.extension);

      // mkdirp.sync(path.join(destFolder, groupFolder));
      var random = ('0000' + Math.round(Math.random() * 10000)).slice(-4);
      var fileNameParts = [item.date.slice(0,8), item.date.slice(8), random];
      var fileName = fileNameParts.join('_');
      return path.join(groupFolder, fileName + item.extension);
    }
  };
}


