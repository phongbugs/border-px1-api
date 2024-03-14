const fs = require('fs'),
  yauzl = require('yauzl'),
  fetch = require('node-fetch'),
  FormData = require('form-data'),
  formidable = require('formidable')
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

async function fetchDateModifiedFiles(req, res) {
  //console.log(req.body.whitelabelUrl);
  //console.log(req.body.listFile);
  try {
    let url =
      decodeURIComponent(req.body.whitelabelUrl) +
      '/Public/GetDateModifiedOfFiles.aspx';
    console.log(url);
    let form = new FormData();
    form.append('cmd', 'GetModifiedDate');
    form.append('files', req.body.listFile);
    const response = await fetch(
      url,
      {
        //headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: form,
      }
    );
    let text = (await response.text()).replace(/\\/g, '\\\\').replace(/'/g, '');
    console.log(text);
    res.send(JSON.parse(text));
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

function uploadFileToExpress(req, res) {
  try {
    let fstream;
    //req.pipe(req.busboy);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
      let fileName = files.filetoupload.originalFilename
      if (fileName.substr(fileName.length - 3, 3) == 'zip') {
        console.log('Uploading: ' +  fileName);
        let filesDir = './public/files/';
        if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir);
        fstream = fs.createWriteStream(filesDir + fileName);
        file.pipe(fstream);
        fstream.on('close', () =>
          getModifiedDateOfFileInZip(filesDir + fileName, (listFile) =>
            res.send({
              success: true,
              message: fileName + ' was uploaded',
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

async function uploadFileToIIS(req, res) {
  try {
    let url =
      req.body.whitelabelUrl +
      '/Public/GetDateModifiedOfFiles.aspx/?' +
      new URLSearchParams({
        cmd: 'GetModifiedDate2',
        'bpx-backend-id': req.body.backendId,
      });
    console.log(url);
    const form = new FormData();
    if (req.body.action === 'u') {
      const filePath = './public/files/' + req.body.uploadedFileName;
      const stats = fs.statSync(filePath);
      const fileSizeInBytes = stats.size;
      const fileStream = fs.createReadStream(filePath);
      form.append('dzFile', fileStream, { knownLength: fileSizeInBytes });
    }
    form.append('action', req.body.action);
    const options = {
      method: 'POST',
      body: form,
    };
    fetch(url, { ...options }).then(async (response) => {
      if (response.ok) res.send(await response.text());
      else
        res.send({
          success: false,
          message: 'action.' + req.body.action + ' -> ' + response.statusText,
        });
    });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

async function deploy(req, res) {
  try {
    let url =
        req.body.whitelabelUrl +
        '/Public/GetDateModifiedOfFiles.aspx?' +
        new URLSearchParams({
          cmd: 'GetModifiedDate3',
          'bpx-backend-id': req.body.backendId,
        }),
      form = new FormData();
    form.append('dzFileName', req.body.dzFileName);
    form.append('dzFileNameList', req.body.dzFileNameList);
    form.append('nameBatFile', req.body.nameBatFile);
    form.append('batMode', req.body.batMode);
    form.append('isBKFull', req.body.isBKFull);
    form.append('isStart', req.body.isStart ? 1 : 0);
    let response = await fetch(url, {
      // removed header
      method: 'POST',
      body: form,
    });
    res.send(await response.text());
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}
module.exports = {
  uploadFileToExpress,
  uploadFileToIIS,
  fetchDateModifiedFiles,
  deploy,
};
