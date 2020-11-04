const JSEncrypt = require('node-jsencrypt'),
  crypt = new JSEncrypt(),
  tokenPublicKey =
    '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrRxLdvg03/1KX9xJAW0USP3pSqJTSkwEY3aQ2tphPkKmGAZxVPUgiNjyGxhplR6Q+YKKybmveL/TbhKEWCXRXcRkZVEQo3vG2SFozWcgJIFaCw7g6aU73hG3kYxb+uJsUPR7AUls/YECKeouCKEYgg+aqmJm0zgT+p3vBd/lNzwIDAQAB-----END PUBLIC KEY-----';

function login(req, res) {
  try {
    if (req.body.password === 'phillip') {
      crypt.setPublicKey(tokenPublicKey);
      res.send({
        success: true,
        token: crypt.encrypt(
          JSON.stringify({
            expiredDate: new Date().getTime() + 24 * 3600 * 1000,
          })
        ),
      });
    } else res.send({ success: false, message: 'Password is wrong' });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
}

module.exports = {
  login,
};
