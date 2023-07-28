Ext.onReady(() => {
  let tokenPublicKey =
    '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrRxLdvg03/1KX9xJAW0USP3pSqJTSkwEY3aQ2tphPkKmGAZxVPUgiNjyGxhplR6Q+YKKybmveL/TbhKEWCXRXcRkZVEQo3vG2SFozWcgJIFaCw7g6aU73hG3kYxb+uJsUPR7AUls/YECKeouCKEYgg+aqmJm0zgT+p3vBd/lNzwIDAQAB-----END PUBLIC KEY-----';
  Ext.create('Ext.Panel', {
    id: 'loginForm',
    layout: 'center',
    border: false,
    bodyStyle: 'background:transparent',
    bodyPadding: '50%',
    renderTo: 'app',
    items: [
      {
        xtype: 'form',
        bodyStyle: 'background:transparent',
        title: 'Type Password',
        bodyPadding: 15,
        width: 190,
        url: borderPx1ApiHost + '/user/login',
        layout: 'anchor',
        frame: true,
        defaults: {
          anchor: '100%',
        },
        icon: 'https://icons.iconarchive.com/icons/hopstarter/soft-scraps/16/Lock-Unlock-icon.png',
        listeners: {
          afterrender: () => {
            var loading = document.getElementById('loading');
            loading.classList.remove('spinner');
          },
        },
        defaultType: 'textfield',
        items: [
          {
            xtype: 'textfield',
            inputType: 'password',
            placeholder: 'password',
            name: 'password',
            allowBlank: false,
            enableKeyEvents: true,
            submitValue: false,
            listeners: {
              keydown: (tf, e) => {
                if (e.getKey() == e.ENTER)
                  Ext.getCmp('btnLogin').fireEvent('click');
              },
            },
          },
        ],
        buttons: [
          {
            text: 'Reset',
            icon: 'https://icons.iconarchive.com/icons/double-j-design/ravenna-3d/16/Reload-icon.png',
            handler: function () {
              this.up('form').getForm().reset();
            },
          },
          {
            text: 'Login',
            id: 'btnLogin',
            formBind: true,
            disabled: true,
            icon: 'https://icons.iconarchive.com/icons/custom-icon-design/flatastic-8/16/Keys-icon.png',
            listeners: {
              click: () => {
                let loginButton = Ext.getCmp('btnLogin'),
                  form = loginButton.up('form').getForm(),
                  crypt = new JSEncrypt(),
                  cdnImageHost =
                    localStorage.getItem('cdnImageHost') ||
                    (location.host.indexOf('localhost') > -1
                      ? 'http://localhost/cdn'
                      : 'https://imgtest.playliga.com'),
                  loginData = {
                    password: form.findField('password').getValue(),
                    cdnImageHost: cdnImageHost,
                  };

                crypt.setKey(tokenPublicKey);
                loginData = crypt.encrypt(JSON.stringify(loginData));
                loginButton.setIconCls('spinner');
                loginButton.disable();
                if (form.isValid()) {
                  form.submit({
                    params: { loginData },
                    success: function (form, action) {
                      if (!action.result.success)
                        Ext.Msg.alert('Login Failed', action.result.message);
                      else {
                        token = action.result.token;
                        // use authenticate asp.net web
                        localStorage.setItem('border-px1-api-cookie', token);
                        document.getElementById('app').innerHTML = '';
                        loginButton.setIconCls('');
                        loginButton.enable();
                        loadScript(
                          'js/whitelabelGrid.js?v=' + currentVersion()
                        );
                        localStorage.setItem(
                          'token-sync-image-cdn',
                          action.result.responseApiImageCDN.token
                        );
                      }
                    },
                    failure: function (form, action) {
                      loginButton.setIconCls('');
                      loginButton.enable();
                      Ext.Msg.alert('Failed', action.result.message);
                    },
                  });
                }
              },
            },
          },
        ],
      },
    ],
  });
});
