  /**
   * 
   * Login form and Grid Whitelabel use
   */
  function saveBorderPx1ApiCookie(cookie) {
    var ifrm = document.createElement('iframe');
    ifrm.setAttribute('style', 'width:0;height:0;border:0; border:none');
    ifrm.setAttribute(
      'src',
      borderPx1ApiHost + '/user/login?cookie=' + encodeURIComponent(cookie)
    );
    document.body.appendChild(ifrm);
  }
