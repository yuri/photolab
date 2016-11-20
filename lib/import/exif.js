// Old Exif processing code - not used at the moment.

import exif from 'exif';
import R from 'ramda';
import Q from 'q';

var getExifData = Q.denodeify(function(path, callback) {
  new exif.ExifImage({image: path}, callback);
});

var getExifDate = R.pPipe(
  getExifData,
  R.prop('exif'),
  R.prop('DateTimeOriginal'),  
  R.replace(/[\s\:]/g, '')
);

export const getExifDate