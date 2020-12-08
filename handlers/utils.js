/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} cookieContent (encoded cookie)
 * @param {*} cookieName [border-px1, border-px1-api]
 */
function sendResponseCookie(req, res, cookieContent, cookieName) {
  if (req.headers.origin && req.headers.origin.indexOf('localhost') > -1)
    res.cookie(cookieName, cookieContent);
  else
    res.cookie(cookieName, cookieContent, {
      sameSite: 'None',
      secure: true,
    });
}

module.exports = { sendResponseCookie };
