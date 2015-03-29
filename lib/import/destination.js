var path = require('path');
var fs = require('fs');
var R = require('ramda');
var mkdirp = require('mkdirp');

var destinationFoldersByExtension = {
  '.MTS': '/Users/yuri/video/main/',
  '.JPG': '/Users/yuri/photos/main/2014.03-Spring-2014/'
};

function getDestinationFolderByExtension(extension) {
  return destinationFoldersByExtension[extension];  
}

var batchFoldersByExtension = {};

['.MTS', '.JPG'].forEach(function(extension) {
  var folder  = getDestinationFolderByExtension(extension);
  batchFoldersByExtension[extension] = fs.readdirSync(folder);
});

var alphabet = '_abcdefghijklmnopqrstuvwxy';

function getAlphabetPosition(letter) {
  return (letter && alphabet.indexOf(letter)) || 0;
}

  // var alphabet = '_abcdefghijklmnopqrstuvwxy';
  //   if (groupCounter < alphabet.length) {
  //     return alphabet[groupCounter];      
  //   } else {
  //     return 'z' + Math.round(groupCounter / 25) + alphabet(groupCounter % 25);
  //   }


var getLastLetter = R.curry(function (targetDate, extension) {
  var lastChildDirectory = batchFoldersByExtension[extension]
    .filter(function(name) {
      var date = name.split('-')[0];
      return date === targetDate;
    })
    .sort().pop();
  return lastChildDirectory && lastChildDirectory.split('-')[1];
});

var keyOffset = 0;
var lastDate;

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

  function getLetter(position) {
    var adjustedPosition = lastIndexUsed + parseInt(position) - keyOffset;
    // console.log('# adjusting position:', position, '->', adjustedPosition);
    if (adjustedPosition > 25) {
      throw new Error('Ran out of letters!');
    }
    return alphabet[adjustedPosition];
  }

  return function(item) {
    var destFolder = getDestinationFolderByExtension(item.extension);
    var groupFolder = group.date + '-' + getLetter(group.key);
    mkdirp.sync(path.join(destFolder, groupFolder));
    var random = ('0000' + Math.round(Math.random() * 10000)).slice(-4);
    var fileNameParts = [item.date.slice(0,8), item.date.slice(8), random];
    var fileName = fileNameParts.join('_');
    return path.join(destFolder, groupFolder, fileName + item.extension); 
  };
}

exports.getSquashableFolders = function() {

  var keys = R.sortBy(R.identity, R.keys(batchFoldersByExtension));

  var getFolders = R.pipe(
    R.map(function(extension) {
      return batchFoldersByExtension[extension];
    }),
    R.foldl(function(acc, value) {
      return acc.concat(value);
    }, []),
    R.uniq,
    R.filter(function(x) {
      return x.slice(0,2) === '20' && x.length === 12;
    }),
    R.sortBy(function(x) {
      return x.slice(0,12);
    }),
    R.map(function(folder) {
      return {
        name: folder,
        sources: R.map(function(key) {
          return R.contains(folder, batchFoldersByExtension[key])? key: '.---';
        }, keys)
      }
    })
  );

  return getFolders(keys);
};

var futurePaths = {};

exports.fixFolders = function(operation, srcFolder, destFolder, sources) {

  var getCommands = R.pPipe(
    R.map(getDestinationFolderByExtension),
    R.map(function(parentPath) {
      var commands = [];
      var destPath = path.join(parentPath, destFolder);
      var sourcePath = path.join(parentPath, srcFolder);
      if (operation === 'merge') {
        sourcePath = path.join(sourcePath, '*');
        if (! (fs.existsSync(destPath) || futurePaths[destPath])) {
          commands.push('mkdir ' + destPath);
        }
      }
      commands.push(['mv', sourcePath, destPath].join(' ') + '/');
      futurePaths[destPath] = true;
      if (operation === 'merge') {
        commands.push('rmdir ' + path.join(parentPath, srcFolder));
      }
      return commands.join('\n');
    }),
    R.join('\n')
  );

  console.log(getCommands(sources));
};
