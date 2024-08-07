let selectedWhiteLabelName = getQueryParam('wl') || '';
Ext.define('Domain', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'ID', type: 'int' },
    { name: 'Domain', type: 'string' },
    { name: 'EnableWWW', type: 'int' },
    { name: 'RootValid', type: 'int' },
    { name: 'HTTPS', type: 'int' },
    { name: 'LastUpdate', type: 'date', dateFormat: 'c' },
    { name: 'ServerTime', type: 'date', dateFormat: 'c' },
    { name: 'LastChecked', type: 'date', dateFormat: 'c' },
    { name: 'folderPath', type: 'string' },
    { name: 'specificServer', type: 'string' },
  ],
});
// default domainType
let domainType = getDomainType();
let storeDomain = Ext.create('Ext.data.Store', {
  model: 'Domain',
  proxy: {
    type: 'ajax',
    url: borderPx1ApiHost + '/info/domain/' + domainType + '/' + 'obama.bpx',
    //withCredentials: true,
    reader: {
      type: 'json',
      rootProperty: 'domains',
      transform: {
        fn: function (data) {
          if (data.success) {
            data.domains = JSON.parse(
              CryptoJS.AES.decrypt(data.domains, 'The domain data').toString(
                CryptoJS.enc.Utf8
              )
            );
            data.domains.map((e) => {
              e['specificServer'] ='';
              e['servers'] = [];
              return e;
            });
            // list only url
            // let urls = data.domains.map((e) => e.Domain)
            // log(urls.join('\r\n'))
          }
          return data;
        },
      },
    },
  },
  autoLoad: true,
  listeners: {
    load: (store, records, successful, operation, eOpts) => {
      if (successful) {
        Ext.getCmp('btnCheckDomain').fireEvent('click');
        fetchWhitelabelServers(store);
      }
    },
  },
});
let renderDateTime = (v, _, r) => Ext.Date.format(v, 'm/d/Y H:i:s');
let domainGrid = Ext.create('Ext.grid.Panel', {
  renderTo: 'app',
  id: 'domainGrid',
  store: storeDomain,
  width:
  Ext.getBody().getViewSize().width,
  height: Ext.getBody().getViewSize().height,
  //title: 'Domains',
  hidden: false,
  //frame: true,
  draggable: true,
  resizable: true,
  plugins: ['cellediting'],
  plugins: [
    {
      ptype: 'cellediting',
      clicksToEdit: 1,
    },
  ],
  viewConfig: {
    loadMask: true,
  },
  listeners: {
    // beforeedit: function (editor, context) {},
    show: (grid) => {},
    hide: () => Ext.getCmp('gridWLs').setDisabled(false),
    viewready: (grid) => {
      loadScript('js/authForm.js?v=' + currentVersion());
      Ext.getCmp('btnFindDomain').fireEvent('click');
    }
  },
  //tbar: [],
  dockedItems: [
    {
      xtype: 'toolbar',
      dock: 'top',
      items: [
        {
          xtype: 'button',
          id: 'btnCheckDomain',
          iconCls: 'checkCls',
          text: 'Check All',
          dock: 'right',
          hidden: false,
          listeners: {
            click: () => {
              let store = Ext.getCmp('domainGrid').getStore(),
                stopAtFirst = Ext.getCmp(
                  'ckbStopCheckAt1stValidDomain'
                ).getValue();
              if (stopAtFirst)
                checkDomainAllGridSlow(0, store, stopAtFirst, (domain) => {});
              else checkDomainAllGrid();
            },
          },
        },
        {
          xtype: 'checkbox',
          id: 'ckbStopCheckAt1stValidDomain',
          iconCls: 'checkCls',
          boxLabel: 'Stop checking at 1th valid domain',
          value: true,
        },
        // Note : swap two fields will error at getDomainType() whitlabel grid ???
        {
          xtype: 'checkbox',
          id: 'ckbLoadFromCache',
          iconCls: 'checkCls',
          boxLabel: 'Load From Cache',
          value: true,
          hidden: true,
        },
        
      ],
    },
    {
      xtype: 'toolbar',
      dock: 'top',
      items: [
        {
          xtype: 'combo',
          width: 85,
          store: new Ext.data.ArrayStore({
            fields: ['id', 'name'],
            data: [
              ['mobile.', 'Mobile'],
              ['member', 'Member'],
              ['ag.', 'Agent'],
            ],
          }),
          displayField: 'name',
          valueField: 'id',
          name: 'cbbSiteType',
          id: 'cbbSiteType',
          value: 'member',
          editable: false,
          listeners: {
            change: (_, newValue) => {
              Ext.getCmp('cbbSiteType').setValue(newValue)
              Ext.getCmp('btnFindDomain').fireEvent('click');
            },
          },
        },
        {
          xtype: 'combo',
          width: 85,
          store: new Ext.data.ArrayStore({
            fields: ['id', 'name'],
            data: [
              ['ip.', 'IP'],
              ['name', 'NAME'],
            ],
          }),
          displayField: 'name',
          valueField: 'id',
          name: 'cbbDomainType',
          id: 'cbbDomainType',
          value: 'name',
          editable: false,
          submitValue: false,
          disabled: false,
          listeners: {
            change: function (cb, e) {
              Ext.getCmp('btnFindDomain').fireEvent('click');
            },
          },
          hidden: true
        },
        {
          xtype: 'combo',
          width: 150,
          store: new Ext.data.ArrayStore({
            fields: ['id', 'name'],
            data: JSON.parse(localStorage.getItem('storeWLDomainGrid')),
          }),
          displayField: 'name',
          valueField: 'id',
          queryMode: 'local',
          value: selectedWhiteLabelName,
          id: 'txtNameWLsDomain',
          itemId: 'txtNameWLsDomain',
          //multiSelect: true,
          enableKeyEvents: true,
          doQuery: function (queryString, forceAll) {
            this.expand();
            this.store.clearFilter(!forceAll);
            if (!forceAll) {
              this.store.filter(
                this.displayField,
                new RegExp(Ext.String.escapeRegex(queryString), 'i')
              );
            }
          },
          listeners: {
            change: function (cb, e) {
              Ext.getCmp('btnFindDomain').fireEvent('click');
            },
          },
        },
        {
          xtype: 'combo',
          width: 115,
          store: new Ext.data.ArrayStore({
            fields: ['id', 'name'],
            data: [
              ['Default.aspx', 'Select Col'],
              ['Default.aspx?ref=TestSSM', 'Test SSM DF'],
              ['Main.aspx?ref=TestSSM', 'Test SSM BF'],
              ['Main.aspx?ref=TestHAF', 'Test SSM AF'],
              ['Robots.txt', 'Robots.txt'],
              ['defaultDomain', 'Default.aspx'],
              ['Main.aspx', 'Main.aspx'],
              ['_Bet/Panel.aspx', 'Panel.aspx'],
              ['Google.html', 'Google.html'],
              ['Sitemap.xml', 'Sitemap.xml'],
              ['Header.aspx', 'Header.aspx'],
              ['_View/Register.aspx?ref=12AVF', 'Register.aspx'],
              ['_View/Odds4.aspx', 'Odd4.aspx'],
              ['_View/Odds10.aspx', 'Odd10.aspx'],
              ['public/temp.aspx', 'temp.aspx'],
            ],
          }),
          displayField: 'name',
          valueField: 'id',
          name: 'cbbColumnPage',
          id: 'cbbColumnPage',
          hidden: true,
          value: 'Default.aspx',
          editable: true,
        },
        {
          xtype: 'button',
          text: '',
          id: 'btnFindDomain',
          icon: 'https://icons.iconarchive.com/icons/zerode/plump/16/Search-icon.png',
          listeners: {
            click: () => {
              let whiteLabelName = Ext.getCmp('txtNameWLsDomain').getRawValue(),
                domainType = Ext.getCmp('cbbDomainType').getRawValue().toLowerCase();
              showDomainGridDataByWhitelabel({ whiteLabelName, domainType });
            },
          },
        },
      ],
    },
  ],
  
  columns: [
    new Ext.grid.RowNumberer({ dataIndex: 'no', text: 'No.', width: 60 }),
    {
      text: 'ID',
      width: 50,
      dataIndex: 'ID',
      hidden: true,
    },
    {
      text: 'Hostname',
      width: 180,
      dataIndex: 'Domain',
      renderer: (v, _, r) =>
        Ext.String.format(
          '<a target="_blank" href="{0}://{1}">{2}</a>',
          r.get('HTTPS') === 1 ? 'https' : 'http',
          v.toLowerCase(),
          v
        ),
    },
    {
      text: 'Verify DNS',
      width: 90,
      dataIndex: 'RootValid',
      renderer: (v, _, r) => (v === 1 ? '✅' : '❌'),
      hidden: true,
    },
    {
      text: 'WWW',
      width: 190,
      dataIndex: 'EnableWWW',
      renderer: (v, _, r) =>
        Ext.String.format(
          '<a target="_blank" href="{0}://{1}{2}">{1}{2}</a>',
          r.get('HTTPS') === 1 ? 'https' : 'http',
          v === 1 ? 'www.' : '',
          r.get('Domain').toLowerCase()
        ),
      hidden: true,
    },

    {
      text: 'HTTPS',
      width: 70,
      dataIndex: 'HTTPS',
      renderer: (v, _, r) => (v === 1 ? '✅' : '❌'),
      hidden: true,
    },
    {
      text: 'LastUpdate',
      width: 150,
      dataIndex: 'LastUpdate',
      renderer: renderDateTime,
      hidden: true,
    },
    {
      text: 'ServerTime',
      width: 150,
      dataIndex: 'ServerTime',
      renderer: renderDateTime,
      hidden: true,
    },
    {
      text: 'LastChecked',
      width: 150,
      dataIndex: 'LastChecked',
      renderer: renderDateTime,
      hidden: true,
    },
    {
      xtype: 'actioncolumn',
      text: 'CDW',
      tooltip: 'Check domain workable',
      width: 60,
      iconCls: 'checkCls',
      getClass: function (value, meta, record, rowIndex, colIndex) {
        var folderPath = record.get('folderPath');
        var iconCls = '';
        switch (folderPath) {
          case '':
            iconCls = 'checkCls';
            break;
          case ' ':
            iconCls = 'spinner';
            break;
          case 'checkKoCls':
            iconCls = 'checkKoCls';
            break;
          default:
            iconCls = 'checkOkCls';
            break;
        }
        return iconCls;
      },
      handler: (grid, rowIndex, colIndex, item, e, record) =>
        checkDomainOneRecord(record, () => {}),
    },
    {
      xtype: 'actioncolumn',
      text: 'SDD',
      width: 60,
      tooltip: 'Set default domain',
      iconCls: 'checkCls',
      hidden: true,
      getClass: function (value, meta, record, rowIndex, colIndex) {
        var folderPath = record.get('folderPath');
        var iconCls = '';
        switch (folderPath) {
          case '':
            iconCls = 'checkCls';
            break;
          case ' ':
            iconCls = 'spinner';
            break;
          case 'checkKoCls':
            iconCls = 'checkKoCls';
            break;
          default:
            iconCls = 'defaultDomainCls';
            break;
        }
        return iconCls;
      },
    },
    {
      text: 'Specific Server',
      width: 155,
      dataIndex: 'specificServer',
      editor: {
        xtype: 'combo',
        store:  Ext.create('Ext.data.ArrayStore', {
          fields: ['name'],
          data: [[]],
        }),
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
      },
      hidden: true,
    },
    {
      xtype: 'actioncolumn',
      width: 35,
      tooltip: 'Open link by specific server',
      text: 'O',
      hidden: true,
      items: [
        {
          iconCls: 'openLink',
          getClass: function (value, meta, record, rowIndex, colIndex) {
            var isSpinning = record.get('specificServerSpinner');
            return isSpinning ? 'spinner' : 'openLink';
          },
          handler: function (grid, rowIndex, colIndex, item, e, record) {
            rowIndex = grid.getStore().indexOf(record);
            record = grid.getStore().getAt(rowIndex);
            let domainType = getDomainType();
            let cookieKey =
              domainType === 'ip'
                ? 'border-px1-cookie-ip'
                : 'border-px1-cookie';
            var ip = record.get('specificServer');
            record.set('specificServerSpinner', true);
            Ext.Ajax.request({
              method: 'POST',
              url:
                borderPx1ApiHost + '/info/backendId/' + domainType + '/' + ip,
              headers: {
                Authorization: 'Basic ' + localStorage.getItem(cookieKey),
              },
              //withCredentials: true,
              success: function (response) {
                //log(response);
                record.set('specificServerSpinner', false);
                let result = JSON.parse(response.responseText);
                if (result.success) {
                  let defaultDomain = record.get('Domain'),
                    protocol = Ext.getCmp('cbbProtocol').getValue(),
                    backendId = result.backendId;
                  let url = protocol + '://' + defaultDomain + '/';
                  let pageName = Ext.getCmp('cbbColumnPage').getValue() ;
                  url += pageName + (pageName.indexOf('?') > -1 ? '&' : '?') + 'bpx-backend-id=' + backendId;
                  window.open(url, '_blank');
                } else {
                  if(result.message.indexOf('Invalid URI "undefined/api/domainEdit/token"') > -1)
                    authForm.setHidden(false)
                  else alert(result.message);
                }
              },
              failure: function (response) {
                console.log(response);
              },
            });
          },
        },
      ],
    },
    {
      xtype: 'actioncolumn',
      width: 35,
      tooltip: 'Refresh Session Cache Image Game Version',
      text: 'R',
      items: [
        {
          iconCls: 'syncCls',
          getClass: function (value, meta, record, rowIndex, colIndex) {
            var isSpinning = record.get('refreshSessionSpinner');
            return isSpinning ? 'spinner' : 'syncCls';
          },
          handler: function (grid, rowIndex, colIndex, item, e, record) {
            rowIndex = grid.getStore().indexOf(record);
            record = grid.getStore().getAt(rowIndex);
            let domainType = getDomainType();
            let cookieKey =
              domainType === 'ip'
                ? 'border-px1-cookie-ip'
                : 'border-px1-cookie';
            var ip = record.get('specificServer');
            //record.set('refreshSessionSpinner', true);
            Ext.Ajax.request({
              method: 'POST',
              url:
                borderPx1ApiHost + '/info/backendId/' + domainType + '/' + ip,
              headers: {
                Authorization: 'Basic ' + localStorage.getItem(cookieKey),
              },
              //withCredentials: true,
              success: function (response) {
                //log(response);
                //record.set('specificServerSpinner', false);
                let result = JSON.parse(response.responseText);
                if (result.success) {
                  let defaultDomain = record.get('Domain'),
                    protocol = Ext.getCmp('cbbProtocol').getValue(),
                    backendId = result.backendId;
                  let url = protocol + '://' + defaultDomain + '/';
                  url += '/pgajax.axd?T=SetCacheGameImageVersion&bpx-backend-id=' + backendId;
                  window.open(url, '_blank');
                } else {
                  if(result.message.indexOf('Invalid URI "undefined/api/domainEdit/token"') > -1)
                    authForm.setHidden(false)
                  else alert(result.message);
                }
              },
              failure: function (response) {
                //record.set('specificServerSpinner', false);
                alert(JSON.stringify(response));
              },
            });
          },
        },
      ],
    },
  ],
});

function checkDomainOneRecord(record, callback) {
  // prevent click after done
  //if (record.get('folderPath') !== '') return;

  // create request to express server
  record.set('folderPath', ' '); // start checking
  // check url
  var url = encodeURIComponent(
    btoa('https' + '://' + record.get('Domain'))
  );

  let siteType = getSiteTypeName();
  if (siteType === 'mobile') {
    Ext.Ajax.request({
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('border-px1-api-cookie'),
      },
      url: borderPx1ApiHost + '/info/mobile/?' + new URLSearchParams({ url }),
      success: function (response) {
        // parse jsonString from server
        var result = JSON.parse(response.responseText);
        if (result.success) record.set('folderPath', result.message);
        else record.set('folderPath', 'checkKoCls');
        callback(result.success);
      },
      failure: function (response) {
        log('server-side failure with status code ' + response.status);
        record.set('folderPath', 'checkKoCls');
        callback(false);
      },
    });
  } else {
    Ext.Ajax.request({
      url: borderPx1ApiHost + '/info/folder?' + new URLSearchParams({ url }),
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('border-px1-api-cookie'),
      },
      success: function (response) {
        try {
          var result = JSON.parse(response.responseText.replace(/\\/g, '\\\\'));
          if (result.success)
            record.set('folderPath', result.path.replace(/\//g, '\\'));
          else record.set('folderPath', 'checkKoCls');
          callback(result.success);
        } catch (error) {
          console.log(error);
        }
      },
      failure: function (response) {
        log('server-side failure with status code ' + response.status);
        record.set('folderPath', 'checkKoCls');
        callback(false);
      },
    });
  }
}
// fast and farious
function checkDomainAllGrid() {
  let grid = Ext.getCmp('domainGrid'),
    store = grid.getStore();
  for (var i = 0; i < store.getCount(); i++)
    checkDomainOneRecord(store.getAt(i), () => {});
}

function checkDomainAllGridSlow(index, store, stopAtFirstVailDomain, callback) {
  if (store) {
    let record = store.getAt(index);
    checkDomainOneRecord(record, (success) => {
      if (success && stopAtFirstVailDomain) index = store.getCount();
      if (++index < store.getCount())
        checkDomainAllGridSlow(index, store, stopAtFirstVailDomain, callback);
      else callback(record.get('Domain'));
    });
  } else callback();
}
function fetchWhitelabelServers(store) {
  let siteTypeValue = getSiteTypeValue(),
    siteName = btoa(siteTypeValue + selectedWhiteLabelName.toLowerCase() + '.bpx'),
    domainType = getDomainType(),
    cookieKey =
      getDomainType() === 'ip' ? 'border-px1-cookie-ip' : 'border-px1-cookie';
  Ext.Ajax.request({
    url: borderPx1ApiHost + '/info/server/' + domainType + '/' + siteName,
    headers: {
      Authorization: 'Basic ' + localStorage.getItem(cookieKey),
    },
    //withCredentials: true,
    success: function (response) {
      let result = JSON.parse(response.responseText);
      let success = result.success;
      if (success) {
        let servers = result.servers.map((server) => [server.Name]);
        // if(selectedServerGroupStore) selectedServerGroupStore.loadData(servers);
        if (domainType === 'ip')
          store.getAt(0).set('specificServer', servers[0][0]);
      }
    },
    failure: function (response) {
      log('server-side failure with status code ' + response.status);
    },
  });
}

function showDomainGridDataByWhitelabel({
  whiteLabelName,
  domainType,
  useDomainTypeFromPX1,
}) {
  let domainGrid = Ext.getCmp('domainGrid'),
    domainStore = domainGrid.getStore(),
    siteTypeValue = getSiteTypeValue(),
    siteTypeName = getSiteTypeName(),
    cacheName = whiteLabelName + '_' + domainType + '_' + siteTypeName,
    siteName = siteTypeValue + whiteLabelName.toLowerCase() + '.bpx';

  //domainGrid.show();
  //domainGrid.setTitle('🌍 ' + whiteLabelName + "'s Domains");
  Ext.getCmp('txtNameWLsDomain').setRawValue(whiteLabelName);
  //Ext.getCmp('cbbDomainType').setValue(domainType.toLowerCase());
  Ext.getCmp('cbbSiteType').setValue(
    siteTypeValue === '' ? 'member' : siteTypeValue
  );
  domainStore.loadData([]);
  if (Ext.getCmp('ckbLoadFromCache').getValue()) {
    if (localStorage.getItem(cacheName)) {
      domainStore.loadData(
        JSON.parse(
          CryptoJS.AES.decrypt(
            localStorage.getItem(cacheName),
            'The domain data'
          ).toString(CryptoJS.enc.Utf8)
        ).map((e) => {
          //e['specificServer'] = selectedSpecificServer;
          //e['servers'] = selectedServers;
          return e;
        })
      );
      Ext.getCmp('btnCheckDomain').fireEvent('click');
      fetchWhitelabelServers(domainStore);
    } else {
      // Ext.Msg.alert(
      //   'Caution',
      //   'Cache data of <b>' +
      //     whiteLabelName +
      //     "</b>'s domain doesn't exist<br/> Please uncheck <b>Load From Cache</b> checkbox"
      // );
      //Ext.getCmp('ckbLoadFromCache').setValue(false)
      //Ext.getCmp('btnFindDomain').fireEvent('click');
      loadDomainStoreFromUrl({
        domainStore,
        domainType,
        cacheName,
        siteName,
        useDomainTypeFromPX1,
      });
    }
  } else
    loadDomainStoreFromUrl({
      domainStore,
      domainType,
      cacheName,
      siteName,
      useDomainTypeFromPX1,
    });
}

function loadDomainStoreFromUrl({
  domainStore,
  domainType,
  cacheName,
  siteName,
  useDomainTypeFromPX1,
}) {
  let proxy = domainStore.getProxy();
  domainType = useDomainTypeFromPX1
    ? Ext.getCmp('cbbBorderPx1Url').getValue().indexOf('22365') > -1
      ? 'ip'
      : 'name'
    : domainType;
  proxy.setConfig('url', [
    borderPx1ApiHost + '/info/domain/' + domainType + '/' + btoa(siteName),
  ]);
  //proxy.setConfig('withCredentials', [true]);
  let cookieKey =
    domainType === 'ip' ? 'border-px1-cookie-ip' : 'border-px1-cookie';
  proxy.setHeaders({
    Authorization: 'Basic ' + localStorage.getItem(cookieKey),
  });

  // show loadMask purpose
  domainStore.load({
    callback: function (records, operation, success) {
      try {
        let response = operation.getResponse();
        // only available for Extjs 6.0
        if (response.responseText) {
          let result = JSON.parse(response.responseText);
          if (!result.success) {
            if (
              result.message.indexOf("Cannot read property 'id' of undefined") >
                -1 ||
              result.message.indexOf('Cannot read properties of undefined') > -1
            )
              Ext.Msg.alert(result.message, 'NO DATA');
            else {
              authForm.setHidden(false);
              // Ext.Msg.alert(
              //   result.message,
              //   `Please login <b>BORDER PX1</b> site<br/>
              //   OR <br/>
              //   Check to <b>Load From Cache</b> then close popup and open again`
              // );
            }
            // extjs 6 domain is raw json text
          } else
            localStorage.setItem(cacheName, JSON.stringify(result.domains));
        } else {
          if (!response.responseJson.success) {
            if (response.responseJson.message === 'White label not found')
              Ext.Msg.alert('⚠️' + response.responseJson.message);
            else authForm.setHidden(false);
          }
          // extjs 9 domain is descrypted json
          else
            localStorage.setItem(
              cacheName,
              CryptoJS.AES.encrypt(
                JSON.stringify(response.responseJson.domains),
                'The domain data'
              ).toString()
            );
        }
      } catch (error) {
        log(error);
        //Ext.getCmp('btnAuthenticate').fireEvent('click');
      }
    },
  });
}
