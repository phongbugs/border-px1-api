let authForm = Ext.create('Ext.form.Panel', {
  id: 'authForm',
  title: 'LOGIN BORDER PX1 SITE',
  icon:
    'https://icons.iconarchive.com/icons/shlyapnikova/toolbar-2/32/brick-wall-icon.png',
  bodyPadding: 15,
  width: 350,
  height: 210,
  style: {
    marginBottom: '20px',
    position: 'absolute',
    top: '10%',
    right: '50%',
    zIndex: 999,
  },
  frame: true,
  draggable: true,
  layout: 'anchor',
  hidden: true,
  listeners: {
    afterrender: () => {
      let domainType = getDomainType();
      Ext.Ajax.request({
        method: 'GET',
        url: borderPx1ApiHost + '/authentication/status/' + domainType,
        withCredentials: true,
        success: function (response) {
          let result = JSON.parse(response.responseText);
          if (result.success) {
            var myCounter = new Countdown({
              seconds: localStorage.getItem('authTime'),
              onUpdateStatus: function (time) {
                // Ext.getCmp('btnAuthenticate').setText(
                //   convertTimeToMinutesAndSeconds(time)
                // );
                localStorage.setItem('authTime', time);
              },
              onCounterEnd: function () {
                authForm.setHidden(false);
                Ext.getCmp('btnAuthenticate').fireEvent('click');
              },
            });
            Ext.getCmp('btnSyncAllDomain').setDisabled(false);
            myCounter.start();
          }
        },
        failure: function (response) {
          log(response);
          Ext.Msg.alert('Failure', 'authentication/status error');
        },
      });
    },
    show: () => {
      Ext.getCmp('txtUsername').setValue(
        decrypt(localStorage.getItem('authUsername')) || ''
      );
      Ext.getCmp('txtPassword').setValue(
        decrypt(localStorage.getItem('authPassword')) || ''
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
      width: 75,
      store: new Ext.data.ArrayStore({
        fields: ['id', 'name'],
        data: [
          [
            'https://net-ub.admin.28777.cloud-dn.net',
            '[NA] https://net-ub.admin.28777.cloud-dn.net',
          ],
          [
            'https://net-ub.admin.28777.cloud-dn.net',
            '[IP] https://net-ub.admin.28777.cloud-dn.net',
          ],
        ],
      }),
      displayField: 'name',
      valueField: 'id',
      name: 'cbbBorderPx1Url',
      id: 'cbbBorderPx1Url',
      value: 'https://net-ub.admin.28777.cloud-dn.net',
      editable: false,
      submitValue: false,
      listeners: {
        change: (_, newValue) => {
          if (newValue === 'https://net-ub.admin.28777.cloud-dn.net') {
            Ext.getCmp('cbbSiteType').setValue('member');
            Ext.getCmp('cbbProtocol').setValue('http');
          }
        },
      },
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
      value: true,
    },
  ],

  // Reset and Submit buttons
  buttons: [
    {
      text: 'Reset',
      handler: () => this.up('form').getForm().reset(),
    },
    {
      text: 'Authenticate',
      id: 'btnAuthenticate',
      iconCls: 'authenticationCls',

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
              params: {
                authenticationData: authenticationData,
                domainType: getDomainType(),
              },
              withCredentials: true,
              success: function (form, action) {
                if (action.result.success) {
                  authForm.setHidden(true);
                  let cookie = action.result.cookie;
                  //=> use localstorage
                  // localStorage.setItem('border-px1-cookie', cookie);
                  //=> use for cookie same domain
                  // document.cookie = 'border-px1=' + cookie + ';Domain=border-px1-api.xyz; Path=/; SameSite=None; Secure';
                  //=> use for cookie cross domain
                  saveBorderPx1Cookie(cookie);
                  if (Ext.getCmp('ckbRememberMe').getValue()) {
                    localStorage.setItem('authUsername', encrypt(username));
                    localStorage.setItem('authPassword', encrypt(password));
                  }
                  btnAuth.setIconCls('authenticationCls');
                  Ext.getCmp('btnSyncAllDomain').setDisabled(false);
                  // countdonw
                  var myCounter = new Countdown({
                    seconds: 1800,
                    onUpdateStatus: function (time) {
                      // Ext.getCmp('btnAuthenticate').setText(
                      //   convertTimeToMinutesAndSeconds(time)
                      // );
                      localStorage.setItem('authTime', time);
                    },
                    onCounterEnd: function () {
                      authForm.setHidden(false);
                      Ext.getCmp('btnAuthenticate').fireEvent('click');
                    },
                  });
                  myCounter.start();
                  setTimeout(() => console.clear(), 4000);
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
                    Ext.Msg.alert(
                      'Failure',
                      action.result.message +
                        '<br />Please Login BORDER PX1 again !'
                    );
                }
              },
            });
          } else Ext.Msg.alert('Info', 'Please fill username/password');
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
  let domainType = getDomainType();
  var ifrm = document.createElement('iframe');
  ifrm.setAttribute('style', 'width:0;height:0;border:0; border:none');
  ifrm.setAttribute(
    'src',
    borderPx1ApiHost + '/authentication/' + domainType + '?cookie=' + cookie
  );
  document.body.appendChild(ifrm);
  setTimeout(() => console.clear(), 3000);
}
let decrypt = (str) =>
    str
      ? CryptoJS.AES.decrypt(str, location.hostname).toString(CryptoJS.enc.Utf8)
      : '',
  encrypt = (str) =>
    str ? CryptoJS.AES.encrypt(str, location.hostname).toString() : '';
