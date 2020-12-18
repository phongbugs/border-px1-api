//if (!isAuthenticated()) return;
Ext.tip.QuickTipManager.init();
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
  ],
});
let storeDomain = Ext.create('Ext.data.Store', {
  model: 'Domain',
  proxy: {
    type: 'ajax',
    url: borderPx1ApiHost + '/info/domain/' + 'liga365.bpx',
    reader: {
      type: 'json',
      rootProperty: 'domains',
      transform: {
        fn: function (data) {
          if (data.success)
            data.domains = JSON.parse(
              CryptoJS.AES.decrypt(data.domains, 'The domain data').toString(
                CryptoJS.enc.Utf8
              )
            );
          return data;
        },
      },
    },
  },
  autoLoad: true,
});
let renderDateTime = (v, _, r) => Ext.Date.format(v, 'm/d/Y H:i:s');
let domainGrid = Ext.create('Ext.grid.Panel', {
  renderTo: 'app',
  id: 'domainGrid',
  store: storeDomain,
  width: 768,
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
  viewConfig: {
    loadMask: true,
  },
  listeners: {
    viewready: (grid) => {},
  },
  tbar: [
    {
      xtype: 'button',
      id: 'btnCheckDomain',
      iconCls: 'checkCls',
      text: 'Check Domain',
      dock: 'right',
      //width: 100,
      listeners: {
        click: () => {
          checkDomainAllGrid();
        },
      },
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
    },

    {
      text: 'HTTPS',
      width: 70,
      dataIndex: 'HTTPS',
      renderer: (v, _, r) => (v === 1 ? '✅' : '❌'),
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
      text: 'OK',
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
        checkDomainOneRecord(record),
    },
  ],
});

function checkDomainOneRecord(record) {
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
    },
    failure: function (response) {
      log('server-side failure with status code ' + response.status);
      record.set('folderPath', 'checkKoCls');
    },
  });
}
function checkDomainAllGrid() {
  let grid = Ext.getCmp('domainGrid'),
    store = grid.getStore();
  for (var i = 0; i < store.getCount(); i++)
    checkDomainOneRecord(store.getAt(i));
}
