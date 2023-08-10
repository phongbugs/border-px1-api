//if (!isAuthenticated()) return;
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
    url: borderPx1ApiHost + '/info/domain/' + domainType + '/banana.bpx',
    withCredentials: true,
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
              e['specificServer'] = selectedSpecificServer;
              e['servers'] = selectedServers;
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
  width: 520,
  height: 368,
  title: 'Domains',
  style: {
    marginBottom: '20px',
    position: 'absolute',
    top: '10%',
    left: '10%',
    zIndex: 999,
  },
  hidden: true,
  frame: true,
  draggable: true,
  resizable: true,
  tools: [
    {
      type: 'close',
      handler: () => domainGrid.setHidden(true),
    },
  ],
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
          name: 'cbbSiteTypeDomain',
          id: 'cbbSiteTypeDomain',
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
          value: '',
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
        store:  selectedServerGroupStore,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
      },
    },
    {
      xtype: 'actioncolumn',
      width: 35,
      tooltip: 'Open link by specific server',
      text: 'O',
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
                  url += '?bpx-backend-id=' + backendId;
                  window.open(url, '_blank');
                } else {
                  if(result.message.indexOf('Invalid URI "undefined/api/domainEdit/token"') > -1)
                    authForm.setHidden(false)
                  else alert(result.message);
                }
              },
              failure: function (response) {
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
  if (record.get('folderPath') !== '') return;

  // create request to express server
  record.set('folderPath', ' '); // start checking
  // check url
  var url = encodeURIComponent(
    Ext.getCmp('cbbProtocol').getValue() + '://' + record.get('Domain')
  );

  let siteType = getSiteTypeName();
  if (siteType === 'mobile') {
    Ext.Ajax.request({
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
      success: function (response) {
        var result = JSON.parse(response.responseText.replace(/\\/g, '\\\\'));
        if (result.success)
          record.set('folderPath', result.path.replace(/\//g, '\\'));
        else record.set('folderPath', 'checkKoCls');
        callback(result.success);
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
    siteName = siteTypeValue + selectedWhiteLabelName.toLowerCase() + '.bpx',
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
        if(selectedServerGroupStore) selectedServerGroupStore.loadData(servers);
        if (domainType === 'ip')
          store.getAt(0).set('specificServer', servers[0][0]);
      }
    },
    failure: function (response) {
      log('server-side failure with status code ' + response.status);
    },
  });
}
