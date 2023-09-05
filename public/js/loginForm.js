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
        width: 290,
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
            fieldLabel: 'Username',
            name: 'username',
            value: localStorage.getItem('username') || '',
            allowBlank: false,
            submitValue: false,
          },
          {
            fieldLabel: 'Password',
            name: 'password',
            inputType: 'password',
            value: CryptoJS.AES.decrypt(
              localStorage.getItem('password'),
              location.hostname
            ).toString(CryptoJS.enc.Utf8),
            allowBlank: false,
            submitValue: false,
            listeners: {
              keydown: (tf, e) => {
                if (e.getKey() == e.ENTER)
                  Ext.getCmp('btnLogin').fireEvent('click');
              },
            },
          },
          {
            boxLabel: 'Remember me',
            xtype: 'checkbox',
            id: 'ckbRememberMe',
            submitValue: false,
            value: true,
            hidden: true,
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
                    username: form.findField('username').getValue(),
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
                        loadScript('js/index.js?v=' + currentVersion());
                        // localStorage.setItem(
                        //   'token-sync-image-cdn',
                        //   action.result.responseApiImageCDN.token
                        // );
                        // login to cdn service
                        Ext.Ajax.request({
                          method: 'POST',
                          url: cdnImageHost + '/token/create',
                          params: {
                            secretKey: form.findField('password').getValue(),
                            days: 7,
                          },
                          success: function (response) {
                            let rs = JSON.parse(response.responseText);
                            if (rs.success)
                              localStorage.setItem(
                                'token-sync-image-cdn',
                                rs.token
                              );
                            else alert(rs.message);
                          },
                          failure: function (response) {
                            Ext.Msg.alert('Error', 'Sync CDN Images function');
                          },
                        });

                        // save info
                        localStorage.setItem('username', form.findField('username').getValue());
                        localStorage.setItem(
                          'password',
                          CryptoJS.AES.encrypt(
                            form.findField('password').getValue(),
                            location.hostname
                          ).toString()
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
