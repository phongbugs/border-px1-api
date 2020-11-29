const { cookie } = require('request');

const JSEncrypt = require('node-jsencrypt'),
  crypt = new JSEncrypt(),
  log = console.log,
  crawler = require('../crawler'),
  authenticationPrivateKey =
    '-----BEGIN RSA PRIVATE KEY-----MIICXAIBAAKBgQDAvTtsvfokKvLN7JNkzId1ZLroOSIEuntrHD22yab9JeuLviOFOeyq0qQ5q8d2OgcB1M+xDlGy8h6/YoqcL/C6iiDZdi4ft+CUQF2ErqPoI3G/Nc4/fNMd4Yz5wZk0DMDLJLdKVHROGuY+HIGAjpklZRzcGQltMS05XYzirhiuTwIDAQABAoGBAI9qv9M0sfNDuhSc2ziAMLOb1rCCAtw93yReiVWAS6/HDbSYMVorNf4Oa4E2X1+L4jbsofb/zq83FsYWj0mVKqx2pDMu8IROnI1/H+9gPaT5H+pOYwqc/2MvONouwPuHyeIpVJF9lEx5vRewsgn4S8Luh1saGfyp91+FNtVEP2pBAkEA+sr9G5GLBl3Y1Uoj+mxreelN6A8TBs86tBq1M8d/cT3Ai0eCDhKMMMrBM6mZNCsrjO8HZNwnsYkryvNXdVeF3wJBAMS9rU0p8eYN4wh7QN6mGWuoMeXfNjQ3muitTAVbIzDNSpsqSMs6ctBdpVe/OjCEvfoZpJw2TqTBSQatGeYnhZECQEIXcoJsZZ3k53q2EisxnVVAZZaNOm9l90t1amFd5rj6FB7gVmbM/oLxO98Yh9ZWtiBq8aDj39YKly7h2B+FVDMCQGQCDzAkXESXVosfLDCBunZRP1wchQ8yHNqeDQDD/TV3ha8uZWZ5RZfJopziJhA3yeJyWozVxlBVuGteXsXx3SECQES0fos0ECJQHiH2JjyzKpyRTMwoLBQudWf8coVd6BnakKUBskEk6/v4LKpyIZH9pvjfrW2XWmd0SsAcxj5Z5Ys=-----END RSA PRIVATE KEY-----';
async function authenticate(req, res) {
  try {
    let authenticationData = req.body.authenticationData;
    //log('authenticationData: %s', authenticationData);
    if (authenticationData) {
      crypt.setPrivateKey(authenticationPrivateKey);
      let decryptedData = JSON.parse(crypt.decrypt(authenticationData));
      //log('decryptedData: %s', decryptedData);
      let result = await crawler.login(
        decryptedData.username,
        decryptedData.password,
        decryptedData.hostBorderPx1
      );
      if (result.success) {
        let cookie = result.cookie.join(';');
        global.cookie = cookie;
        let encodedCookie = encodeURIComponent(cookie);
        res.cookie('border-px1', encodedCookie, {
          sameSite: 'None',
          secure: true,
          domain:'border-px1-api.xyz'
        });
        res.send({
          success: true,
          cookie: encodedCookie,
        });
      } else res.send({ success: false, message: result.message });
    } else
      res.send({ success: false, message: 'Authentication data do not exits' });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}
async function isAuthenticated(req, res) {
  try {
    let cookie = req.cookies['border-px1'];
    if (cookie) {
      res.send({ success: global.cookie === cookie });
    } else res.send({ success: false, message: "Cookie data doesn't exist" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

module.exports = { authenticate, isAuthenticated };
