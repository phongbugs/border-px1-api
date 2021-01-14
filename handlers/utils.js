/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} cookieContent (encoded cookie)
 * @param {*} cookieName [border-px1, border-px1-api]
 */
function isLocalHost(origin) {
  console.log(origin, origin.indexOf('localhost:9999') > -1);
  return origin.indexOf('localhost:9999') > -1;
}
function sendResponseCookie(req, res, cookieContent, cookieName) {
  if (req.headers.origin && isLocalHost(req.headers.origin))
    res.cookie(cookieName, cookieContent);
  else
    res.cookie(cookieName, cookieContent, {
      sameSite: 'None',
      secure: true,
    });
}

module.exports = { sendResponseCookie };
