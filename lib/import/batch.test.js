const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const moment = require('moment');
const batch = require('./batch');
const privateFunctions = batch.test;


const getFakeSeconds = item => item.seconds;

describe('batch', function() {
  describe('annotateWithBatches', function () {
    it('should batch a simple test list', function () {
      const startUnixSeconds = 1318781876;
      const testData = [
        { timestamp: moment.unix(startUnixSeconds) },
        { timestamp: moment.unix(startUnixSeconds + 1) },
        { timestamp: moment.unix(startUnixSeconds + 1802) },
        { timestamp: moment.unix(startUnixSeconds + 1900) },
      ];
      const batches = batch.groupIntoBatches(testData);
      expect(testData[0].batchNumber).to.equal(1);
      expect(testData[1].batchNumber).to.equal(1);
      expect(testData[2].batchNumber).to.equal(2);
      expect(testData[3].batchNumber).to.equal(2);
      expect(batches[0].batchNumber).to.equal('1');
      expect(batches[0].items.length).to.equal(2);
      expect(batches[0].date).to.equal('2011.10.16');
    });
  });
});