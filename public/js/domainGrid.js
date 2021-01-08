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
let domainType = getDomainType();
let storeDomain = Ext.create('Ext.data.Store', {
  model: 'Domain',
  proxy: {
    type: 'ajax',
    url: borderPx1ApiHost + '/info/domain/' + domainType + '/banana.bpx',
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
          }
          return data;
        },
      },
    },
  },
  autoLoad: true,
  listeners: {
    load: () => {
      Ext.getCmp('btnCheckDomain').fireEvent('click');
    },
  },
});
let renderDateTime = (v, _, r) => Ext.Date.format(v, 'm/d/Y H:i:s');
let domainGrid = Ext.create('Ext.grid.Panel', {
  renderTo: 'app',
  id: 'domainGrid',
  store: storeDomain,
  width: 500,
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
    // show: (grid) => {
    //   if (Ext.getCmp('ckbLoadFromCache').getValue())
    //     setTimeout(() => Ext.getCmp('btnCheckDomain').fireEvent('click'), 500);
    // },
    hide: () => Ext.getCmp('gridWLs').setDisabled(false),
    beforeedit: function (editor, context) {
      selectedServerGroupStore.loadData(
        serverStores[context.record.get('servers')]
      );
    },
  },
  tbar: [
    {
      xtype: 'button',
      id: 'btnCheckDomain',
      iconCls: 'checkCls',
      text: 'Check All Domains',
      dock: 'right',
      hidden: true,
      listeners: {
        click: () => {
          let store = Ext.getCmp('domainGrid').getStore(),
            stopAtFist = Ext.getCmp('ckbStopCheckAt1stValidDomain').getValue();
          if (stopAtFist)
            checkDomainAllGridSlow(0, store, stopAtFist, (domain) => {
              log(domain);
            });
          else checkDomainAllGrid();
        },
      },
    },
    {
      xtype: 'checkbox',
      id: 'ckbLoadFromCache',
      iconCls: 'checkCls',
      boxLabel: 'Load From Cache',
      value: true,
    },
    {
      xtype: 'checkbox',
      id: 'ckbStopCheckAt1stValidDomain',
      iconCls: 'checkCls',
      boxLabel: 'Stop checking when 1st domain is valid',
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
      editor: {
        xtype: 'textfield',
      },
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
      width: 130,
      dataIndex: 'specificServer',
      editor: {
        xtype: 'combo',
        store: selectedServerGroupStore,
        displayField: 'name',
        valueField: 'name',
        queryMode: 'local',
      },
    },
    {
      xtype: 'actioncolumn',
      width: 30,
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
            var ip = record.get('specificServer');
            let domainType = getDomainType();
            record.set('specificServerSpinner', true);
            Ext.Ajax.request({
              method: 'POST',
              url:
                borderPx1ApiHost + '/info/backendId/' + domainType + '/' + ip,
              withCredentials: true,
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
                } else alert(result.message);
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
  Ext.Ajax.request({
    url: borderPx1ApiHost + '/info/folder?' + new URLSearchParams({ url }),
    success: function (response) {
      // parse jsonString from server
      var result = JSON.parse(response.responseText.replace(/\\/g, '\\\\'));
      if (result.success)
        record.set('folderPath', result.path.replace(/\//g, '\\'));
      else record.set('folderPath', 'checkKoCls');
      callback(result.success);
    },
    failure: function (response) {
      log('server-side failure with status code ' + response.status);
      record.set('folderPath', 'checkKoCls');
      callback(result.success);
    },
  });
}
// fast and farious
function checkDomainAllGrid() {
  let grid = Ext.getCmp('domainGrid'),
    store = grid.getStore();
  for (var i = 0; i < store.getCount(); i++)
    checkDomainOneRecord(store.getAt(i), () => {});
}

function checkDomainAllGridSlow(index, store, stopAtFistVailDomain, callback) {
  let record = store.getAt(index);
  checkDomainOneRecord(record, (success) => {
    if (success && stopAtFistVailDomain) index = store.getCount();
    if (++index < store.getCount())
      checkDomainAllGridSlow(index, store, stopAtFistVailDomain, callback);
    else callback(record.get('Domain'));
  });
}
