/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} cookieContent (encoded cookie)
 * @param {*} cookieName [border-px1, border-px1-api]
 */
function isLocalHost(origin) {
  if (
    origin.indexOf('localhost:9999') > -1 ||
    origin.indexOf('phillip:9999') > -1 ||
    origin.indexOf('192.168.2.185:9999') > -1
  )
    return true;
  return false;
}
function sendResponseCookie(req, res, cookieContent, cookieName) {
  if (req.headers.origin && isLocalHost(req.headers.origin) > -1)
    res.cookie(cookieName, cookieContent);
  else
    res.cookie(cookieName, cookieContent, {
      sameSite: 'None',
      secure: true,
    });
}

module.exports = { sendResponseCookie };
