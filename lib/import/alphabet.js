const alphabet = '_abcdefghijklmnopqrstuvwxyz';

// Gets the numeric position for an alphabet letter.
const getPositionOfLetter = letter =>
  (letter && alphabet.indexOf(letter)) || 0;

var keyOffset = 0;
var lastDate;

function getLetterForPosition(adjustedPosition) {
    // var adjustedPosition = lastIndexUsed + parseInt(position) - keyOffset;
    // console.log('# adjusting position:', position, '->', adjustedPosition);
  if (adjustedPosition > 26) {
    throw new Error('We\'ve run out of letters!');
  }
  return alphabet[adjustedPosition];
}

exports.getLetterForPosition = getLetterForPosition;
exports.getPositionOfLetter = getPositionOfLetter;