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

let getDomainType; //= () =>
// Ext.getCmp('cbbBorderPx1Url').getValue().indexOf('22365') > -1
//   ? 'ip'
//   : 'name';

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

  function getQueryParam(paramName) {
    // Lấy URL hiện tại
    var url_string = window.location.href;
  
    // Tạo đối tượng URL từ URL hiện tại
    var url = new URL(url_string);
  
    // Lấy giá trị của tham số "paramName"
    var paramValue = url.searchParams.get(paramName);
  
    // Trả về giá trị tham số hoặc null nếu không tìm thấy
    return paramValue;
  }

  function getISharedHeaderSubMenuImage(CTId){
    switch(CTId){
      case 137:
      case 262:
        return false;
      default: return true;
    }
  }
