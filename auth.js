const CryptoJS = require('crypto-js'),
  log = console.log,
  key = 'A20(*)I(*)21B';
hasNotExpired = (token) => {
  let decryptedToken = JSON.parse(
    CryptoJS.AES.decrypt(token, key).toString(CryptoJS.enc.Utf8)
  );
  return (
    new Date().getTime() - new Date(decryptedToken.expiredDate).getTime() <= 0
  );
};
module.exports = async (req, res, next) => {
  try {
    log(req.path);
    if (
      req.path.indexOf('/api-docs') > -1 ||
      req.path.indexOf('/user/login') > -1
    )
      next();
    else {
      const token = req.cookies['border-px1-api'];
      if (token && hasNotExpired(token)) next();
      else {
        res.set('WWW-Authenticate', 'c');
        res
          .status(440)
          .send({
            success: false,
            message: "The client's session has expired and must log in again.",
          });
      }
    }
  } catch (error) {
    next(error.message);
  }
};
