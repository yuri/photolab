const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const sourceFileList = require('./sourceFileList');
const privateFunctions = sourceFileList.test;

describe('sourceFileList', function() {
  describe('getFiles', function () {
    it('should handle an empty directory list', function () {
      const fileList = privateFunctions.getFiles([]);
      expect(fileList).to.be.an.array;
      expect(fileList.length).to.equal(0);
    });
    it('should handle test data', function () {
      const dirs = [
        './lib/import/test-data/sourceFileList/foo',
        './lib/import/test-data/sourceFileList/bar'
      ];
      const fileList = sourceFileList.getFilesWithTimestampsSorted(dirs);
      expect(fileList).to.be.an.array;
      expect(fileList.length).to.equal(3);
      expect(fileList[0].path).to.not.be.undefined;
      expect(fileList[0].timestamp.format()).to.not.be.undefined;
      // console.log(fileList[0].timestamp.format('YYYY-MM-DDTHH:MM:SS'));
    });
  });
});