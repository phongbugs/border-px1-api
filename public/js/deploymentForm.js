let filesParam;
let listFileFromLocal;
let listFailedFile = []
Ext.create('Ext.form.Panel', {
  id: 'deploymentForm',
  title: 'Deployment',
  bodyPadding: 5,
  width: 850,
  height: 400,
  style: {
    marginTop: '20px',
    position: 'absolute',
    top: '100px',
    left: '100px',
    zIndex: 999,
    padding: '5px',
  },
  frame: true,
  collapsible: true,
  resizable: true,
  draggable: true,
  layout: 'column',
  hidden: true,
  defaults: {
    anchor: '100%',
  },
  items: [
    {
      xtype: 'panel',
      id: 'fileListPanel',
      width: 350,
      height: 300,
      //html: '<div style="height:300px; overflow: scroll" id="fileList"></div>',
    },
    {
      xtype: 'panel',
      style: { marginLeft: '10px' },
      border: false,
      items: [
        {
          xtype: 'checkbox',
          id: 'useUrlCheckingDefault',
          boxLabel: 'Use Specific URL',
          labelWidth: 150,
          width: 300,
          value: false,
          listeners: {
            change: (cb, newValue) =>
              Ext.getCmp('txtUrlCheckingDefault').setDisabled(!newValue),
          },
        },
        {
          xtype: 'textfield',
          fieldLabel: 'Specific URL',
          labelWidth: 100,
          disabled: true,
          width: 400,
          id: 'txtUrlCheckingDefault',
          name: 'txtUrlCheckingDefault',
          value: '',
        },
        {
          xtype: 'hiddenfield',
          fieldLabel: 'Files param',
          id: 'filesParam',
          labelWidth: 75,
          width: 300,
          value: filesParam,
        },
        {
          xtype: 'textfield',
          fieldLabel: 'Zip File Name',
          id: 'dzFileName',
          editable: false,
          labelWidth: 100,
          width: 400,
          value: filesParam,
        },
        {
          // Fieldset in Column 2 - collapsible via checkbox, collapsed by default, contains a panel
          xtype: 'fieldset',
          title: 'Deploy Mode',
          width: 400,
          height: 80,
          //columnWidth: 0.5,
          //checkboxToggle: true,
          collapsed: false,
          //layout:'anchor',
          items: [
            {
              xtype: 'radiogroup',
              columns: 3,
              vertical: false,
              items: [
                {
                  xtype: 'checkbox',
                  id: 'cbBackupFull',
                  boxLabel: 'Backup Full',
                  labelWidth: 150,
                  width: 170,
                  value: false,
                },
                {
                  xtype: 'checkbox',
                  id: 'cbIsStart',
                  boxLabel: 'Auto Run Bat File ',
                  labelWidth: 150,
                  width: 170,
                  value: true,
                },
              ],
            },
            {
              xtype: 'radiogroup',
              id: 'rbBatMode',
              //fieldLabel: 'Modes',
              // Arrange radio buttons into two columns, distributed vertically
              columns: 3,
              vertical: false,
              items: [
                { boxLabel: 'Only Backup', name: 'rb', inputValue: 'b' },
                { boxLabel: 'Only Deploy', name: 'rb', inputValue: 'd' },
                {
                  boxLabel: 'Backup & Deploy',
                  name: 'rb',
                  inputValue: 'bd',
                  checked: true,
                },
              ],
              listeners: {
                change: function () {
                  var deployMode = Ext.getCmp('rbBatMode').getValue();
                  var cbBKFull = Ext.getCmp('cbBackupFull');
                  if (deployMode.rb == 'd') {
                    cbBKFull.setDisabled(true);
                  } else {
                    cbBKFull.setDisabled(false);
                  }
                },
              },
            },
          ],
        },
        {
          layout: 'table',
          column: 2,
          width: 300,
          border: false,
          items: [
            {
              xtype: 'checkbox',
              id: 'cbAutoCheck',
              boxLabel: 'Auto checking',
              labelWidth: 150,
              width: 170,
              value: false,
              listeners: {
                change: function (cb, newValue) {
                  if (newValue == true) {
                    Ext.getCmp('txtCheckingTime').setDisabled(false);
                  } else {
                    Ext.getCmp('txtCheckingTime').setDisabled(true);
                  }
                },
              },
            },
            {
              xtype: 'textfield',
              fieldLabel: 'Check time',
              labelWidth: 70,
              width: 110,
              id: 'txtCheckingTime',
              name: 'txtCheckingTime',
              value: 7,
              maxLength: 2,
              allowBlank: false,
              disabled: true,
            },
          ],
        },
      ],
    },
  ],
  tools: [
    {
      type: 'close',
      disabled: false,
      handler: () => Ext.getCmp('deploymentForm').setHidden(true),
    },
  ],
  tbar: [
    {
      xtype: 'filefield',
      name: 'zipFile',
      id: 'zipFile',
      fieldLabel: '',
      labelWidth: 0,
      width: 400,
      msgTarget: 'side',
      allowBlank: false,
      buttonText: 'Select .zip file to deploy',
      listeners: {
        change: function () {
          // need filter at client also
          // https://www.sencha.com/forum/showthread.php?286958-How-to-filter-file-types-in-extjs-5
          var dzFileNamePath = Ext.getCmp('zipFile').getValue().split('\\');
          var dzFileName = dzFileNamePath[dzFileNamePath.length - 1];
          Ext.getCmp('dzFileName').setValue(dzFileName);
          Ext.getCmp('btnUpload').fireEvent('click');
        },
      },
    },
    {
      xtype: 'button',
      text: 'Upload',
      id: 'btnUpload',
      hidden: true,
      listeners: {
        click: function () {
          var form = this.up('form').getForm();
          if (form.isValid()) {
            form.submit({
              url: 'deployment/upload-file-to-express',
              // ?fileUserUpload=' +
              // $('#txtUserName').val() +
              // '&fileClientName=' +
              // Ext.getCmp('txtSubClientNames').getRawValue() +
              // '&fileWsType=' +
              // Ext.getCmp('txtWsType').getRawValue(),
              // params: {
              //     fileUserUpload: $('#txtUserName').val(),
              //     fileClientName:  Ext.getCmp('txtSubClientNames').getRawValue(),
              //     fileWsType: Ext.getCmp('txtWsType').getRawValue(),
              // },
              waitMsg: 'Uploading your file...',
              success: function (_, action) {
                // filesParam =
                //   '/Public/GetDateModifiedOfFiles.aspx?files=' +
                //   exportToFilesParam(result.listFile);
                // jsonObjsZipFile = result.listFile;
                // Ext.getCmp('filesParam').setValue(filesParam);
                let result = action.result;
                listFileFromLocal = result.listFile;
                Ext.getCmp('fileListPanel').setHtml(
                  '<div style="height: 95%" id="fileList"></div>'
                );
                // create store
                var store = Ext.create('Ext.data.TreeStore', {
                  root: {
                    expanded: true,
                    children: addMoreTextAndLeafAttr(result.listFile),
                  },
                });
                // create tree file list
                Ext.create('Ext.tree.Panel', {
                  header: false,
                  title: 'file list',
                  width: 380,
                  height: 400,
                  store: store,
                  rootVisible: true,
                  scrollable: true,
                  renderTo: 'fileList',
                });
              },
              failure: (_, action) =>
                Ext.Msg.alert('Error', action.result.message),
            });
          }
        },
      },
    },
    {
      xtype: 'button',
      width: 120,
      text: 'Get All Folder',
      tooltip: 'Get All Folder',
      iconCls: 'folderCls',
      listeners: {
        click: (btn) => {
          btn.setIconCls('spinner');
          fetchFolderAllWLs(2, storeWLs, () => btn.setIconCls('folderCls'));
        },
      },
    },
    {
      xtype: 'button',
      width: 100,
      //style:{marginLeft:'100px'},
      text: 'Check All',
      iconCls: 'checkFileCls',
      listeners: {
        click: function () {
          // call event click of all button in grid
          checkAllDeployingSite();
        },
      },
    },
  ],
  listeners: {
    show: function () {
      $('input#txtUrlCheckingDefault-inputEl').focus(function () {
        $(this).select();
      });
    },
  },
  renderTo: Ext.getBody(),
});

// ============================== UNIT FUNCS ==============================
function addMoreTextAndLeafAttr(json) {
  for (let i = 0; i < json.length; i++) {
    json[i]['text'] = json[i].fileName;
    json[i]['leaf'] = false;
    json[i]['iconCls'] = 'fa fa-file';
    json[i]['children'] = [
      {
        text: json[i].modifiedDate.substr(0, 23),
        leaf: false,
        iconCls: 'fa fa-clock',
      },
    ];
  }
  return json;
}

function exportToFilesParam(json) {
  var fileNames = '';
  for (var i = 0; i < json.length; i++) {
    fileNames += json[i].fileName + ',';
  }
  // remove comma sign
  return fileNames.substr(0, fileNames.length - 1);
}
// fix format date from server : https://msdn.microsoft.com/en-us/library/az4se3k1(v=vs.110).aspx
// 2009-06-15T13:45:30 -> 2009/6/15 13:45 (zh-CN)
// 12/15/2015, 3:23:41 PM --> convert to 12/15/2015 3:23:41 PM
function compare2Json(json1, json2) {
  if (json1.length == undefined || json2 == undefined) {
      Ext.Msg.alert('JSON ERROR', 'site or zip file not exists');
      return;
  }
  if (json1.length != json2.length) {
      Ext.Msg.alert('Error', 'Error JSON jsonSite.length(' + json1.length + ')!=jsonZip.length(' + json2.length + ')');
      return;
  }
  else {
      var json = { success: true, files: [] }
      for (var i = 0; i < json1.length; i++) {
          // cause datetime in zip is greater than datetime on site one second for odd number ( not even)
          var dateSite = new Date(json1[i]["modifiedDate"]);
          dateSite.setSeconds(0);
          var dateZip = new Date(json2[i]["modifiedDate"].replace(', ', ' '));
          dateZip.setSeconds(0);

          // Malaysia Time & Vietnam Time
          var hourMalaysia = dateSite.getHours();
          dateSite.setHours(hourMalaysia - 1);

          // fix one minute
          if (dateSite.getHours() == dateZip.getHours() && dateSite.getSeconds() == dateZip.getSeconds())
              if (dateZip.getMinutes() - dateSite.getMinutes() == 1) {
                  var minute = dateSite.getMinutes() + 1;
                  dateSite.setMinutes(minute, 0, 0);
              }

          if (dateSite.toLocaleString() != dateZip.toLocaleString()) {
              if (dateSite.toLocaleDateString() == dateZip.toLocaleDateString() && dateSite.getHours() < dateZip.getHours() && dateSite.getMinutes() == dateZip.getMinutes()) {
                  console.log('server setup Vietnam TimeZone');
              }
              else {
                  json["success"] = false;
                  json["files"].push(json1[i]["fileName"] + '(' + dateSite.toLocaleString() + ')')
              }
          }
      }
      return json;
  }
}
