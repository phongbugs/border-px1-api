let authForm = Ext.create('Ext.form.Panel', {
  id: 'authForm',
  title: 'Input Accout BORDER PX1 Site',
  bodyPadding: 15,
  width: 300,
  height: 150,
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
      fieldLabel: 'Username',
      id: 'txtUsername',
      name: 'txtUsername',
      allowBlank: false,
      submitValue: false
    },
    {
      fieldLabel: 'Password',
      id: 'txtPassword',
      inputType: 'password',
      allowBlank: false,
      submitValue: false
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
      formBind: true, //only enabled once the form is valid
      disabled: true,
      handler: function () {
        let form = this.up('form').getForm();
        if (form.isValid()) {
          var authenticationData = {
            username: Ext.getCmp('txtUsername').getValue(),
            password: Ext.getCmp('txtPassword').getValue()
          };
          var publicKey = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDAvTtsvfokKvLN7JNkzId1ZLroOSIEuntrHD22yab9JeuLviOFOeyq0qQ5q8d2OgcB1M+xDlGy8h6/YoqcL/C6iiDZdi4ft+CUQF2ErqPoI3G/Nc4/fNMd4Yz5wZk0DMDLJLdKVHROGuY+HIGAjpklZRzcGQltMS05XYzirhiuTwIDAQAB-----END PUBLIC KEY-----'
          var crypt = new JSEncrypt();
          crypt.setKey(publicKey);
          log(authenticationData)
          authenticationData = crypt.encrypt(
            JSON.stringify(authenticationData)
          );
          form.submit({
            clientValidation: true,
            url: borderPx1ApiHost + '/authentication',
            params: { authenticationData },
            success: function (form, action) {
              Ext.Msg.alert('Success', action.result.msg);
            },
            failure: function (form, action) {
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
                  Ext.Msg.alert('Failure', action.result.msg);
              }
            },
          });
        } else Ext.Msg.alert('Status', 'Record is null');
      },
    },
  ],
  renderTo: Ext.getBody(),
});
