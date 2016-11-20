const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;
const alphabet = require('./alphabet');

describe('alphabet', function() {
  describe('getLetterForPosition', function () {
    it('should return a letter given a valid position', function () {
      const a = alphabet.getLetterForPosition(1);
      const c = alphabet.getLetterForPosition(3);
      const z = alphabet.getLetterForPosition(26);
      expect(a).to.equal('a');
      expect(c).to.equal('c');
      expect(z).to.equal('z');
    });
    it('should throw for out-of-bounds input', function () {
      expect(() => alphabet.getLetterForPosition(27)).to.throw();
      expect(() => alphabet.getLetterForPosition(122)).to.throw();
    });
  });
});