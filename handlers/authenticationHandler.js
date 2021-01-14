const { isAuthenticatedCookies } = require('../crawler'),
  JSEncrypt = require('node-jsencrypt'),
  crypt = new JSEncrypt(),
  log = console.log,
  crawler = require('../crawler'),
  sendResponseCookie = require('./utils').sendResponseCookie,
  authenticationPrivateKey =
    '-----BEGIN RSA PRIVATE KEY-----MIICXAIBAAKBgQDAvTtsvfokKvLN7JNkzId1ZLroOSIEuntrHD22yab9JeuLviOFOeyq0qQ5q8d2OgcB1M+xDlGy8h6/YoqcL/C6iiDZdi4ft+CUQF2ErqPoI3G/Nc4/fNMd4Yz5wZk0DMDLJLdKVHROGuY+HIGAjpklZRzcGQltMS05XYzirhiuTwIDAQABAoGBAI9qv9M0sfNDuhSc2ziAMLOb1rCCAtw93yReiVWAS6/HDbSYMVorNf4Oa4E2X1+L4jbsofb/zq83FsYWj0mVKqx2pDMu8IROnI1/H+9gPaT5H+pOYwqc/2MvONouwPuHyeIpVJF9lEx5vRewsgn4S8Luh1saGfyp91+FNtVEP2pBAkEA+sr9G5GLBl3Y1Uoj+mxreelN6A8TBs86tBq1M8d/cT3Ai0eCDhKMMMrBM6mZNCsrjO8HZNwnsYkryvNXdVeF3wJBAMS9rU0p8eYN4wh7QN6mGWuoMeXfNjQ3muitTAVbIzDNSpsqSMs6ctBdpVe/OjCEvfoZpJw2TqTBSQatGeYnhZECQEIXcoJsZZ3k53q2EisxnVVAZZaNOm9l90t1amFd5rj6FB7gVmbM/oLxO98Yh9ZWtiBq8aDj39YKly7h2B+FVDMCQGQCDzAkXESXVosfLDCBunZRP1wchQ8yHNqeDQDD/TV3ha8uZWZ5RZfJopziJhA3yeJyWozVxlBVuGteXsXx3SECQES0fos0ECJQHiH2JjyzKpyRTMwoLBQudWf8coVd6BnakKUBskEk6/v4LKpyIZH9pvjfrW2XWmd0SsAcxj5Z5Ys=-----END RSA PRIVATE KEY-----';

async function authenticate(req, res) {
  try {
    let authenticationData = req.body.authenticationData;
    let domainType = req.body.domainType;
    //log('authenticationData: %s', authenticationData);
    if (authenticationData) {
      let cookie = domainType === 'ip' ? global.cookieIp : global.cookie;
      if (cookie && (await isAuthenticatedCookies([cookie], domainType))) {
        let encodedCookie = encodeURIComponent(cookie);
        // share cookie to other browser client
        let cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1';
        sendResponseCookie(req, res, encodedCookie, cookieName);
        res.send({
          success: true,
          cookie: encodedCookie,
          message: 'Cookie is available',
        });
      } else {
        // login 1st time or cookie was expired
        crypt.setPrivateKey(authenticationPrivateKey);
        let decryptedData = JSON.parse(crypt.decrypt(authenticationData));
        //log('decryptedData: %s', decryptedData);

        // set key for domainType
        // it can recognize by hostBorderPx1
        let hostBorderPx1 = decryptedData.hostBorderPx1;
        if (hostBorderPx1.indexOf('22365') > -1) {
          crawler.setPKey(crawler.cfg.pKeyIP);
          global.hostBorderPx1Ip = hostBorderPx1;
        } else {
          crawler.setPKey(crawler.cfg.pKeyName);
          global.hostBorderPx1Name = hostBorderPx1;
        }

        let result = await crawler.login(
          decryptedData.username,
          decryptedData.password,
          hostBorderPx1,
          domainType
        );

        //log(result);
        if (result.success) {
          let cookie = result.cookie.join(';');
          //=> save cookie as global
          if (domainType === 'ip') global.cookieIp = cookie;
          else global.cookie = cookie;
          let encodedCookie = encodeURIComponent(cookie);
          let cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1';
          sendResponseCookie(req, res, encodedCookie, cookieName);

          //=> fetch latest sites from border-px1-site
          let response = await crawler.fetchSites('', [cookie], domainType);
          let sites = [];
          if (response.success) {
            sites = response.sites.map((site) => ({
              id: site.ID,
              name: site.Host,
            }));
            if (domainType === 'ip') global.sitesIp = sites;
            else global.sites = sites;
          }
          // log('global.sites: ');
          // log(global.sites);
          // await require('../Utils').File.saveTextFile(
          //   './sites.map.' + domainType + '.json',
          //   JSON.stringify(global.sites)
          // );
          res.send({
            success: true,
            cookie: encodedCookie,
            message: response.success
              ? 'Sites Fetched(' + sites.length + ' sites)'
              : 'Sites are not latest',
          });
        } else res.send({ success: false, message: result.message });
      }
    } else
      res.send({
        success: false,
        message: 'Authentication data do not exits',
      });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

async function isAuthenticated(req, res) {
  try {
    let domainType = req.params['domainType'];
    let cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1';
    let cookie = req.cookies[cookieName];
    if (cookie) {
      //log('cookie: %s', cookie);
      //log('global.cookie = %s', global.cookie);
      let decodedCookie = decodeURIComponent(cookie);
      res.send({
        success:
          domainType === 'ip'
            ? global.cookieIp === decodedCookie
            : global.cookie === decodedCookie,
        domainType: domainType,
      });
    } else res.send({ success: false, message: "Cookie data doesn't exist" });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

function setCookieToBrowser(req, res) {
  try {
    let cookie = req.query.cookie;
    if (cookie) {
      //res.removeHeader('X-Frame-Options');
      let domainType = req.params['domainType'];
      let cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1';
      sendResponseCookie(req, res, cookie, cookieName);
      res.send('cookie was sent');
    } else res.send("Cookie data doesn't exist");
  } catch (error) {
    res.send(error.message);
  }
}

module.exports = { authenticate, isAuthenticated, setCookieToBrowser };
