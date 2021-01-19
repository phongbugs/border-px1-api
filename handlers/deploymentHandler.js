const fs = require('fs'),
  yauzl = require('yauzl'),
  getModifiedDateOfFileInZip = (fileName, callback) => {
    var jsonObjs = '';
    var i = 0;
    yauzl.open(fileName, function (err, zipfile) {
      if (err) {
        throw err;
      }
      zipfile.on('entry', function (entry) {
        // directory file names end with '/'
        if (/\/$/.test(entry.fileName)) {
          //i++;
          if (i == 0) jsonObjs = '';
          if (++i == zipfile.entryCount) {
            jsonObjs = '[' + jsonObjs.substr(0, jsonObjs.length - 1) + ']';
            //reset i
            i = 0;
            callback(jsonObjs);
          } else return;
        }
        // reset jsonObjs when do twice time
        if (i == 0) jsonObjs = '';
        // Read the last date modified per archive entry
        // 12/15/2015, 3:23:41 PM --> 12/15/2015 3:23:41 PM : will be convert by client ( browser )
        jsonObjs +=
          '{' +
          '"fileName":"' +
          entry.fileName +
          '","modifiedDate":"' +
          entry.getLastModDate().toLocaleString() +
          '"},';
        if (++i == zipfile.entryCount) {
          jsonObjs = '[' + jsonObjs.substr(0, jsonObjs.length - 1) + ']';
          //reset i
          i = 0;
          callback(jsonObjs);
        }
      });
    });
  };
function uploadFileToExpress(req, res) {
  try {
    let fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldName, file, filename) {
      if (filename.substr(filename.length - 3, 3) == 'zip') {
        console.log('Uploading: ' + filename);
        let filesDir = './public/files/';
        if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir);
        fstream = fs.createWriteStream(filesDir + filename);
        file.pipe(fstream);
        fstream.on('close', () =>
          getModifiedDateOfFileInZip(filesDir + filename, (listFile) =>
            res.send({
              success: true,
              message: filename + ' was uploaded',
              listFile: JSON.parse(listFile),
            })
          )
        );
      } else
        res.send({
          success: false,
          message: 'Only support .zip file ! Failed',
          listFile: [],
        });
    });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

function uploadFileToIIS(req, res) {
  try {
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

module.exports = {
  uploadFileToExpress,
  uploadFileToIIS,
};
