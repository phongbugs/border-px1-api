// Global Data
let serverStores = {
    'CLG Pool 01': [
      ['CLG-P01-CTG-130'],
      ['CLG-P01-GGB-4'],
      ['CLG-P01-SUN-2'],
      ['CLG-P01-CT2-34'],
    ],
    'CLG Pool 02': [
      ['CLG-P02-CTG-131'],
      ['CLG-P02-SUN-3'],
      ['CLG-P02-GGB-5'],
      ['CLG-P02-CT2-5'],
    ],
    'CLG Pool 03': [
      ['CLG-P03-SUN-4'],
      ['CLG-P03-GGB-6'],
      ['CLG-P03-CTG-132'],
      ['CLG-P03-CT2-36'],
    ],
    'CLG Pool Service': [['0.0.0.0'], ['0.0.0.0'], ['0.0.0.0']],
    'CLG Pool Testing': [['192.168.9.6'], ['192.168.9.6'], ['192.168.9.6']],
  },
  selectedServerGroupStore = Ext.create('Ext.data.ArrayStore', {
    fields: ['name'],
    data: [[]],
  }),
  // send to grid domain selected specific server from white label grid
  selectedWhiteLabelName = '',
  selectedSpecificServer = '', // full server ip
  selectedServers = '', // short hand ip 177-178-179
  sortAndToList = (array) => {
    let strWLs = array
      .map((record) => record.name)
      .sort()
      .toString();
    console.log(strWLs);
    return strWLs.split(',').map((e) => [e, e]);
  };
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
            //log('%s - %s', name, Groups.items[i]._groupKey.toString())
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
                //case "77-78-79":
                case '110-114-115':
                  name = name + ' [FC-D]';
                  break;
                case '116-117-118':
                  name = name + ' [FT]';
                  break;
                case '119-120-121':
                case '173-174-175':
                  name = name + ' [FC & FT]';
                  break;
                case '67-68-69':
                case '92-96-104':
                  name = name + ' [FC-B]';
                  break;
                case '183-184-185':
                  name = name + ' [FC]';
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
    'hasPopup',
    'machineKey',
    'serverPoolIPs',
  ],
});
let storeWLs = Ext.create('Ext.data.Store', {
  model: 'WL',
  proxy: {
    type: 'ajax',
    url: 'WLs.json',
    reader: {
      type: 'json',
    },
  },
  listeners: {
    beforeload: (store) => {
      store.getProxy().setHeaders({
        Authorization: 'Basic ' + localStorage.getItem('border-px1-api-cookie'),
      });
    },
    load: function (_, records, successful, operation, eOpts) {
      let whiteLabels = records[0].data;
      delete whiteLabels['id'];
      for (var whitelabelName in whiteLabels) {
        try {
          let record = whiteLabels[whitelabelName];
          record['name'] = whitelabelName;
          //if(!record['servers'])  record['servers'] =  ;
          if (!record['status']) record['status'] = 'live';
          else {
            record['servers'] = '10.168.109.6';
          }
          record['isResponsive'] = record['isResponsive']
            ? 'Responsive'
            : 'Non-Responsive';
          record['machineKey'] = record['machineKey']
            ? 'Machine Key'
            : 'None Machine Key';
          record['referralFunction'] = record['referralFunction']
            ? 'RF'
            : 'None';
          // if (record['servers']) {
          //   let servers = record['servers'];
          //   record['specificServer'] =
          //     servers !== '10.168.109.6'
          //       ? servers
          //         ? //? '192.168.106.' + servers.split('-')[0]
          //           record['serverPool']
          //           ? serverStores[record['serverPool']][0][0]
          //           : '0.0.0.0'
          //         : undefined
          //       : servers;
          // }
          record['specificServer'] = serverStores[record['serverPool']][0][0];
          //log(serverStores[record['serverPool'][0][0]])
          if (!record['referredIconMenu'])
            record['referredIconMenu'] = '__TEXT-MENU__';
          // icon spniner cols
          record['specificServerSpinner'] = false;
          record['remoteDesktopSpinner'] = false;
          record['isSyncedDomain'] = false;
          record['isSyncedFolder'] = false;
          record['folderPath'] = '';
          record['backupDate'] = '';

          data.push(record);
        } catch (error) {
          log(error);
          log(whitelabelName)
        }
      }
      Groups = storeWLs.getGroups();
      if (Groups) log(Groups);
      storeWLs.loadData(data);
      listNameWLs = sortAndToList(data);
      Ext.getCmp('txtNameWLs').getStore().loadData(listNameWLs);
    },
  },
  autoLoad: true,
});
Ext.onReady(function () {
  authenticate((isAuthenticated) => {
    if (!isAuthenticated) location.reload();
  });
  var girdWLs = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'gridWLs',
    store: storeWLs,
    //hidden: true,
    width:
      Ext.getBody().getViewSize().width < 1388
        ? 1388
        : Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
    title: 'Summary LIGA White Labels',
    plugins: ['gridfilters', 'cellediting'],
    // Can not open href
    plugins: [
      {
        ptype: 'cellediting',
        clicksToEdit: 1,
      },
    ],
    //selModel: 'cellmodel',
    features: [
      //{ ftype: 'grouping' },
      featureGrouping,
    ],
    listeners: {
      beforeedit: function (editor, context) {
        selectedServerGroupStore.loadData(
          serverStores[context.record.get('servers')]
        );
        //log(context.value);
        //log(selectedServerGroupStore.getData());
      },
      cellclick: (gridview, td, cellIndex, record, tr, rowIndex, e, eOpts) => {
        let whitelabelName = record.get('name'),
        serverPoolIPs = record.get('serverPoolIPs');
        if (cellIndex === 0) {
          if (cellClickCount === 1) {
            cellClickCount = 2;
            Ext.getCmp('txtStartIndex').setValue(td.innerText);
          } else {
            cellClickCount = 1;
            Ext.getCmp('txtEndIndex').setValue(td.innerText);
          }
        } else if (
          cellIndex > 1 &&
          cellIndex < 13 &&
          whitelabelName !== 'BPXURLS' &&
          whitelabelName !== 'BPXIP' &&
          whitelabelName !== 'SHARECACHE' &&
          whitelabelName !== 'CLG Pool 01' &&
          whitelabelName !== 'CLG Pool 02' &&
          whitelabelName !== 'CLG Pool 03' &&
          serverPoolIPs !== 'CLG Pool Testing' &&
          record.get('servers') !== '10.168.109.6'
        ) {
          Ext.getCmp('gridWLs').setDisabled(true);
          // send to grid domain two columns
          selectedWhiteLabelName = record.get('name');
          selectedSpecificServer = record.get('specificServer');
          selectedServers = record.get('servers');
          // handlings of domain grid
          let whiteLabelName = record.get('name'),
          domainType = getDomainType().toLowerCase(),
          useDomainTypeFromPX1 = true;
          Ext.getCmp('txtNameWLsDomain').getStore().loadData(listNameWLs);
          showDomainGridDataByWhitelabel({whiteLabelName, domainType, useDomainTypeFromPX1})
        }
      },
      viewready: (grid) => {
        loadScript('js/authForm.js?v=' + currentVersion());
        // if it's 6.2 it will show button 7.0
        if (location.href.indexOf('7.html') === -1)
          Ext.getCmp('btnSwitchExtjsVesion').setIconCls('extjsVersion7');
        else Ext.getCmp('btnSwitchExtjsVesion').setIconCls('extjsVersion6');
        setTimeout(() => {
          getDomainType = () =>
            Ext.getCmp('cbbBorderPx1Url').getValue().indexOf('22365') > -1
              ? 'ip'
              : 'name';
          loadScript('js/domainGrid.js?v=' + currentVersion());
        }, 1000);
      },
    },
    // dockedItems: [
    //   {
    //     xtype: 'toolbar',
    //     dock: 'top',
    //     items: [{ text: 'Toolbar 1 Button 1' }, { text: 'Toolbar 1 Button 2' }],
    //   },
    //   {
    //     xtype: 'toolbar',
    //     dock: 'top',
    //     items: [{ text: 'Toolbar 2 Button 1' }],
    //   },
    // ],
    tbar: [
      {
        xtype: 'button',
        id: 'btnRefresh',
        iconCls: 'refreshCls',
        listeners: {
          click: () => {
            storeWLs.clearFilter();
            storeWLs.loadData(data);
          },
        },
      },
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
        // listeners: {
        //   change: (_, val) => Ext.getCmp('btnRefresh').fireEvent('click'),
        // },
      },
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
            // mobile and agent dont have ip domain
            if (newValue === 'mobile.' || newValue === 'ag.')
              Ext.getCmp('cbbBorderPx1Url').setValue(
                'https://net-ga.admin.12365.bpx-cdn.cloud'
              );
            Ext.getCmp('btnRefresh').fireEvent('click');
          },
        },
      },
      {
        xtype: 'combo',
        width: 150,
        store: new Ext.data.ArrayStore({
          fields: ['id', 'name'],
          data: [
            ['default', 'Select Group'],
            ['serverPoolIPs', 'Server Pool'],
            ['machineKey', 'Machine Key'],
            ['status', 'Status'],
            ['isResponsive', 'Responsive'],
            ['mainColor', 'Color'],
            ['referralFunction', 'Referral Function'],
            ['mobileRedirect', 'Mobile Redirect'],
            ['dynamicFooter', 'Meta Feature'],
            ['referredIconMenu', 'Menu Icon'],
            ['hasPopup', 'Has Popup'],
            ['referredWL', 'Referred WL'],
            ['closedMail', 'Closed Mail'],
            ['securityQuestion', 'Security Question'],
            //['servers', 'Server'],
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
                //log(list.toString());
                list.forEach((r, index) => log('%s.%s', index + 1, r));
              }
              storeWLs.loadData(data);
              featureGrouping.collapseAll();
            } else storeWLs.setGroupField(undefined);
          },
        },
      },
      {
        xtype: 'button',
        tooltip: 'Expand all group',
        iconCls: 'expandCls',
        cls: 'expandCls',
        handler: (btn) => {
          let cls = btn.cls;
          if (cls === 'expandCls') {
            btn.setIconCls('collapseCls');
            btn.cls = 'collapseCls';
            featureGrouping.expandAll();
          } else {
            btn.setIconCls('expandCls');
            btn.cls = 'expandCls';
            featureGrouping.collapseAll();
          }
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
        text: '',
        id: 'btnFind',
        icon: 'https://icons.iconarchive.com/icons/zerode/plump/16/Search-icon.png',
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
        xtype: 'combo',
        width: 115,
        store: new Ext.data.ArrayStore({
          fields: ['id', 'name'],
          data: [
            ['default', 'Select Col'],
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
        name: 'cbbColumn',
        id: 'cbbColumn',
        value: 'default',
        editable: false,
      },
      {
        xtype: 'numberfield',
        id: 'txtStartIndex',
        value: 0,
        width: 40,
        hideTrigger: true,
        listeners: {
          focus: function (tf, e) {
            tf.setValue('');
          },
        },
      },
      {
        xtype: 'numberfield',
        width: 40,
        id: 'txtEndIndex',
        value: 0,
        hideTrigger: true,
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
        text: 'Open',
        icon: 'https://icons.iconarchive.com/icons/icons8/windows-8/16/Programming-External-Link-icon.png',
        handler: () => {
          let startIndex = +Ext.getCmp('txtStartIndex').getValue() - 1,
            endIndex = +Ext.getCmp('txtEndIndex').getValue() - 1;
          for (let i = startIndex; i <= endIndex; i++) {
            let record = storeWLs.getAt(i),
              defaultDomain = record.get('defaultDomain') || undefined,
              name = record.get('name'),
              siteType = Ext.getCmp('cbbSiteType').getValue();
            if (!defaultDomain) defaultDomain = name + '.com';
            defaultDomain =
              siteType === 'member' ? defaultDomain : siteType + defaultDomain;
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
              default:
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
        text: 'BORDER PX1',
        dock: 'right',
        icon: 'https://icons.iconarchive.com/icons/shlyapnikova/toolbar-2/32/brick-wall-icon.png',
        listeners: {
          click: () => authForm.setHidden(false),
        },
      },
      {
        xtype: 'button',
        id: 'btnSyncAllDomain',
        text: 'Sync Domains',
        dock: 'right',
        iconCls: 'syncDomainCls',
        disabled: true,
        hidden: true,
        listeners: {
          click: (btn) => {
            btn.setIconCls('spinner');
            btn.setDisabled(true);
            let cm = Ext.getCmp('gridWLs').getColumns()[21];
            cm.setHidden(false);
            syncDomainsAllWLs(0, storeWLs, () => {
              btn.setIconCls('syncDomainCls');
              setTimeout(() => {
                alert(
                  'Sync domain ' +
                    getDomainType() +
                    ' of ' +
                    getSiteTypeName() +
                    ' site done !'
                );
                btn.setDisabled(false);
                let store = Ext.getCmp('gridWLs').getStore();
                for (let i = 0; i < store.getCount(); i++)
                  store.getAt(i).set({
                    isSyncedDomain: false,
                  });
                cm.setHidden(true);
              }, 1000);
            });
          },
        },
      },
      {
        xtype: 'button',
        id: 'btnCheckDomains',
        text: 'Check Domains',
        dock: 'right',
        iconCls: 'folderCls',
        listeners: {
          click: (btn) => {
            btn.setIconCls('spinner');
            fetchFolderAllWLs(2, storeWLs, () => btn.setIconCls('folderCls'));
          },
        },
        hidden: true,
      },
      '->',
      {
        xtype: 'button',
        id: 'btnHelp',
        text: 'Help',
        iconCls: 'helpCls',
        handler: () => {
          let encryptedLink =
            'U2FsdGVkX1+bpGWuQ3YhYFNhhllVIzDLoO/u3BLYh9Dtv8oQ5pgq9Q5HCubPDdILXNmj+FAfnkt6HelkG50ouFF0mpEyR5gkZb4ryZvdn33T75UJefl5t74+EySU6ORA/x6E+7IgoTfHIlO5QPDCMQtDgO2BtHUJp0VmdCtcEDQ=';
          window.open(
            CryptoJS.AES.decrypt(encryptedLink, location.hostname).toString(
              CryptoJS.enc.Utf8
            )
          );
        },
      },
      {
        xtype: 'button',
        id: 'btnHelp',
        text: 'Help',
        iconCls: 'helpCls',
        handler: () => {
          let encryptedLink =
            'U2FsdGVkX1+bpGWuQ3YhYFNhhllVIzDLoO/u3BLYh9Dtv8oQ5pgq9Q5HCubPDdILXNmj+FAfnkt6HelkG50ouFF0mpEyR5gkZb4ryZvdn33T75UJefl5t74+EySU6ORA/x6E+7IgoTfHIlO5QPDCMQtDgO2BtHUJp0VmdCtcEDQ=';
          window.open(
            CryptoJS.AES.decrypt(encryptedLink, location.hostname).toString(
              CryptoJS.enc.Utf8
            )
          );
        },
      },
      {
        xtype: 'button',
        id: 'btnSwitchExtjsVesion',
        text: 'Switch Extjs ',
        dock: 'right',
        iconCls: 'extjsVersion7',
        iconAlign: 'right',
        handler: () => {
          if (location.href.indexOf('7.html') === -1) location.href = '7.html';
          else location.href = '/6.html';
        },
      },
      {
        xtype: 'button',
        id: 'btnLogout',
        icon: 'https://icons.iconarchive.com/icons/saki/nuoveXT-2/16/Apps-session-logout-icon.png',
        text: 'Logout',
        dock: 'right',
        //width: 100,
        listeners: {
          click: () => {
            let logoutButton = Ext.getCmp('btnLogout');
            logoutButton.setIconCls('spinner');
            localStorage.removeItem('border-px1-api-cookie');
            //document.cookie = 'border-px1-api=';
            //saveBorderPx1ApiCookie('logout');
            setTimeout(() => location.reload(), 1000);
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
        editor: {
          field: {
            xtype: 'textfield',
            allowBlank: false,
          },
        },
        renderer: (val, _, record) => {
          let defaultDomain = record.get('defaultDomain'),
            dynamicFooter = record.get('dynamicFooter') ? '🦶' : '';
          let mobileRedirect = '';
          if (
            record.get('mobileRedirect') === false &&
            record.get('mobileRedirectIP') === undefined &&
            record.get('mobileRedirectName') === undefined
          )
            mobileRedirect = '📵';
          if (record.get('mobileRedirect') === true) mobileRedirect = '';
          if (
            record.get('mobileRedirect') === false &&
            record.get('mobileRedirectIP') === true &&
            record.get('mobileRedirectName') === false
          )
            mobileRedirect = '📵(NA)';
          if (
            record.get('mobileRedirect') === false &&
            record.get('mobileRedirectIP') === false &&
            record.get('mobileRedirectName') === true
          )
            mobileRedirect = '📵(IP)';

          let securityQuestion = record.get('securityQuestion') ? '🔒' : '',
            machineKey = record.get('machineKey') === 'Machine Key' ? '🔑' : '',
            status = record.get('status'),
            protocol = Ext.getCmp('cbbProtocol').getValue(),
            siteType = Ext.getCmp('cbbSiteType').getValue();
          if (!defaultDomain) defaultDomain = val + '.com';
          defaultDomain =
            siteType === 'member' ? defaultDomain : siteType + defaultDomain;
          if (status === 'testing') {
            defaultDomain =
              val +
              (siteType === 'member' ? 'main.' : siteType) +
              'playliga.com';
            protocol = 'http';
          }
          let oldNames = '';
          // reverse oldNames - must use slice(0) to overwirte memory array oldNames in Ext Store
          for (let name of record.get('oldNames').slice(0).reverse())
            oldNames +=
              '<del style="color:#fb4848; font-style:italic">' +
              name +
              '</del><br/>';
          //log('defaultDomain: %s', defaultDomain);
          return (
            Ext.String.format(
              '<a target="_blank" href="{0}://{1}">{2}</a> {3} {4} {5} {6} {7}<br />',
              protocol,
              defaultDomain.toLowerCase(),
              val,
              mobileRedirect,
              dynamicFooter,
              securityQuestion,
              machineKey
            ) + oldNames
          );
        },
      },
      {
        text: 'CT',
        width: 50,
        dataIndex: 'compType',
        tooltip: 'Comptype',
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
      // {
      //   text: 'panel',
      //   width: 150,
      //   dataIndex: 'defaultDomain',
      //   hidden: true,
      //   renderer: (v, _, r) =>
      //     Ext.String.format(
      //       '<a target="_blank" href="https://{0}">{0}</a>',
      //       v ? v : r.get('name').toLowerCase() + '.com' + '/_Bet/Panel.aspx'
      //     ),
      // },
      // {
      //   text: 'Robots',
      //   width: 150,
      //   dataIndex: 'defaultDomain',
      //   hidden: true,
      //   renderer: (v, _, r) =>
      //     Ext.String.format(
      //       '<a target="_blank" href="https://{0}">{0}</a>',
      //       (v ? v : r.get('name').toLowerCase() + '.com') + '/robots.txt'
      //     ),
      // },
      // {
      //   text: 'Sitemap',
      //   width: 150,
      //   dataIndex: 'defaultDomain',
      //   hidden: true,
      //   renderer: (v, _, r) =>
      //     Ext.String.format(
      //       '<a target="_blank" href="https://{0}">{0}</a>',
      //       v ? v : r.get('name').toLowerCase() + '.com' + '/sitemap.xml'
      //     ),
      // },
      // {
      //   text: 'Google',
      //   width: 150,
      //   dataIndex: 'defaultDomain',
      //   hidden: true,
      //   renderer: (v, _, r) =>
      //     Ext.String.format(
      //       '<a target="_blank" href="https://{0}">{0}</a>',
      //       v
      //         ? v
      //         : r.get('name').toLowerCase() +
      //             '.com' +
      //             '/googleae669996542f22e8.html'
      //     ),
      // },
      {
        text: 'Refered WL',
        width: 150,
        dataIndex: 'referredWL',
        tooltip: 'Refered WL(css, header layout...)',
        hidden: true,
      },
      {
        text: 'Main Color',
        width: 150,
        dataIndex: 'mainColor',
        hidden: true,
      },
      // {
      //   text: 'Servers',
      //   width: 120,
      //   dataIndex: 'servers',
      //   hidden: true,
      // },
      {
        text: 'Server Pool',
        width: 190,
        dataIndex: 'serverPoolIPs',
        hidden: false,
      },
      {
        text: 'H/D Number',
        width: 140,
        dataIndex: 'headerNumber',
        tooltip: 'Header/Default number',
        renderer: (val, _, record) => val + '/' + record.get('defaultNumber'),
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
        hidden: true,
      },
      {
        text: 'Referral Feature',
        width: 130,
        dataIndex: 'referralFunction',
        hidden: true,
      },
      {
        xtype: 'actioncolumn',
        width: 30,
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
              fetchBackendId(record, (backendId) =>
                backendId
                  ? window.open(
                      genUrl(record) +
                        '/' +
                        getSelectedPage() +
                        '?bpx-backend-id' +
                        backendId,
                      '_blank'
                    )
                  : null
              );
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
        text: 'Meta Feature (🦶)',
        width: 50,
        dataIndex: 'dynamicFooter',
        renderer: (value) => (value ? '✅' : '❌'),
        hidden: true,
      },

      // {
      //   text: '🔒',
      //   width: 50,
      //   dataIndex: 'securityQuestion',
      //   renderer: (value) => (value ? '✅' : '❌'),
      //   hidden: true,
      // },
      // {
      //   text: '✉',
      //   width: 50,
      //   dataIndex: 'closedMail',
      //   renderer: (value) => (!value ? '✉' : '❌'),
      //   hidden: true,
      // },
      // {
      //   text: '▶',
      //   tooltip: 'Has Playtech',
      //   width: 50,
      //   dataIndex: 'closedPlaytech',
      //   renderer: (value) => (!value ? '▶' : '❌'),
      //   hidden: true,
      // },

      // {
      //   xtype: 'actioncolumn',
      //   width: 30,
      //   tooltip: 'Open Remote Desktop Connection',
      //   text: 'R',
      //   dataIndex: 'servers',
      //   hidden: true,
      //   items: [
      //     {
      //       getClass: function (value, meta, record, rowIndex, colIndex) {
      //         var isSpinning = record.get('remoteDesktopSpinner');
      //         return isSpinning ? 'spinner' : 'remoteDesktop';
      //       },
      //       handler: function (grid, rowIndex, colIndex, item, e, record) {
      //         rowIndex = grid.getStore().indexOf(record);
      //         record = grid.getStore().getAt(rowIndex);
      //         var ip = record.get('specificServer');
      //         record.set('remoteDesktopSpinner', true);
      //         Ext.Ajax.request({
      //           method: 'GET',
      //           url: remoteDesktopServiceUrl + ip.replace('192.', '10.'),
      //           success: function (response) {
      //             record.set('remoteDesktopSpinner', false);
      //           },
      //           failure: function (response) {
      //             Ext.Msg.alert(
      //               "Remote Desktop Cli Service doesn't start",
      //               `Run Remote Desktop Service by cmd:<br/><code>cd liga<br/>node rdservice</code>`
      //             );
      //             record.set('remoteDesktopSpinner', false);
      //           },
      //         });
      //       },
      //     },
      //   ],
      // },
      // {
      //   xtype: 'actioncolumn',
      //   width: 40,
      //   tooltip: 'Sync Domains',
      //   text: 'SD',
      //   dataIndex: 'isSyncedDomain',
      //   hidden: true,
      //   items: [
      //     {
      //       getClass: function (value, meta, record, rowIndex, colIndex) {
      //         var iconCls = '';
      //         switch (value) {
      //           case false:
      //             iconCls = 'checkCls';
      //             break;
      //           case 'spinner':
      //             iconCls = 'spinner';
      //             break;
      //           case 'checkKoCls':
      //             iconCls = 'checkKoCls';
      //             break;
      //           default:
      //             iconCls = 'checkOkCls';
      //             break;
      //         }
      //         return iconCls;
      //       },
      //       handler: function (grid, rowIndex, colIndex, item, e, record) {
      //         rowIndex = grid.getStore().indexOf(record);
      //         record = grid.getStore().getAt(rowIndex);
      //         var name = record.get('name');
      //         syncDomainsOneWhiteLabel(name, record, (success) =>
      //           record.set(
      //             'isSyncedDomain',
      //             success ? 'checkOkCls' : 'checkKoCls'
      //           )
      //         );
      //       },
      //     },
      //   ],
      // },
    ],
  });
});

function syncDomainsOneWhiteLabel(whiteLabelName, record, callback) {
  let siteTypeName = getSiteTypeName(),
    siteTypeValue = getSiteTypeValue(),
    domainType = getDomainType(),
    cacheName = whiteLabelName + '_' + domainType + '_' + siteTypeName,
    siteName = siteTypeValue + whiteLabelName.toLowerCase() + '.bpx';
  record.set('isSyncedDomain', 'spinner');
  Ext.Ajax.request({
    method: 'GET',
    withCredentials: true,
    url: borderPx1ApiHost + '/info/domain/' + domainType + '/' + siteName,
    success: function (response) {
      let result = JSON.parse(response.responseText);
      let success = result.success;
      if (success) localStorage.setItem(cacheName, result.domains);
      else log(response.responseText);
      callback(success);
    },
    failure: function (response) {
      log(response);
      callback(false);
    },
  });
}
function syncDomainsAllWLs(index, store, callback) {
  let record = store.getAt(index);
  var name = record.get('name');
  syncDomainsOneWhiteLabel(name, record, (success) => {
    record.set('isSyncedDomain', success ? 'checkOkCls' : 'checkKoCls');
    if (++index < store.getCount()) syncDomainsAllWLs(index, store, callback);
    else callback(success);
  });
}
function genUrl(record) {
  let defaultDomain = record.get('defaultDomain'),
    status = record.get('status'),
    protocol = Ext.getCmp('cbbProtocol').getValue(),
    siteType = Ext.getCmp('cbbSiteType').getValue(),
    whiteLabelName = record.get('name');
  if (!defaultDomain) defaultDomain = whiteLabelName + '.com';
  defaultDomain =
    siteType === 'member' ? defaultDomain : siteType + defaultDomain;
  if (status === 'testing') {
    defaultDomain =
      whiteLabelName +
      (siteType === 'member' ? 'main.' : siteType) +
      'playliga.com';
    protocol = 'http';
  }
  let url = protocol + '://' + defaultDomain.toLowerCase();
  return url;
}
function fetchFolderOneRecord(record, callback) {
  if (record.get('folderPath') !== '') return;
  record.set('folderPath', ' ');
  var url = genUrl(record);
  Ext.Ajax.request({
    url: borderPx1ApiHost + '/info/folder?' + new URLSearchParams({ url }),
    success: function (response) {
      var result = JSON.parse(response.responseText.replace(/\\/g, '\\\\'));
      if (result.success) {
        record.set('folderPath', result.path.replace(/\//g, '\\'));
        let info = result.modifiedDateOfBKFile.split('-');
        let sizeOfBKFile = new Intl.NumberFormat().format(~~(info[1] / 1024));
        record.set('backupDate', info[0] + ' - ' + sizeOfBKFile + ' KB');
      } else {
        record.set('folderPath', result.msg);
        record.set('backupDate', result.msg);
      }
      callback(result.success);
    },
    failure: function (response) {
      log('server-side failure with status code ' + response.status);
      record.set('folderPath', 'failure...');
      record.set('backupDate', 'failure...');
      callback(false);
    },
  });
}

// Safe slowly one by one
function fetchFolderAllWLs(index, store, callback) {
  let record = store.getAt(index);
  record.set('isSyncedFolder', 'spinner');
  fetchFolderOneRecord(record, (success) => {
    record.set('isSyncedFolder', success ? 'checkOkCls' : 'checkKoCls');
    if (++index < store.getCount()) fetchFolderAllWLs(index, store, callback);
    else callback();
  });
}

function fetchBackendId(record, callback) {
  try {
    var ip = record.get('specificServer');
    record.set('specificServerSpinner', true);
    let domainType = getDomainType();
    Ext.Ajax.request({
      method: 'POST',
      url: borderPx1ApiHost + '/info/backendId/' + domainType + '/' + ip,
      headers: {
        Authorization: 'Basic ' + localStorage.getItem(cookieKey),
      },
      success: function (response) {
        record.set('specificServerSpinner', false);
        let result = JSON.parse(response.responseText);
        if (result.success) callback(result.backendId);
        else {
          if (
            result.message.indexOf('Invalid URI "/api/domainEdit/token') >
            -1
          )
            Ext.Msg.alert(
              result.message,
              `Please login <b>BORDER PX1</b> site<br/>`
            );
          else alert(result.message);
          callback();
        }
      },
      failure: function (response) {
        alert(JSON.stringify(response));
      },
    });
  } catch (error) {
    callback();
  }
}

function showDomainGridDataByWhitelabel({whiteLabelName, domainType, useDomainTypeFromPX1})
{
  let domainGrid = Ext.getCmp('domainGrid'),
    domainStore = domainGrid.getStore(),
    siteTypeValue = getSiteTypeValue(),
    siteTypeName = getSiteTypeName(),
    cacheName = whiteLabelName + '_' + domainType + '_' + siteTypeName,
    siteName = siteTypeValue + whiteLabelName.toLowerCase() + '.bpx';

  domainGrid.show();
  domainGrid.setTitle('🌍 ' + whiteLabelName + "'s Domains");
  Ext.getCmp('txtNameWLsDomain').setRawValue(whiteLabelName)
  Ext.getCmp('cbbDomainType').setRawValue(domainType.toUpperCase())
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
          e['specificServer'] = selectedSpecificServer;
          e['servers'] = selectedServers;
          return e;
        })
      );
      Ext.getCmp('btnCheckDomain').fireEvent('click');
      fetchWhitelabelServers(domainStore);
    }
    else {
      // Ext.Msg.alert(
      //   'Caution',
      //   'Cache data of <b>' +
      //     whiteLabelName +
      //     "</b>'s domain doesn't exist<br/> Please uncheck <b>Load From Cache</b> checkbox"
      // );
      //Ext.getCmp('ckbLoadFromCache').setValue(false)
      //Ext.getCmp('btnFindDomain').fireEvent('click');
      loadDomainStoreFromUrl({domainStore, domainType, cacheName, siteName, useDomainTypeFromPX1})
     }
  } 
  else
    loadDomainStoreFromUrl({domainStore, domainType, cacheName, siteName, useDomainTypeFromPX1})
}

function loadDomainStoreFromUrl({domainStore, domainType, cacheName, siteName, useDomainTypeFromPX1})
{
  let proxy = domainStore.getProxy();
    domainType = useDomainTypeFromPX1 ?
      (Ext.getCmp('cbbBorderPx1Url').getValue().indexOf('22365') > -1
        ? 'ip'
        : 'name'): domainType;
    proxy.setConfig('url', [
      borderPx1ApiHost + '/info/domain/' + domainType + '/' + siteName,
    ]);
    //proxy.setConfig('withCredentials', [true]);
    let cookieKey =
      domainType === 'ip'
        ? 'border-px1-cookie-ip'
        : 'border-px1-cookie';
    proxy.setHeaders({
      Authorization: 'Basic ' + localStorage.getItem(cookieKey),
    });
    
    // show loadMask purpose
    domainStore.load({
      callback: function (records, operation, success) {
        try {
          let response = operation.getResponse()
          // only available for Extjs 6.0
          if(response.responseText){
            let result = JSON.parse(response.responseText);
            if (!result.success) {
              if (
                result.message.indexOf(
                  "Cannot read property 'id' of undefined"
                ) > -1
              )
                Ext.Msg.alert(result.message, 'NO DATA');
              else {
                authForm.setHidden(false)
                // Ext.Msg.alert(
                //   result.message,
                //   `Please login <b>BORDER PX1</b> site<br/>
                //   OR <br/>
                //   Check to <b>Load From Cache</b> then close popup and open again`
                // );
              }
              // extjs 6 domain is raw json text
            } else localStorage.setItem(cacheName, JSON.stringify(result.domains));
          }
          else{
            if(!response.responseJson.success){
              if(response.responseJson.message === 'White label not found')
                Ext.Msg.alert(response.responseJson.message,);
              else authForm.setHidden(false)
            }
            else
            // extjs 9 domain is descrypted json
            
            localStorage.setItem(cacheName, CryptoJS.AES.encrypt(
              JSON.stringify(response.responseJson.domains),
              'The domain data'
            ).toString());
          }
        } catch (error) {
          log(error);
          //Ext.getCmp('btnAuthenticate').fireEvent('click');
        }
      },
    });
}
