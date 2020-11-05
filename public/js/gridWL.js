// Global Data
let servers = [
  { ID: '50', Name: '192.168.106.100' },
  { ID: '17', Name: '192.168.106.101' },
  { ID: '19', Name: '192.168.106.102' },
  { ID: '18', Name: '192.168.106.103' },
  { ID: '39', Name: '192.168.106.104' },
  { ID: '48', Name: '192.168.106.105' },
  { ID: '14', Name: '192.168.106.106' },
  { ID: '15', Name: '192.168.106.107' },
  { ID: '16', Name: '192.168.106.108' },
  { ID: '40', Name: '192.168.106.110' },
  { ID: '20', Name: '192.168.106.111' },
  { ID: '21', Name: '192.168.106.112' },
  { ID: '22', Name: '192.168.106.113' },
  { ID: '41', Name: '192.168.106.114' },
  { ID: '42', Name: '192.168.106.115' },
  { ID: '13', Name: '192.168.106.116' },
  { ID: '8', Name: '192.168.106.117' },
  { ID: '9', Name: '192.168.106.118' },
  { ID: '10', Name: '192.168.106.119' },
  { ID: '11', Name: '192.168.106.120' },
  { ID: '12', Name: '192.168.106.121' },
  { ID: '43', Name: '192.168.106.122' },
  { ID: '44', Name: '192.168.106.123' },
  { ID: '45', Name: '192.168.106.124' },
  { ID: '46', Name: '192.168.106.125' },
  { ID: '47', Name: '192.168.106.126' },
  { ID: '54', Name: '192.168.106.167' },
  { ID: '55', Name: '192.168.106.168' },
  { ID: '56', Name: '192.168.106.169' },
  { ID: '57', Name: '192.168.106.170' },
  { ID: '58', Name: '192.168.106.171' },
  { ID: '59', Name: '192.168.106.172' },
  { ID: '60', Name: '192.168.106.173' },
  { ID: '61', Name: '192.168.106.174' },
  { ID: '62', Name: '192.168.106.175' },
  { ID: '72', Name: '192.168.106.177' },
  { ID: '73', Name: '192.168.106.178' },
  { ID: '74', Name: '192.168.106.179' },
  { ID: '23', Name: '192.168.106.67' },
  { ID: '24', Name: '192.168.106.68' },
  { ID: '1', Name: '192.168.106.69' },
  { ID: '25', Name: '192.168.106.70' },
  { ID: '28', Name: '192.168.106.72' },
  { ID: '29', Name: '192.168.106.73' },
  { ID: '30', Name: '192.168.106.74' },
  { ID: '35', Name: '192.168.106.76' },
  { ID: '3', Name: '192.168.106.77' },
  { ID: '5', Name: '192.168.106.78' },
  { ID: '4', Name: '192.168.106.79' },
  { ID: '26', Name: '192.168.106.80' },
  { ID: '31', Name: '192.168.106.82' },
  { ID: '32', Name: '192.168.106.83' },
  { ID: '33', Name: '192.168.106.84' },
  { ID: '36', Name: '192.168.106.85' },
  { ID: '69', Name: '192.168.106.86' },
  { ID: '70', Name: '192.168.106.87' },
  { ID: '71', Name: '192.168.106.88' },
  { ID: '37', Name: '192.168.106.89' },
  { ID: '27', Name: '192.168.106.90' },
  { ID: '34', Name: '192.168.106.92' },
  { ID: '38', Name: '192.168.106.96' },
  { ID: '49', Name: '192.168.106.99' },
];
// Global Functions
function sortAndToList(array) {
  let strWLs = array
    .map((record) => record.name)
    .sort()
    .toString();
  console.log(strWLs);
  return strWLs.split(',').map((e) => [e, e]);
}
// Global Variables
let Groups,
  data = [],
  listNameWLs = [],
  cellClickCount = 1,
  featureGrouping = Ext.create('Ext.grid.feature.GroupingSummary', {
    startCollapsed: true,
    showSummaryRow: false,
    groupHeaderTpl: [
      '<div style="color:#d14836; font-weight: bold">{name:this.formatName}<span style="color:green; font-weight: normal"> ({rows.length} {[values.rows.length > 1 ? "White Labels" : "White Label"]})</span></div>',
      {
        formatName: (name) => {
          for (let i = 0; i < Groups.items.length; i++) {
            if (name.toString() === Groups.items[i]._groupKey.toString()) {
              switch (name) {
                case '177-178-179':
                  name = name + ' [Meta Service]';
                  break;
                case '109-109-109':
                  name = name + ' [Cache Service]';
                  break;
                case '10.168.109.6':
                  name = name + ' [Test Server]';
                  break;
                case '67-68-69':
                case '92-96-104':
                //case "77-78-79":
                case '110-114-115':
                  name = name + ' [Failed Runbat]';
                  break;
                case '116-117-118':
                  name = name + ' [Failed Touchcan]';
                  break;
                case '119-120-121':
                case '173-174-175':
                  name = name + ' [Failed Touchcan & Runbat]';
                  break;
              }
              return (
                '<span style="color:green">[' + (i + 1) + ']</span> ' + name
              );
            }
          }
        },
      },
    ],
  });
Ext.onReady(function () {
  // prevent browser call loadScript('js/gridWL.js') at console log
  if (!isAuthenticated()) return;
  Ext.define('WL', {
    extend: 'Ext.data.Model',
    fields: [
      'name',
      'compType',
      'prefix',
      'defaultNumber',
      'headerNumber',
      'referredWL',
      'mainColor',
      'servers',
      'hasTogel',
      'closedPlaytech',
      'closedMail',
      'referralFunction',
      'oldNames',
      'mobileRedirect',
      'dynamicFooter',
      'securityQuestion',
    ],
  });
  var storeWLs = Ext.create('Ext.data.Store', {
    model: 'WL',
    proxy: {
      type: 'ajax',
      url: 'WLs.json',
      reader: {
        type: 'json',
      },
    },
    listeners: {
      load: function (_, records, successful, operation, eOpts) {
        let whiteLabels = records[0].data;
        delete whiteLabels['id'];
        for (var whitelabelName in whiteLabels) {
          let record = whiteLabels[whitelabelName];
          record['name'] = whitelabelName;
          if (!record['servers']) record['servers'] = '10.168.109.6';
          if (!record['status']) record['status'] = 'live';
          record['isResponsive'] = record['isResponsive']
            ? 'Responsive'
            : 'Non-Responsive';
          data.push(record);
        }
        Groups = storeWLs.getGroups();
        log(Groups);
        storeWLs.loadData(data);
        listNameWLs = sortAndToList(data);
        Ext.getCmp('txtNameWLs').getStore().loadData(listNameWLs);
      },
    },
    autoLoad: true,
  });

  var girdWLs = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    store: storeWLs,
    width: Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
    title: 'Summary LIGA White Labels',
    plugins: [
      'gridfilters',
      //'cellediting'
    ],
    // Can not open href
    //plugins: [{
    //	ptype: 'cellediting',
    //	clicksToEdit: 3
    //}],
    //selModel: 'cellmodel',
    features: [
      //{ ftype: 'grouping' },
      featureGrouping,
    ],
    listeners: {
      cellclick: (gridview, td, cellIndex, record, tr, rowIndex, e, eOpts) => {
        if (cellIndex === 0) {
          if (cellClickCount === 1) {
            cellClickCount = 2;
            Ext.getCmp('txtStartIndex').setValue(td.innerText);
          } else {
            cellClickCount = 1;
            Ext.getCmp('txtEndIndex').setValue(td.innerText);
          }
        }
      },
      viewready: (grid) => {
        loadScript('js/authForm.js');
      },
    },
    tbar: [
      {
        xtype: 'combo',
        width: 65,
        store: new Ext.data.ArrayStore({
          fields: ['id', 'name'],
          data: [
            ['https', 'https'],
            ['http', 'http'],
          ],
        }),
        displayField: 'name',
        valueField: 'id',
        name: 'cbbProtocol',
        id: 'cbbProtocol',
        value: 'https',
        editable: false,
        listeners: {
          change: (_, val) => Ext.getCmp('btnRefresh').fireEvent('click'),
        },
      },
      {
        xtype: 'button',
        id: 'btnRefresh',
        icon:
          'https://icons.iconarchive.com/icons/graphicloads/100-flat/16/reload-icon.png',
        text: 'Refresh',
        // other component can not fireEvent to
        // handler: () => { storeWLs.clearFilter(); storeWLs.loadData(data) },
        listeners: {
          click: () => {
            storeWLs.clearFilter();
            storeWLs.loadData(data);
          },
        },
      },
      {
        xtype: 'combo',
        width: 120,
        store: new Ext.data.ArrayStore({
          fields: ['id', 'name'],
          data: [
            ['default', 'Select Group'],
            ['servers', 'Server'],
            ['mainColor', 'Color'],
            ['referredWL', 'Referred WL'],
            ['status', 'Status'],
            ['isResponsive', 'Responsive'],
            ['closedMail', 'Closed Mail'],
            ['referralFunction', 'Referral Function'],
            ['mobileRedirect', 'Mobile Redirect'],
            ['dynamicFooter', 'Dynamic Footer'],
            ['securityQuestion', 'Security Question'],
          ],
        }),
        queryMode: 'local',
        displayField: 'name',
        valueField: 'id',
        name: 'cbbGrouping',
        id: 'cbbGrouping',
        value: 'default',
        editable: false,
        listeners: {
          change: (_, val) => {
            if (val !== 'default') {
              storeWLs.setGroupField(val);
              Groups = storeWLs.getGroups();
              log('Group By: %s', val);
              for (let i = 0; i < Groups.getCount(); i++) {
                let group = Groups.getAt(i),
                  groupKey = Groups.getAt(i)._groupKey,
                  list = [];
                log('%s: ', groupKey);
                for (let j = 0; j < group.getCount(); j++) {
                  let whiteLabelName = group.getAt(j).getData().name;
                  list.push(whiteLabelName);
                }
                log(list.toString());
              }
              storeWLs.loadData(data);
              featureGrouping.collapseAll();
            }
          },
        },
      },
      {
        xtype: 'combo',
        width: 150,
        store: new Ext.data.ArrayStore({
          fields: ['id', 'name'],
          data: listNameWLs,
        }),
        displayField: 'name',
        valueField: 'id',
        queryMode: 'local',
        value: '',
        id: 'txtNameWLs',
        itemId: 'txtNameWLs',
        multiSelect: true,
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
          keypress: function (cb, e) {
            console.log(cb.getRawValue());
            storeWLs.filter('name', cb.getRawValue());
          },
        },
      },
      {
        xtype: 'button',
        text: 'Find',
        id: 'btnFind',
        icon:
          'https://icons.iconarchive.com/icons/zerode/plump/16/Search-icon.png',
        handler: () =>
          storeWLs.getFilters().add({
            property: 'name',
            value: Ext.getCmp('txtNameWLs')
              .getRawValue()
              .split(',')
              .map((e) => e.trim().toUpperCase()),
            operator: 'in',
          }),
      },
      {
        xtype: 'button',
        text: 'Start RD Service',
        icon:
          'https://icons.iconarchive.com/icons/oxygen-icons.org/oxygen/16/Actions-system-run-icon.png',
        handler: () =>
          Ext.Ajax.request({
            method: 'GET',
            url:
              window.location.href.substr(0, window.location.href.length - 13) +
              '/Public/GetDateModifiedOfFiles.aspx?cmd=StartRDService',
            //url: 'http://localhost:19459/Public/GetDateModifiedOfFiles.aspx?cmd=StartRDService',
            success: function (response) {
              log(response);
            },
            failure: function (response) {
              log(response);
            },
          }),
        disabled: true,
        hidden: true,
      },
      {
        xtype: 'combo',
        width: 100,
        store: new Ext.data.ArrayStore({
          fields: ['id', 'name'],
          data: [
            ['default', 'Select Col'],
            ['Robots.txt', 'Robots.txt'],
            ['defaultDomain', 'Default Domain'],
            ['Main.aspx', 'Main.aspx'],
            ['_Bet/Panel.aspx', 'Panel.aspx'],
            ['Google.html', 'Google.html'],
            ['Sitemap.xml', 'Sitemap.xml'],
            ['Header.aspx', 'Header.aspx'],
            ['_View/Register.aspx', 'Register.aspx'],
          ],
        }),
        displayField: 'name',
        valueField: 'id',
        name: 'cbbColumn',
        id: 'cbbColumn',
        value: 'default',
        editable: false,
      },
      {
        xtype: 'numberfield',
        id: 'txtStartIndex',
        value: 2,
        width: 60,
        listeners: {
          focus: function (tf, e) {
            tf.setValue('');
          },
        },
      },
      {
        xtype: 'numberfield',
        width: 60,
        id: 'txtEndIndex',
        value: 165,
        maxValue: 165,
        minValue: 0,
        listeners: {
          focus: function (tf, e) {
            tf.setValue('');
          },
        },
      },
      {
        xtype: 'button',
        text: 'Open new tabs',
        icon:
          'https://icons.iconarchive.com/icons/icons8/windows-8/16/Programming-External-Link-icon.png',
        handler: () => {
          let startIndex = +Ext.getCmp('txtStartIndex').getValue() - 1,
            endIndex = +Ext.getCmp('txtEndIndex').getValue() - 1,
            url = '';
          for (let i = startIndex; i <= endIndex; i++) {
            let record = storeWLs.getAt(i),
              defaultDomain = record.get('defaultDomain') || undefined,
              name = record.get('name');
            if (!defaultDomain) defaultDomain = name + '.com';
            let url =
                Ext.getCmp('cbbProtocol').getValue() +
                '://' +
                defaultDomain +
                '/',
              columnName = Ext.getCmp('cbbColumn').getValue();

            switch (columnName) {
              case 'default':
              case 'defaultDomain':
                break;
              case 'Robots.txt':
              case 'Main.aspx':
              case '_Bet/Panel.aspx':
              case 'Google.html':
              case 'Sitemap.xml':
              case 'Header.aspx':
              case '_View/Register.aspx':
                url += columnName;
                break;
            }
            window.open(url, '_blank');
          }
        },
      },
      {
        xtype: 'button',
        id: 'btnOpenAuthForm',
        text: 'Open Auth Form',
        dock: 'right',
        listeners: {
          click: () => authForm.setHidden(false),
        },
      },
      '->',
      {
        xtype: 'button',
        id: 'btnLogout',
        icon:
          'https://icons.iconarchive.com/icons/saki/nuoveXT-2/16/Apps-session-logout-icon.png',
        text: 'Logout',
        dock: 'right',
        listeners: {
          click: () => {
            localStorage.removeItem('token');
            location.reload();
          },
        },
      },
    ],
    columns: [
      new Ext.grid.RowNumberer({ dataIndex: 'no', text: 'No.', width: 60 }),
      {
        text: 'Name',
        width: 180,
        dataIndex: 'name',
        renderer: (val, _, record) => {
          let defaultDomain = record.get('defaultDomain'),
            dynamicFooter = record.get('dynamicFooter') ? '🦶' : '',
            mobileRedirect = !record.get('mobileRedirect') ? '📵' : '',
            securityQuestion = record.get('securityQuestion') ? '🔒' : '',
            status = record.get('status'),
            protocol = Ext.getCmp('cbbProtocol').getValue();
          if (!defaultDomain) defaultDomain = val + '.com';
          if (status === 'testing') {
            defaultDomain = val + 'main.playliga.com';
            protocol = 'http';
          }
          let oldNames = '';
          // reverse oldNames - must use slice(0) to overwirte memory array oldNames in Ext Store
          for (let name of record.get('oldNames').slice(0).reverse())
            oldNames +=
              '<del style="color:#fb4848; font-style:italic">' +
              name +
              '</del><br/>';
          return (
            Ext.String.format(
              '<a target="_blank" href="{0}://{1}">{2}</a> {3} {4} {5} {6}<br />',
              protocol,
              defaultDomain.toLowerCase(),
              val,
              mobileRedirect,
              dynamicFooter,
              securityQuestion
            ) + oldNames
          );
        },
        editor: {
          completeOnEnter: false,

          // If the editor config contains a field property, then
          // the editor config is used to create the Ext.grid.CellEditor
          // and the field property is used to create the editing input field.
          field: {
            xtype: 'textfield',
            allowBlank: false,
          },
        },
      },
      {
        text: 'CT',
        width: 50,
        dataIndex: 'compType',
      },
      {
        text: 'Prefix',
        width: 90,
        dataIndex: 'prefix',
        hidden: true,
      },

      {
        text: 'Status',
        width: 80,
        dataIndex: 'status',
        hidden: true,
      },
      {
        text: 'panel',
        width: 150,
        dataIndex: 'defaultDomain',
        hidden: true,
        renderer: (v, _, r) =>
          Ext.String.format(
            '<a target="_blank" href="https://{0}">{0}</a>',
            v ? v : r.get('name').toLowerCase() + '.com' + '/_Bet/Panel.aspx'
          ),
      },
      {
        text: 'Robots',
        width: 150,
        dataIndex: 'defaultDomain',
        hidden: true,
        renderer: (v, _, r) =>
          Ext.String.format(
            '<a target="_blank" href="https://{0}">{0}</a>',
            (v ? v : r.get('name').toLowerCase() + '.com') + '/robots.txt'
          ),
      },
      {
        text: 'Sitemap',
        width: 150,
        dataIndex: 'defaultDomain',
        hidden: true,
        renderer: (v, _, r) =>
          Ext.String.format(
            '<a target="_blank" href="https://{0}">{0}</a>',
            v ? v : r.get('name').toLowerCase() + '.com' + '/sitemap.xml'
          ),
      },
      {
        text: 'Google',
        width: 150,
        dataIndex: 'defaultDomain',
        hidden: true,
        renderer: (v, _, r) =>
          Ext.String.format(
            '<a target="_blank" href="https://{0}">{0}</a>',
            v
              ? v
              : r.get('name').toLowerCase() +
                  '.com' +
                  '/googleae669996542f22e8.html'
          ),
      },
      {
        text: 'referredWL',
        width: 150,
        dataIndex: 'referredWL',
        hidden: true,
      },
      {
        text: 'mainColor',
        width: 150,
        dataIndex: 'mainColor',
        hidden: true,
      },
      {
        text: 'Servers',
        width: 120,
        dataIndex: 'servers',
      },
      {
        text: 'H/D Number',
        width: 100,
        dataIndex: 'headerNumber',
        renderer: (val, _, record) => val + '/' + record.get('defaultNumber'),
        hidden: false,
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        tooltip: 'Open Remote Desktop Connection',
        text: 'R',
        dataIndex: 'servers',
        items: [
          {
            icon:
              'https://icons.iconarchive.com/icons/tpdkdesign.net/refresh-cl/16/Network-Remote-Desktop-icon.png',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              var recordIndex = grid.getStore().indexOf(record);
              var servers = grid.getStore().getAt(recordIndex).get('servers');
              var ip =
                servers !== '10.168.109.6'
                  ? servers
                    ? '10.168.106.' + servers.split('-')[0]
                    : undefined
                  : servers;
              Ext.Ajax.request({
                method: 'GET',
                url: 'http://localhost:3000/remote/' + ip,
                success: function (response) {
                  log(response);
                },
                failure: function (response) {
                  alert(JSON.stringify(response));
                },
              });
            },
          },
        ],
      },
      {
        text: '📵',
        width: 50,
        dataIndex: 'mobileRedirect',
        renderer: (value) => (!value ? '✅' : '❌'),
        hidden: true,
      },
      {
        text: '🦶',
        width: 50,
        dataIndex: 'dynamicFooter',
        renderer: (value) => (value ? '✅' : '❌'),
        hidden: true,
      },
      {
        text: '🔒',
        width: 50,
        dataIndex: 'securityQuestion',
        renderer: (value) => (value ? '✅' : '❌'),
        hidden: true,
      },
      {
        text: '✉',
        width: 50,
        dataIndex: 'closedMail',
        renderer: (value) => (!value ? '✉' : '❌'),
        hidden: true,
      },
      {
        text: '▶',
        tooltip: 'Has Playtech',
        width: 50,
        dataIndex: 'closedPlaytech',
        renderer: (value) => (!value ? '▶' : '❌'),
        hidden: true,
      },
    ],
  });
});
