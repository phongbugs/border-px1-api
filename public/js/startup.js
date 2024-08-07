let borderPx1ApiHost =
    localStorage.getItem('borderPx1ApiHost') ||
    ((location.host.indexOf('localhost') > -1 || location.host.indexOf('192.168.1') > -1 )
      ? 'http://localhost:8888'
      : 
      //'https://border-px1-api.herokuapp.com'
      'https://bpx-api.icu'
      ),
  log = console.log,
  loadScript = (pathScript) => {
    const script = document.createElement('script');
    //script.src = borderPx1ApiHost + '/' + pathScript;
    script.src = pathScript;
    document.getElementsByTagName('head')[0].appendChild(script);
  },
  authenticate = (callback) => {
    Ext.Ajax.request({
      headers: {
        Authorization: 'Basic ' + localStorage.getItem('border-px1-api-cookie'),
      },
      method: 'GET',
      url: borderPx1ApiHost + '/user/login/status',
      success: function (response) {
        let success = JSON.parse(response.responseText).success;
        if (success) callback(true);
        else callback(false);
      },
      failure: function (response) {
        Ext.Msg.alert('Error', '/login/status');
        callback(false);
      },
    });
  };
let currentVersion = () => 20230704;
window.onload = () => {
  loadScript('js/utils.js?v=' + currentVersion());
  authenticate((isAuthenticated) => {
    if (isAuthenticated)
      loadScript(startScriptSource + '?v=' + currentVersion());
    else 
      //loadScript('js/loginForm.js?v=' + currentVersion());
    window.open('/login.html', '_top');
    Ext.tip.QuickTipManager.init();
  });
};
