const JSEncrypt = require('node-jsencrypt'),
  crypt = new JSEncrypt(),
  CryptoJS = require('crypto-js'),
  fetch = require('node-fetch'),
  FormData = require('form-data'),
  sendResponseCookie = require('./utils').sendResponseCookie,
  tokenTimeOut = 168, // calc = hours = 168/24 = 7 days
  tokenSecretKey = 'aA123Bb321@8*iPg',
  tokenPrivateKey =
    '-----BEGIN RSA PRIVATE KEY-----MIICXAIBAAKBgQCrRxLdvg03/1KX9xJAW0USP3pSqJTSkwEY3aQ2tphPkKmGAZxVPUgiNjyGxhplR6Q+YKKybmveL/TbhKEWCXRXcRkZVEQo3vG2SFozWcgJIFaCw7g6aU73hG3kYxb+uJsUPR7AUls/YECKeouCKEYgg+aqmJm0zgT+p3vBd/lNzwIDAQABAoGBAIQ04VguKg/uUjeg7AKnMMKsIuSI4g9Ej5U9CFN/UEQiOuiId77IBdT6nm+9nIRO73WCrDMkzrh7tfp3/st+0sCklR6IINTFH1+p9552qSDru6WpbIPsEK70yD6Cb8gfEC8PGQh1LRgzpLFMCGVcixuTRfbL3gXc2ZUmh+xmYMXBAkEA27ubu0MmMko3K/n02EU+Cij/fmlcnqkYblkDQxKJVQ3pmgVCmD4wfm2byT2TwbTPs+Rqp3nVnlR/RNJsDJESYQJBAMeMFTd6wOhB1d93HFxWgAYL/AA3B3znc5TxxxW7mn5v0c/uTR52UefoRfBDxxhqItCeTs+NsB5PIw3r6T95ri8CQHlr/4+IeLf7iOdVNba49KJ6q0y4fkTynhyENag/uwH0MS06UOV+ICANA7Q9wcOd3dTDmSg4zBG1Ear/OFPtaqECQC1gboayNGHcbr0lQd7BkNVPLlwCJ4LAwyjQnjwT8DrmRKjrAMB3mYKJ8DWFxCWKJSaZiURrbOxHhKoqxly31+MCQGDwutUtAE6q8E1hZ/+/tqr4fyG5vFW4EYXbeXcYPM6h+PoSBFSPaG/EAGfNmxPiFRll7ODBoHMHei/XXPlAHKg=-----END RSA PRIVATE KEY-----';

let accounts = [
  { username:'feadmin', password:'4196e4326eea0f8875b058f42fa9b0bd'},
  { username:'dbadmin', password:'9e689cb0bbae63db72fc99bdd7392266'},
  { username:'spadmin', password:'9e689cb0bbae63db72fc99bdd7392266'},
]
function validateCredentials(inputUsername, inputPassword, accounts) {
  const crypto = require('crypto');

  for (const account of accounts) {
      if (account.username === inputUsername) {
          const hashedInputPassword = CryptoJS.MD5(inputPassword).toString();
          if (hashedInputPassword === account.password) {
              return true;
          }
      }
  }
  
  return false; 
}
async function login(req, res) {
  try {
    crypt.setKey(tokenPrivateKey);
    let {username, password} = JSON.parse(crypt.decrypt(req.body.loginData));
    if (validateCredentials(username, password, accounts)) {
      var key = CryptoJS.enc.Utf8.parse(tokenSecretKey);
      var iv = CryptoJS.enc.Utf8.parse(tokenSecretKey);
      let token = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(
          JSON.stringify({
            expiredDate: new Date().getTime() + tokenTimeOut * 3600 * 1000,
          })
        ),
        key,
        {
          keySize: 128 / 8,
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      ).toString();
      sendResponseCookie(req, res, token, 'border-px1-api');
      let responseValues = {
        success: true,
        token: token,
        // responseApiImageCDN: await loginApiCDNImage({
        //   cdnImageHost: loginData.cdnImageHost,
        //   secretKey: loginData.password,
        // }),
      };
      //console.log(responseValues);
      res.send(responseValues);
    } else res.send({ success: false, message: 'Password is wrong' });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}
function getLoginStatus(req, res) {
  try {
    //console.log(req.headers);
    //let token = req.cookies['border-px1-api'],
    let token = req.headers.authorization.split(' ')[1],
      status = false;
    //console.log(token);
    if (!token) {
      res.send({ success: false, message: 'cookie does not exist' });
      return;
    }
    var key = CryptoJS.enc.Utf8.parse(tokenSecretKey);
    var iv = CryptoJS.enc.Utf8.parse(tokenSecretKey);
    let decyptedData = CryptoJS.AES.decrypt(decodeURIComponent(token), key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    //console.log(decyptedData);
    if (decyptedData) {
      let d1 = new Date().getTime(),
        d2 = new Date(JSON.parse(decyptedData).expiredDate).getTime();
      //log(d1 - d2);
      status = d1 - d2 <= 0;
    }
    res.send({
      success: status,
      message: token,
      date: new Date(JSON.parse(decyptedData).expiredDate).toLocaleString(),
      // d1: d1,
      // d2: d2,
      // d1d2: d1 - d2,
      // d2d1: d2 - d1,
    });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}
function setCookieToBrowser(req, res) {
  try {
    let cookie = req.query.cookie;
    if (cookie) {
      //res.removeHeader('X-Frame-Options');
      sendResponseCookie(req, res, cookie, 'border-px1-api');
      res.send('cookie was sent');
    } else res.send("Cookie data doesn't exist");
  } catch (error) {
    res.send(error.message);
  }
}
async function loginApiCDNImage({ cdnImageHost, secretKey }) {
  try {
    let form = new FormData();
    form.append('secretKey', secretKey);
    form.append('days', 7);
    const response = await fetch(cdnImageHost + '/token/create', {
      method: 'POST',
      body: form,
    });
    let responseText = await response.text();
    let result = JSON.parse(responseText);
    return result;
  } catch (error) {
    return {
      url: cdnImageHost,
      form: JSON.stringify(form),
      error: JSON.stringify(error),
      responseText: JSON.stringify(responseText),
    };
  }
}
module.exports = {
  login,
  getLoginStatus,
  setCookieToBrowser,
};
