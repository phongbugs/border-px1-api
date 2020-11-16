Ext.onReady(() => {
  var loginForm = Ext.create('Ext.Panel', {
    layout: 'center',
    border: false,
    bodyStyle: 'background:transparent',
    bodyPadding: '50%',
    items: [
      {
        xtype: 'form',
        bodyStyle: 'background:transparent',
        title: 'Type Password',
        bodyPadding: 15,
        width: 170,
        url: borderPx1ApiHost + '/user/login',
        layout: 'anchor',
        defaults: {
          anchor: '100%',
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
            handler: function () {
              this.up('form').getForm().reset();
            },
          },
          {
            text: 'Login',
            formBind: true,
            disabled: true,
            handler: function () {
              let me = this;
              var form = this.up('form').getForm();
              me.setIconCls('spinner');
              if (form.isValid()) {
                form.submit({
                  success: function (form, action) {
                    if (!action.result.success)
                      Ext.Msg.alert('Login Failed', action.result.message);
                    else {
                      token = action.result.token;
                      localStorage.setItem('token', token);
                      document.getElementById('app').innerHTML = '';
                      me.setIconcls('');
                      loadScript('js/whitelabelGrid.js');
                    }
                  },
                  failure: function (form, action) {
                    me.setIconcls('');
                    Ext.Msg.alert('Failed', action.result.message);
                  },
                });
              }
            },
          },
        ],
      },
    ],
    renderTo: 'app',
  });
});
