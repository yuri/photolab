var batchFoldersByExtension = {};

['.MTS', '.JPG'].forEach(function(extension) {
  var folder  = getDestinationFolderByExtension(extension);
  batchFoldersByExtension[extension] = fs.readdirSync(folder);
});


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

  const primarySource = getDestinationFolderByExtension(sources[0]);

  var getCommands = R.pPipe(
    R.map(getDestinationFolderByExtension),
    R.map(function(parentPath) {
      var commands = [];
      var destPath = path.join(primarySource, destFolder).replace(/(\s)/g, '\\ ');
      var sourcePath = path.join(parentPath, srcFolder).replace(/(\s)/g, '\\ ');
      const merge = operation === 'merge' || parentPath !== primarySource;
      if (merge) {
        sourcePath = path.join(sourcePath, '*');
        if (! (fs.existsSync(destPath) || futurePaths[destPath])) {
          commands.push('mkdir ' + destPath);
        }
      }
      commands.push(['mv', sourcePath, destPath].join(' ') + '/');
      futurePaths[destPath] = true;
      if (merge) {
        commands.push('rmdir ' + path.join(parentPath, srcFolder));
      }
      return commands.join('\n');
    }),
    R.join('\n')
  );

  console.log(getCommands(sources));
};