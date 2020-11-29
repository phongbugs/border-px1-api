let authForm = Ext.create('Ext.form.Panel', {
  id: 'authForm',
  title: 'Input Accout BORDER PX1 Site',
  bodyPadding: 15,
  width: 320,
  height: 230,
  style: {
    marginBottom: '20px',
    position: 'absolute',
    top: '10%',
    right: '50%',
    zIndex: 999,
  },
  frame: true,
  collapsible: true,
  resizable: true,
  draggable: true,
  layout: 'anchor',
  hidden: true,
  listeners: {
    afterrender: () => {
      Ext.Ajax.request({
        method: 'GET',
        url: borderPx1ApiHost + '/authentication/status',
        //params: { cookie: localStorage.getItem('cookie') },
        success: function (response) {
          let result = JSON.parse(response.responseText);
          if (result.success) {
            var myCounter = new Countdown({
              seconds: localStorage.getItem('authTime'),
              onUpdateStatus: function (time) {
                Ext.getCmp('btnOpenAuthForm').setText(
                  convertTimeToMinutesAndSeconds(time)
                );
                localStorage.setItem('authTime', time);
              },
              onCounterEnd: function () {
                authForm.setHidden(false);
                let cbkIsFresh = Ext.getCmp('ckbIsRefreshCookie');
                cbkIsFresh.setValue(true);
                Ext.getCmp('btnAuthenticate').fireEvent('click');
                setTimeout(() => cbkIsFresh.setValue(true), 3000);
              },
            });
            myCounter.start();
          }
        },
        failure: function (response) {
          Ext.Msg.alert('Failure', 'authentication/status error');
          record.set('remoteDesktopSpinner', false);
        },
      });
    },
    show: () => {
      Ext.getCmp('txtUsername').setValue(
        localStorage.getItem('authUsername') || ''
      );
      Ext.getCmp('txtPassword').setValue(
        localStorage.getItem('authPassword') || ''
      );
    },
  },
  defaults: {
    anchor: '100%',
  },
  tools: [
    {
      type: 'close',
      handler: () => authForm.setHidden(true),
    },
  ],
  defaultType: 'textfield',
  items: [
    {
      xtype: 'combo',
      width: 65,
      store: new Ext.data.ArrayStore({
        fields: ['id', 'name'],
        data: [
          [
            'https://net-ga.admin.12365.bpx-cdn.cloud',
            'https://net-ga.admin.12365.bpx-cdn.cloud',
          ],
          [
            'https://net-gb.admin.22365.bpx-cdn.cloud',
            'https://net-gb.admin.22365.bpx-cdn.cloud',
          ],
        ],
      }),
      displayField: 'name',
      valueField: 'id',
      name: 'cbbBorderPx1Url',
      id: 'cbbBorderPx1Url',
      value: 'https://net-ga.admin.12365.bpx-cdn.cloud',
      editable: false,
      listeners: {
        //change: (_, val) => Ext.getCmp('btnRefresh').fireEvent('click'),
      },
      submitValue: false,
    },
    {
      fieldLabel: 'Username',
      id: 'txtUsername',
      name: 'txtUsername',
      allowBlank: false,
      submitValue: false,
    },
    {
      fieldLabel: 'Password',
      id: 'txtPassword',
      inputType: 'password',
      allowBlank: false,
      submitValue: false,
    },
    {
      boxLabel: 'Remember me',
      xtype: 'checkbox',
      id: 'ckbRememberMe',
      submitValue: false,
      value: false,
    },
    {
      boxLabel: 'Is Refresh Cookie',
      xtype: 'checkbox',
      id: 'ckbIsRefreshCookie',
      name: 'isRefreshCookie',
      value: false,
      hidden: true,
    },
  ],

  // Reset and Submit buttons
  buttons: [
    {
      text: 'Reset',
      handler: function () {
        this.up('form').getForm().reset();
      },
    },
    {
      text: 'Authenticate',
      id: 'btnAuthenticate',
      formBind: true,
      disabled: true,
      listeners: {
        click: () => {
          let form = authForm.getForm();
          if (form.isValid()) {
            let username = Ext.getCmp('txtUsername').getValue(),
              password = Ext.getCmp('txtPassword').getValue(),
              hostBorderPx1 = Ext.getCmp('cbbBorderPx1Url').getValue();
            authenticationData = { username, password, hostBorderPx1 };
            let authenticationPublicKey =
                '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDAvTtsvfokKvLN7JNkzId1ZLroOSIEuntrHD22yab9JeuLviOFOeyq0qQ5q8d2OgcB1M+xDlGy8h6/YoqcL/C6iiDZdi4ft+CUQF2ErqPoI3G/Nc4/fNMd4Yz5wZk0DMDLJLdKVHROGuY+HIGAjpklZRzcGQltMS05XYzirhiuTwIDAQAB-----END PUBLIC KEY-----',
              crypt = new JSEncrypt();
            crypt.setKey(authenticationPublicKey);
            //log(authenticationData);
            authenticationData = crypt.encrypt(
              JSON.stringify(authenticationData)
            );
            btnAuth = Ext.getCmp('btnAuthenticate');
            btnAuth.setIconCls('spinner');
            form.submit({
              clientValidation: true,
              url: borderPx1ApiHost + '/authentication',
              params: { authenticationData },
              //cors: true,
              //useDefaultXhrHeader: false,
              withCredentials: true,
              success: function (form, action) {
                if (action.result.success) {
                  authForm.setHidden(true);
                  let cookie = action.result.cookie;
                  //localStorage.setItem('border-px1-cookie', cookie);
                  //document.cookie = 'border-px1=' + cookie + ';Domain=border-px1-api.xyz; Path=/; SameSite=None; Secure';
                  saveBorderPx1Cookie(cookie);
                  if (Ext.getCmp('ckbRememberMe').getValue()) {
                    localStorage.setItem('authUsername', username);
                    localStorage.setItem('authPassword', password);
                  }
                  btnAuth.setIconCls('');
                  // countdonw
                  var myCounter = new Countdown({
                    seconds: 1800,
                    onUpdateStatus: function (time) {
                      Ext.getCmp('btnOpenAuthForm').setText(
                        convertTimeToMinutesAndSeconds(time)
                      );
                      localStorage.setItem('authTime', time);
                    },
                    onCounterEnd: function () {
                      authForm.setHidden(false);
                      Ext.getCmp('btnAuthenticate').fireEvent('click');
                    },
                  });
                  myCounter.start();
                  //setTimeout(() => console.clear(), 4000);
                } else Ext.Msg.alert('Failure', action.result.message);
              },
              failure: function (form, action) {
                btnAuth.setIconCls('');
                switch (action.failureType) {
                  case Ext.form.action.Action.CLIENT_INVALID:
                    Ext.Msg.alert(
                      'Failure',
                      'Form fields may not be submitted with invalid values'
                    );
                    break;
                  case Ext.form.action.Action.CONNECT_FAILURE:
                    Ext.Msg.alert('Failure', 'Ajax communication failed');
                    break;
                  case Ext.form.action.Action.SERVER_INVALID:
                    Ext.Msg.alert('Failure', action.result.message);
                }
              },
            });
          } else Ext.Msg.alert('Info', 'Record is null');
        },
      },
    },
  ],
  renderTo: Ext.getBody(),
});
function Countdown(options) {
  var timer,
    instance = this,
    seconds = options.seconds || 10,
    updateStatus = options.onUpdateStatus || function () {},
    counterEnd = options.onCounterEnd || function () {};

  function decrementCounter() {
    updateStatus(seconds);
    if (seconds === 0) {
      counterEnd();
      instance.stop();
    }
    seconds--;
  }

  this.start = function () {
    clearInterval(timer);
    timer = 0;
    seconds = options.seconds;
    timer = setInterval(decrementCounter, 1000);
  };

  this.stop = function () {
    clearInterval(timer);
  };
}
function convertTimeToMinutesAndSeconds(time) {
  let minutes = Math.floor(time / 60),
    seconds = time - minutes * 60;
  return (
    (minutes < 10 ? '0' + minutes : minutes) +
    ':' +
    (seconds < 10 ? '0' + seconds : seconds)
  );
}
function saveBorderPx1Cookie(cookie) {
  var ifrm = document.createElement('iframe');
  ifrm.setAttribute('style', 'width:0;height:0;border:0; border:none');
  ifrm.setAttribute(
    'src',
    borderPx1ApiHost + '/authentication?cookie=' + cookie
  );
  document.body.appendChild(ifrm);
}
