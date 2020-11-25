Ext.onReady(() => {
  var loginForm = Ext.create('Ext.Panel', {
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
        icon:
          'https://icons.iconarchive.com/icons/hopstarter/soft-scraps/16/Lock-Unlock-icon.png',
        listeners: {
          afterrender: () => {
            var loading = document.getElementById('loading');
            loading.classList.remove('spinner');
          },
        },
        defaultType: 'textfield',
        items: [
          {
            inputType: 'password',
            placeholder: 'password',
            name: 'password',
            allowBlank: false,
          },
        ],
        buttons: [
          {
            text: 'Reset',
            icon:
              'https://icons.iconarchive.com/icons/double-j-design/ravenna-3d/16/Reload-icon.png',
            handler: function () {
              this.up('form').getForm().reset();
            },
          },
          {
            text: 'Login',
            formBind: true,
            disabled: true,
            icon:
              'https://icons.iconarchive.com/icons/custom-icon-design/flatastic-8/16/Keys-icon.png',
            handler: function () {
              let me = this;
              var form = this.up('form').getForm();
              me.setIconCls('spinner');
              me.disable();
              if (form.isValid()) {
                form.submit({
                  success: function (form, action) {
                    if (!action.result.success)
                      Ext.Msg.alert('Login Failed', action.result.message);
                    else {
                      token = action.result.token;
                      localStorage.setItem('token', token);
                      document.getElementById('app').innerHTML = '';
                      me.setIconCls('');
                      me.enable();
                      loadScript('js/whitelabelGrid.js');
                    }
                  },
                  failure: function (form, action) {
                    me.setIconCls('');
                    me.enable();
                    Ext.Msg.alert('Failed', action.result.message);
                  },
                });
              }
            },
          },
        ],
      },
    ],
  });
});
