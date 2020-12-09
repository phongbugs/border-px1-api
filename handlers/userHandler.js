const JSEncrypt = require('node-jsencrypt'),
  crypt = new JSEncrypt(),
  sendResponseCookie = require('./utils').sendResponseCookie,
  tokenPublicKey =
    '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrRxLdvg03/1KX9xJAW0USP3pSqJTSkwEY3aQ2tphPkKmGAZxVPUgiNjyGxhplR6Q+YKKybmveL/TbhKEWCXRXcRkZVEQo3vG2SFozWcgJIFaCw7g6aU73hG3kYxb+uJsUPR7AUls/YECKeouCKEYgg+aqmJm0zgT+p3vBd/lNzwIDAQAB-----END PUBLIC KEY-----',
  tokenPrivateKey =
    '-----BEGIN RSA PRIVATE KEY-----MIICXAIBAAKBgQCrRxLdvg03/1KX9xJAW0USP3pSqJTSkwEY3aQ2tphPkKmGAZxVPUgiNjyGxhplR6Q+YKKybmveL/TbhKEWCXRXcRkZVEQo3vG2SFozWcgJIFaCw7g6aU73hG3kYxb+uJsUPR7AUls/YECKeouCKEYgg+aqmJm0zgT+p3vBd/lNzwIDAQABAoGBAIQ04VguKg/uUjeg7AKnMMKsIuSI4g9Ej5U9CFN/UEQiOuiId77IBdT6nm+9nIRO73WCrDMkzrh7tfp3/st+0sCklR6IINTFH1+p9552qSDru6WpbIPsEK70yD6Cb8gfEC8PGQh1LRgzpLFMCGVcixuTRfbL3gXc2ZUmh+xmYMXBAkEA27ubu0MmMko3K/n02EU+Cij/fmlcnqkYblkDQxKJVQ3pmgVCmD4wfm2byT2TwbTPs+Rqp3nVnlR/RNJsDJESYQJBAMeMFTd6wOhB1d93HFxWgAYL/AA3B3znc5TxxxW7mn5v0c/uTR52UefoRfBDxxhqItCeTs+NsB5PIw3r6T95ri8CQHlr/4+IeLf7iOdVNba49KJ6q0y4fkTynhyENag/uwH0MS06UOV+ICANA7Q9wcOd3dTDmSg4zBG1Ear/OFPtaqECQC1gboayNGHcbr0lQd7BkNVPLlwCJ4LAwyjQnjwT8DrmRKjrAMB3mYKJ8DWFxCWKJSaZiURrbOxHhKoqxly31+MCQGDwutUtAE6q8E1hZ/+/tqr4fyG5vFW4EYXbeXcYPM6h+PoSBFSPaG/EAGfNmxPiFRll7ODBoHMHei/XXPlAHKg=-----END RSA PRIVATE KEY-----';

function login(req, res) {
  try {
    if (req.body.password === 'phillip') {
      crypt.setPublicKey(tokenPublicKey);
      let token = crypt.encrypt(
        JSON.stringify({
          expiredDate: new Date().getTime() + 1 * 3600 * 1000,
        })
      );
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
      res.send({ success: false, message: 'cookie undefined' });
      return;
    }
    var crypt = new JSEncrypt();
    crypt.setKey(tokenPrivateKey);
    let decyptedData = crypt.decrypt(decodeURIComponent(token));
    //log('expiredDate:%s', new Date(JSON.parse(decyptedData).expiredDate));
    if (decyptedData) {
      let d1 = new Date().getTime(),
        d2 = new Date(JSON.parse(decyptedData).expiredDate).getTime();
      //log(d1 - d2);
      status = d1 - d2 <= 0;
    }
    res.send({
      success: status,
      message: token,
      date: new Date(JSON.parse(decyptedData).expiredDate),
      d1: d1,
      d2: d2,
      d1d2: d1 - d2,
      d2d1: d2 - d1,
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

module.exports = {
  login,
  getLoginStatus,
  setCookieToBrowser,
};
