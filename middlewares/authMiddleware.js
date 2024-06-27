const CryptoJS = require('crypto-js')
module.exports = function (req, res, next) {
  //let token = req.headers.authorization.split(' ')[1],
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.send('Authorization header is missing');
  }
  const token = authHeader.split(' ')[1],
    tokenSecretKey = 'aA123Bb321@8*iPg';
  if (!token) {
    return res.send('Bearer token is missing');
  }
  //console.log(token);
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
    if (d1 - d2 <= 0) 
      next()
    else 
    return res.send({ success: false, message: 'Token expired' });
  }
};
