const chai = require('chai');
const expect = chai.expect;
const existingBatchDirectories = require('./existingBatchDirectories');

describe('existingBatchDirectories', function() {
  describe('findLastLetterForEachDate', function () {
    it('should find the last letter', function () {
      existingBatchDirectories.test.setFakeFsForTesting('root', {
        'a': {
          '2012 - asdfasd' : {
            '2012.01.01-a - asd' : {
              'more stuff' : true
            },
            '2012.01.02-d - asd' : {
              'more stuff' : true
            }
          }
        },
        'b': {
          '2012.01.02-b - asd' : true,
          '2012.02.02-z - asd' : true,
        }
      });
      const last = existingBatchDirectories.findLastLetterForEachDate(['root']);
      expect(last['2012.01.01']).to.equal('a');
      expect(last['2012.01.02']).to.equal('d');
      expect(last['2012.02.02']).to.equal('z');
    });
  });
});