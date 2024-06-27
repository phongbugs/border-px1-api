Ext.onReady(() => {
  let tokenPublicKey =
    '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCrRxLdvg03/1KX9xJAW0USP3pSqJTSkwEY3aQ2tphPkKmGAZxVPUgiNjyGxhplR6Q+YKKybmveL/TbhKEWCXRXcRkZVEQo3vG2SFozWcgJIFaCw7g6aU73hG3kYxb+uJsUPR7AUls/YECKeouCKEYgg+aqmJm0zgT+p3vBd/lNzwIDAQAB-----END PUBLIC KEY-----';
  let cdnImageHost =
    localStorage.getItem('cdnImageHost') ||
    (location.host.indexOf('localhost') > -1
      ? 'http://localhost/ShareImgAPI'
      : 'https://imgtest.playliga.com');

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
        title: 'Login Form',
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
              localStorage.getItem('password') || 'aaa',
              location.hostname
            ).toString(CryptoJS.enc.Utf8),
            allowBlank: false,
            submitValue: false,
            listeners: {
              specialkey: function (field, e) {
                if (e.getKey() === e.ENTER) {
                  Ext.getCmp('btnLogin').fireEvent('click');
                }
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
              let form = this.up('form').getForm();
              form.findField('username').setValue('');
              form.findField('password').setValue('');
            },
          },
          {
            text: 'Login',
            id: 'btnLogin',
            formBind: true,
            disabled: true,
            iconCls: 'login-btn',
            listeners: {
              click: () => {
                let loginButton = Ext.getCmp('btnLogin'),
                  form = loginButton.up('form').getForm(),
                  loginData = {
                    username: form.findField('username').getValue(),
                    password: form.findField('password').getValue(),
                    days: 1,
                  };
                if (form.url.indexOf(cdnImageHost) === -1) {
                  let crypt = new JSEncrypt();
                  crypt.setKey(tokenPublicKey);
                  loginData = crypt.encrypt(JSON.stringify(loginData));
                }
                loginButton.setIconCls('spinner');
                loginButton.disable();
                if (form.isValid()) {
                  form.submit({
                    params: form.url.indexOf(cdnImageHost) === -1 ? {loginData} : loginData,
                    success: function (form, action) {
                      if (!action.result.success)
                        Ext.Msg.alert('Login Failed', action.result.message);
                      else {
                        token = action.result.token;
                        // use authenticate asp.net web
                        localStorage.setItem('border-px1-api-cookie', token);
                        document.getElementById('app').innerHTML = '';
                        loginButton.setIconCls('login-btn');
                        loginButton.enable();
                        loadScript('js/index.js?v=' + currentVersion());
                        Ext.Ajax.request({
                          method: 'POST',
                          url: cdnImageHost + '/token/create',
                          params: {
                            username: form.findField('username').getValue(),
                            password: form.findField('password').getValue(),
                            days: 1,
                          },
                          success: function (response) {
                            let rs = JSON.parse(response.responseText);
                            if (rs.success)
                              localStorage.setItem(
                                'token-sync-image-cdn',
                                rs.token
                              );
                            else console.log(rs.message);
                          },
                          failure: function (response) {
                            Ext.Msg.alert('Error', 'Sync CDN Images function');
                          },
                        });

                        // save info
                        localStorage.setItem(
                          'username',
                          form.findField('username').getValue()
                        );
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
                      loginButton.setIconCls('login-btn');
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
