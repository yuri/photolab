var R = require('ramda');

function importFiles() {
  var importer = require('./lib/import/importer.js');
  importer.import({
    sourceDirectory: '/Users/yuri/Pictures/',
    filterFunction: function(name) {
      return /^201[0-9]-[0-9][0-9]-[0-9][0-9]$/.test(name);
    }
  });  
}

function preSquash() {
  var destination = require('./lib/import/destination');

  var out = R.pipe(
    destination.getSquashableFolders,
    R.map(record => record.name),
    R.join('\n')
  )([]);

  console.log(out);
};

function readStdin() {
  var Q = require('q');
  var deferred = Q.defer();
  var chunks = [];
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', function() {
    chunks.push(process.stdin.read());
  });
  process.stdin.on('end', function() {
    deferred.resolve(chunks.join(''));
  });
  return deferred.promise;
}

function renameAndSquash() {
  var destination = require('./lib/import/destination');

  var lastFolder;

  var process = R.pPipe(
    readStdin,
    function(x) {
      return x.split('-----')[0];
    },
    R.split('\n'),
    R.filter(function(x) {
      return x.length;
    }),
    // R.map(R.split(/\s+/)),
    R.map(function(line) {
      var squash = line.startsWith('  ');
      var rawName = line.trim();
      var originalName = rawName.split('  ')[0];
      var newEnding = (rawName.split('  ')[1] || '').replace('\'', '’');
      var baseName = rawName.slice(0, 12);
      var name = baseName + ' ▪ ' + newEnding;
      var sources = ['.JPG', '.MTS'];
      // R.filter(function(extension) {
      //   return extension !== '.---';
      // })([record[2], record[3]]);

      if (squash) {
        console.log('# Merging ', originalName, 'into', lastFolder, sources);
        destination.fixFolders('merge', originalName, lastFolder, sources);
      } else {
        console.log('# Renaming ', originalName, 'to', name, sources);
        destination.fixFolders('rename', originalName, name, sources);
        lastFolder = name;
      }
    })
    // R.map(function(x) {
    //   console.log(x);
    // })
  );
  process().then(null, function(error) {console.error(error);});
}

const command= process.argv[2];

if (command==='i') {
  importFiles();
} else if (command==='l') {
  preSquash();
} else if(command==='p') {
  renameAndSquash();
} else {
  console.log('Please specify a valid option');
}




