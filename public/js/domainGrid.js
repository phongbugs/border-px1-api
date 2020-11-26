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
    },
  },
  listeners: {
    load: function (_, records, successful, operation, eOpts) {},
  },
  autoLoad: true,
});
let renderDateTime = (v, _, r) => Ext.Date.format(v, 'm/d/Y H:i:s');
let domainGrid = Ext.create('Ext.grid.Panel', {
  renderTo: 'app',
  id: 'domainGrid',
  store: storeDomain,
  width: 1024,
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
    },
    {
      text: 'ServerTime',
      width: 150,
      dataIndex: 'ServerTime',
      renderer: renderDateTime,
    },
    {
      text: 'LastChecked',
      width: 150,
      dataIndex: 'LastChecked',
      renderer: renderDateTime,
    },
  ],
});
