/**
 *
 * Login form and Grid Whitelabel use
 */
function saveBorderPx1ApiCookie(cookie, callback) {
  var ifrm = document.createElement('iframe');
  ifrm.setAttribute('style', 'width:0;height:0;border:0; border:none');
  ifrm.setAttribute(
    'src',
    borderPx1ApiHost + '/user/login?cookie=' + encodeURIComponent(cookie)
  );
  document.body.appendChild(ifrm);
  if (callback) callback();
}

function saveBorderPx1ApiCookieIOS(cookie) {
  location.replace(
    borderPx1ApiHost +
      '/user/login?urlRedirect=' + location.protocol + '://' + location.host + '&cookie=' +
      encodeURIComponent(cookie)
  );
}

let getDomainType = () =>
  Ext.getCmp('cbbBorderPx1Url').getValue().indexOf('22365') > -1
    ? 'ip'
    : 'name';

let getSiteTypeValue = () => {
  let siteTypeValue = Ext.getCmp('cbbSiteType').getRawValue();
  switch (siteTypeValue) {
    case 'Mobile':
      siteTypeValue = 'mobile.';

      break;
    case 'Member':
      siteTypeValue = '';
      break;
    case 'Agent':
      siteTypeValue = 'ag.';
      break;
  }
  return siteTypeValue;
};

let getSiteTypeName = () =>
  Ext.getCmp('cbbSiteType').getRawValue().toLowerCase();
