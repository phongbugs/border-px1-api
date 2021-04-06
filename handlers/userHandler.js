const JSEncrypt = require('node-jsencrypt'),
  crypt = new JSEncrypt(),
  log = console.log,
  CryptoJS = require('crypto-js'),
  sendResponseCookie = require('./utils').sendResponseCookie,
  tokenTimeOut = 168, // calc = hours
  tokenPrivateKey =
    '-----BEGIN RSA PRIVATE KEY-----MIICXAIBAAKBgQCrRxLdvg03/1KX9xJAW0USP3pSqJTSkwEY3aQ2tphPkKmGAZxVPUgiNjyGxhplR6Q+YKKybmveL/TbhKEWCXRXcRkZVEQo3vG2SFozWcgJIFaCw7g6aU73hG3kYxb+uJsUPR7AUls/YECKeouCKEYgg+aqmJm0zgT+p3vBd/lNzwIDAQABAoGBAIQ04VguKg/uUjeg7AKnMMKsIuSI4g9Ej5U9CFN/UEQiOuiId77IBdT6nm+9nIRO73WCrDMkzrh7tfp3/st+0sCklR6IINTFH1+p9552qSDru6WpbIPsEK70yD6Cb8gfEC8PGQh1LRgzpLFMCGVcixuTRfbL3gXc2ZUmh+xmYMXBAkEA27ubu0MmMko3K/n02EU+Cij/fmlcnqkYblkDQxKJVQ3pmgVCmD4wfm2byT2TwbTPs+Rqp3nVnlR/RNJsDJESYQJBAMeMFTd6wOhB1d93HFxWgAYL/AA3B3znc5TxxxW7mn5v0c/uTR52UefoRfBDxxhqItCeTs+NsB5PIw3r6T95ri8CQHlr/4+IeLf7iOdVNba49KJ6q0y4fkTynhyENag/uwH0MS06UOV+ICANA7Q9wcOd3dTDmSg4zBG1Ear/OFPtaqECQC1gboayNGHcbr0lQd7BkNVPLlwCJ4LAwyjQnjwT8DrmRKjrAMB3mYKJ8DWFxCWKJSaZiURrbOxHhKoqxly31+MCQGDwutUtAE6q8E1hZ/+/tqr4fyG5vFW4EYXbeXcYPM6h+PoSBFSPaG/EAGfNmxPiFRll7ODBoHMHei/XXPlAHKg=-----END RSA PRIVATE KEY-----';

function login(req, res) {
  try {
    crypt.setKey(tokenPrivateKey);
    let loginData = JSON.parse(crypt.decrypt(req.body.loginData));
    if (
      CryptoJS.MD5(loginData.password).toString() ===
      '4196e4326eea0f8875b058f42fa9b0bd'
    ) {
      let token = CryptoJS.AES.encrypt(
        JSON.stringify({
          expiredDate: new Date().getTime() + tokenTimeOut * 3600 * 1000,
        }),
        'A20(*)I(*)21B'
      ).toString();
      sendResponseCookie(req, res, token, 'border-px1-api');
      res.send({
        success: true,
        token: token,
      });
    } else res.send({ success: false, message: 'Password is wrong' });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

function getLoginStatus(req, res) {
  try {
    let token = req.cookies['border-px1-api'],
      status = false;
    if (!token) {
      res.send({ success: false, message: 'cookie does not exist' });
      return;
    }
    let decyptedData = CryptoJS.AES.decrypt(
      decodeURIComponent(token),
      'A20(*)I(*)21B'
    ).toString(CryptoJS.enc.Utf8);
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
    log(req.query);
    let cookie = req.query.cookie;
    if (cookie) {
      //res.removeHeader('X-Frame-Options');
      sendResponseCookie(req, res, cookie, 'border-px1-api');
      res.send("<script>window.location.replace('" + req.query.urlRedirect + "')</script>");
    } else res.send("Cookie data doesn't exist");
  } catch (error) {
    log(error);
    res.send(error.message);
  }
}

module.exports = {
  login,
  getLoginStatus,
  setCookieToBrowser,
};
