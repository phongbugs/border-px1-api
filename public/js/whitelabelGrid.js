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
        Authorization: 'Basic ' + localStorage.getItem('token'),
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
          record['zipUpload'] = '';
          record['checked'] = 0;
          record['batUpload'] = 0;
          data.push(record);
        } catch (error) {
          log(whitelabelName);
          log(error);
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
          let isShowDomainGrid = true;
          handleDomainStoreAndGrid({ isShowDomainGrid, record });
        }
      },
      viewready: (grid) => {
        loadScript('js/authForm.js?v=' + currentVersion());
        loadScript('js/domainGrid.js?v=' + currentVersion());
        loadScript('js/deploymentForm.js?v=' + currentVersion());
        // if it's 6.2 it will show button 7.0
        if (location.href.indexOf('7.html') === -1)
          Ext.getCmp('btnSwitchExtjsVesion').setIconCls('extjsVersion7');
        else Ext.getCmp('btnSwitchExtjsVesion').setIconCls('extjsVersion6');
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
            storeWLs.loadData(
              data.map((e) => {
                e.checked = 0;
                e.folderPath = '';
                e.zipUpload = e.zipUpload === '' ? '' : 0;
                e.backupDate = '';
                e.isSyncedFolder = false;
                e.batUpload = 0;
                return e;
              })
            );
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
            ['dynamicFooter', 'Dynamic Footer'],
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
          change: (_, groupByValue) => {
            let columnUpload = Ext.getCmp('gridWLs').getColumns()[23];
            if (groupByValue !== 'default') {
              storeWLs.setGroupField(groupByValue);
              Groups = storeWLs.getGroups();
              log('Group By: %s', groupByValue);
              // ======= start show log group info =======
              for (let i = 0; i < Groups.getCount(); i++) {
                let group = Groups.getAt(i),
                  groupKey = Groups.getAt(i)._groupKey,
                  list = [];
                log('%s: ', groupKey);
                for (let j = 0; j < group.getCount(); j++) {
                  let whiteLabelName = group.getAt(j).getData().name;
                  list.push(whiteLabelName);
                  //  show icon upload
                  if (groupByValue === 'servers')
                    group.getAt(0).set('zipUpload', 0);
                  else group.getAt(0).set('zipUpload', '');
                }
                //log(list.toString());
                list.forEach((r, index) => log('%s.%s', index + 1, r));
              }

              if (groupByValue === 'servers') columnUpload.setHidden(false);
              else columnUpload.setHidden(true);
              // ======= end show log group info =======

              storeWLs.loadData(data);
              featureGrouping.collapseAll();
            } else {
              storeWLs.setGroupField(undefined);
              columnUpload.setHidden(true);
            }
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
        editable: true,
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
            endIndex = +Ext.getCmp('txtEndIndex').getValue() - 1,
            url = '',
            stopAtFirst = Ext.getCmp('ckbStopCheckAt1stValidDomain').getValue();
          for (let i = startIndex; i <= endIndex; i++) {
            let record = storeWLs.getAt(i);
            if (stopAtFirst) {
              findFirstValidDomain(
                { index: 0, record: record },
                ({ domain }) => {
                  log('valid domain of %s: %s', record.get('name'), domain);
                  if (domain) {
                    url = domain + '/' + getSelectedPage();
                    window.open(url, '_blank');
                  } else log('-> Cannot find any a valid domain');
                }
              );
            } else {
              let defaultDomain = record.get('defaultDomain') || undefined,
                name = record.get('name'),
                siteType = Ext.getCmp('cbbSiteType').getValue();
              if (!defaultDomain) defaultDomain = name + '.com';
              defaultDomain =
                siteType === 'member'
                  ? defaultDomain
                  : siteType + defaultDomain;
              url =
                getProtocol() + '://' + defaultDomain + '/' + getSelectedPage();
              window.open(url, '_blank');
            }
          }
        },
      },
      {
        xtype: 'button',
        text: 'Deployment',
        icon: 'https://icons.iconarchive.com/icons/custom-icon-design/pretty-office-3/16/web-management-icon.png',
        id: 'btnDeployment',
        listeners: {
          click: () => Ext.getCmp('deploymentForm').show(),
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
        id: 'btnSwitchExtjsVesion',
        text: 'Switch Extjs ',
        dock: 'right',
        iconCls: 'extjsVersion7',
        iconAlign: 'right',
        handler: () => {
          if (location.href.indexOf('7.html') === -1) location.href = '7.html';
          else location.href = '/';
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
            //localStorage.removeItem('token');
            document.cookie = 'border-px1-api=';
            saveBorderPx1ApiCookie('logout');
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
            allowBlank: true,
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
            protocol = getProtocol(),
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
        hidden: true,
      },
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
        text: 'Referral Function',
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
      {
        xtype: 'actioncolumn',
        width: 30,
        tooltip: 'Open Remote Desktop Connection',
        text: 'R',
        dataIndex: 'servers',
        hidden: true,
        items: [
          {
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var isSpinning = record.get('remoteDesktopSpinner');
              return isSpinning ? 'spinner' : 'remoteDesktop';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
              var ip = record.get('specificServer');
              record.set('remoteDesktopSpinner', true);
              Ext.Ajax.request({
                method: 'GET',
                url: remoteDesktopServiceUrl + ip.replace('192.', '10.'),
                success: function (response) {
                  record.set('remoteDesktopSpinner', false);
                },
                failure: function (response) {
                  Ext.Msg.alert(
                    "Remote Desktop Cli Service doesn't start",
                    `Run Remote Desktop Service by cmd:<br/><code>cd liga<br/>node rdservice</code>`
                  );
                  record.set('remoteDesktopSpinner', false);
                },
              });
            },
          },
        ],
      },
      {
        xtype: 'actioncolumn',
        width: 40,
        tooltip: 'Sync Domains',
        text: 'SD',
        dataIndex: 'isSyncedDomain',
        hidden: true,
        items: [
          {
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var iconCls = '';
              switch (value) {
                case false:
                  iconCls = 'checkCls';
                  break;
                case 'spinner':
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
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
              var name = record.get('name');
              syncDomainsOneWhiteLabel(name, record, (success) =>
                record.set(
                  'isSyncedDomain',
                  success ? 'checkOkCls' : 'checkKoCls'
                )
              );
            },
          },
        ],
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        tooltip: 'Sync Folders',
        text: 'F',
        dataIndex: 'isSyncedFolder',
        hidden: false,
        items: [
          {
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var iconCls = '';
              switch (value) {
                case 'spinner':
                  iconCls = 'spinner';
                  break;
                case 'checkKoCls':
                  iconCls = 'checkKoCls';
                  break;
                case false:
                  iconCls = 'folderCls';
                  break;
                default:
                  iconCls = 'folderOkCls';
                  break;
              }
              return iconCls;
            },
            handler: function (grid, rowIndex, colIndex, item, e, record, row) {
              if (!record.get('isSyncedFolder')) {
                rowIndex = grid.getStore().indexOf(record);
                record = grid.getStore().getAt(rowIndex);
                record.set('isSyncedFolder', 'spinner');
                //log(row.children[1].innerHTML);
                fetchFolderOneRecord(record, (success) =>
                  record.set(
                    'isSyncedFolder',
                    success ? 'folderOkCls' : 'checkKoCls'
                  )
                );
              }
            },
          },
        ],
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        tooltip: 'Upload zip file to server for deploying',
        sortable: false,
        menuDisabled: true,
        text: 'U',
        hidden: false,
        items: [
          {
            iconCls: 'zipUploadCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var iconCls = '';
              var zipUpload = record.get('zipUpload');
              switch (zipUpload) {
                case 0:
                  iconCls = 'zipUploadCls';
                  break;
                case 'spinner':
                  iconCls = 'spinner';
                  break;
                case 'ok':
                  iconCls = 'zipUploadedCls';
                  break;
                case 'error':
                  iconCls = 'zipUploadErrCls';
                  break;
                case 'empty':
                  iconCls = 'zipUploadEmptyCls';
                  break;
              }
              return iconCls;
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
              var action = record.get('zipUpload');
              if (action === 'error' || action === 'empty') return;
              if (!listFileFromLocal) {
                showUploadedFileInfo();
                return;
              }
              record.set('zipUpload', 'spinner');
              fetchBackendId(record, (backendId) => {
                Ext.Ajax.request({
                  method: 'POST',
                  url: 'deployment/upload-file-to-iis',
                  params: {
                    whitelabelUrl: genUrl(record),
                    uploadedFileName: Ext.getCmp(
                      'txtUploadedFileName'
                    ).getValue(),
                    action: action == 'ok' ? 'e' : 'u',
                    backendId: backendId,
                  },
                  success: function (response) {
                    var jsonR = JSON.parse(response.responseText);
                    if (jsonR.success)
                      record.set('zipUpload', action === 'ok' ? 'empty' : 'ok');
                    else {
                      record.set('zipUpload', 'error');
                      Ext.Msg.alert('Error Upload', jsonR.msg);
                    }
                  },
                  failure: function (response) {
                    log(
                      'server-side failure with status code ' + response.status
                    );
                    record.set('zipUpload', 'error');
                  },
                });
              });
            },
          },
        ],
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        sortable: false,
        menuDisabled: true,
        tooltip: 'Execute script deployment',
        text: 'E',
        items: [
          {
            iconCls: 'batUploadCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var iconCls = '';
              var batUpload = record.get('batUpload');
              switch (batUpload) {
                case 0:
                  iconCls = 'batUploadCls';
                  break;
                case 'spinner':
                  iconCls = 'spinner';
                  break;
                case 'ok':
                  iconCls = 'batUploadedCls';
                  break;
                case 'error':
                  iconCls = 'zipUploadErrCls';
                  break;
              }
              return iconCls;
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
              // prevent click after done
              if (
                record.get('batUpload') === 'ok' ||
                record.get('batUpload') === 'error'
              )
                return;
              if (!listFileFromLocal) {
                showUploadedFileInfo();
                return;
              }

              let stopAtFirst = getStopAtFirst();
              if (stopAtFirst) {
                record.set('batUpload', 'spinner');
                findFirstValidDomain(
                  { index: 0, record: record },
                  ({ domain, folderPath }) => {
                    if (domain) {
                      deployOneWhitelabel({
                        record,
                        rowIndex,
                        domain,
                        folderPath,
                      });
                    } else {
                      record.set('batUpload', 'error');
                      record.set(
                        'folderPath',
                        'Cannot find any a valid domain'
                      );
                    }
                  }
                );
              } else {
                var folderPath = record.get('folderPath');
                if (folderPath === '') {
                  Ext.Msg.alert('Miss params', 'Folder path not exist');
                  return;
                }
                deployOneWhitelabel({ record, rowIndex, folderPath });
              }
            },
          },
        ],
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        sortable: false,
        tooltip: 'Check latest deployed and bakup files',
        menuDisabled: true,
        text: 'Check',
        items: [
          {
            iconCls: 'checkFileCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var checked = record.get('checked');
              var iconCls = '';
              switch (checked) {
                case 0:
                  iconCls = 'checkFileCls';
                  break;
                case 'spinner':
                  iconCls = 'spinner';
                  break;
                case 'ok':
                  iconCls = 'checkOkCls';
                  break;
                case 'error':
                  iconCls = 'checkKoCls';
                  break;
              }
              return iconCls;
            },
            handler: function (grid, rowIndex, colIndex, item, e, record, row) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
              if (record.get('checked') === 'ok') return;
              if (record.get('checked') === 'error') {
                alert(JSON.stringify(listFailedFile[rowIndex]));
                return;
              }
              if (!listFileFromLocal) {
                showUploadedFileInfo();
                return;
              }
              let status = record.get('status');
              if (status === 'testing')
                checkFilesOneRecord({ record, rowIndex });
              else {
                let stopAtFirst = getStopAtFirst();
                // ================ method 1 use "check one" icon ================
                // if (stopAtFirst) {
                //   record.set('checked', 'spinner');
                //   find1stValidDomain(record, (domain) => {
                //     log('find1stValidDomain(record):', domain);
                //     let url =
                //       Ext.getCmp('cbbProtocol').getValue() + '://' + domain;
                //     checkFilesOneRecord({ record, rowIndex, url });
                //   });
                // } else checkFilesOneRecord({ record, rowIndex });

                // ================ method 2 use for "check all" button ===================
                if (stopAtFirst) {
                  record.set('checked', 'spinner');
                  findFirstValidDomain(
                    { index: 0, record: record },
                    ({ domain }) => {
                      log('valid domain of %s: %s', record.get('name'), domain);
                      let url = domain;
                      if (domain)
                        checkFilesOneRecord({ record, rowIndex, url });
                      else {
                        record.set('checked', 'error');
                        record.set(
                          'folderPath',
                          'Cannot find any a valid domain'
                        );
                      }
                    }
                  );
                } else checkFilesOneRecord({ record, rowIndex });
              }
            },
          },
        ],
      },
      {
        text: 'Folder',
        tooltip: 'Folder Path',
        width: 300,
        dataIndex: 'folderPath',
        hidden: false,
      },
      {
        text: 'Backup Date',
        tooltip: 'Backup Date',
        width: 222,
        dataIndex: 'backupDate',
        hidden: false,
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        sortable: false,
        menuDisabled: true,
        tooltip: 'Refresh row',
        text: 'Refresh',
        items: [
          {
            iconCls: 'refreshCls',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
              record.set({
                checked: 0,
                folderPath: '',
                zipUpload: record.get('zipUpload') === '' ? '' : 0,
                backupDate: '',
                isSyncedFolder: false,
                batUpload: 0,
              });
            },
          },
        ],
      },
    ],
    viewConfig: {
      getRowClass: function (record, index, rowParams) {
        return record.get('status') !== 'live' ? 'hasStatus' : '';
      },
    },
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
    protocol = getProtocol(),
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
    //protocol = 'http';
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
function checkFilesOneRecord({ record, rowIndex, url }, callback) {
  record.set('checked', 'spinner');
  Ext.Ajax.request({
    method: 'POST',
    url: borderPx1ApiHost + '/deployment/date-modified-files',
    params: {
      listFile: listFileFromLocal.map((file) => file.fileName).toString(),
      whitelabelUrl: url ? url : genUrl(record),
    },
    success: function (response) {
      var data = response.responseText.replace(/\\/g, '\\\\');
      data = JSON.parse(data);
      if (!data.success) {
        if (!data.files && data.msg) {
          record.set('backupDate', data.msg);
          record.set('folderPath', data.msg);
        }
        record.set('checked', 'error');
        if (callback) callback();
        return;
      }
      let listFileFromServer = data.files;
      var result = compare2Json(listFileFromServer, listFileFromLocal);
      if (result.success) {
        record.set('checked', 'ok');
        if (data.path.indexOf('Could not find file') != -1)
          record.set('backupDate', data.path.replace(/\//g, '\\'));
        else record.set('folderPath', data.path.replace(/\//g, '\\'));
      } else {
        record.set('checked', 'error');
        record.set('folderPath', data.path.replace(/\//g, '\\'));
        listFailedFile[rowIndex] = result;
      }
      if (data.modifiedDateOfBKFile) {
        var fileInfo = data.modifiedDateOfBKFile.split('-');
        var sizeOfFile = new Intl.NumberFormat().format(~~(fileInfo[1] / 1024));
        record.set('backupDate', fileInfo[0] + ' - ' + sizeOfFile + ' KB');
      }
      if (callback) callback();
    },
    failure: function (response) {
      log('server-side failure with status code ' + response.status);
      record.set('checked', 'error');
      if (callback) callback();
    },
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
      withCredentials: true,
      success: function (response) {
        record.set('specificServerSpinner', false);
        let result = JSON.parse(response.responseText);
        if (result.success) callback(result.backendId);
        else {
          if (result.message.indexOf('Invalid URI "/api/domainEdit/token') > -1)
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
function showUploadedFileInfo() {
  Ext.Msg.alert('Information', 'Zip file has not been uploaded yet');
}

function handleDomainStoreAndGrid({ record, isShowDomainGrid }, callback) {
  // send to grid domain two columns by golbal variables
  selectedWhiteLabelName = record.get('name');
  selectedSpecificServer = record.get('specificServer');
  selectedServers = record.get('servers');
  let domainGrid = Ext.getCmp('domainGrid'),
    domainStore = domainGrid.getStore(),
    siteTypeValue = getSiteTypeValue(),
    whiteLabelName = record.get('name'),
    siteTypeName = getSiteTypeName(),
    domainType = getDomainType(),
    cacheName = whiteLabelName + '_' + domainType + '_' + siteTypeName,
    siteName = siteTypeValue + whiteLabelName.toLowerCase() + '.bpx';

  if (isShowDomainGrid) domainGrid.show();
  domainGrid.setTitle('🌍 ' + whiteLabelName + "'s Domains");
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
      if (!callback) {
        Ext.getCmp('btnCheckDomain').fireEvent('click');
        fetchWhitelabelServers(domainStore);
      } else callback(domainStore);
    } else
      Ext.Msg.alert(
        'Caution',
        'Cache data of <b>' +
          whiteLabelName +
          "</b>'s domain doesn't exist<br/> Please uncheck <b>Load From Cache</b> checkbox"
      );
    if (callback) callback();
  } else {
    let proxy = domainStore.getProxy();
    let domainType =
      Ext.getCmp('cbbBorderPx1Url').getValue().indexOf('22365') > -1
        ? 'ip'
        : 'name';
    proxy.setConfig('url', [
      borderPx1ApiHost + '/info/domain/' + domainType + '/' + siteName,
    ]);
    proxy.setConfig('withCredentials', [true]);
    // show loadMask purpose
    domainStore.load({
      callback: function (records, operation, success) {
        try {
          let result = JSON.parse(operation.getResponse().responseText);
          if (!result.success) {
            if (
              result.message.indexOf("Cannot read property 'id' of undefined") >
              -1
            )
              Ext.Msg.alert(result.message, 'NO DATA');
            else
              Ext.Msg.alert(
                result.message,
                `Please login <b>BORDER PX1</b> site<br/>
              OR <br/>
              Check to <b>Load From Cache</b> then close popup and open again`
              );
          } else localStorage.setItem(cacheName, result.domains);
          if (callback) callback();
        } catch (error) {
          log(error);
        }
      },
    });
  }
}

function find1stValidDomain(record, callback) {
  return handleDomainStoreAndGrid({ record }, (domainStore) => {
    return checkDomainAllGridSlow(0, domainStore, true, (domain) =>
      callback(domain)
    );
  });
}
function findFirstValidDomain({ index, record, domains }, callback) {
  if (!domains)
    fetchDomainsBySiteName(record, (domains) => {
      isValidDomain(domains[index], ({ isValid, path }) => {
        if (isValid)
          callback({
            domain: getProtocol() + '://' + domains[index],
            folderPath: path.replace(/\//g, '\\'),
          });
        else if (++index > domains.length) callback({ domain: null });
        else findFirstValidDomain({ index, record, domains }, callback);
      });
    });
  else {
    // don't fetch domain again
    isValidDomain(domains[index], ({ isValid, path }) => {
      if (isValid)
        callback({
          domain: getProtocol() + '://' + domains[index],
          folderPath: path.replace(/\//g, '\\'),
        });
      else if (++index > domains.length) callback({ domain: null });
      else findFirstValidDomain({ index, record, domains }, callback);
    });
  }
}
function findFirstValidDomainGlobal(
  { whitelabelName, client, domainType },
  callback
) {
  fetchGlobalValidDomainByWhitelabelName(
    { whitelabelName, client, domainType },
    (domain) => {
      isValidDomain(domain, ({ isValid, path }) => {
        if (isValid)
          callback({
            domain: getProtocol() + '://' + domain,
            folderPath: path.replace(/\//g, '\\'),
          });
        else
          callback({
            domain: null,
            folderPath: null,
          });
      });
    }
  );
}
function fetchGlobalValidDomainByWhitelabelName(
  { whitelabelName, client, domainType },
  callback
) {
  Ext.Ajax.request({
    method: 'GET',
    url:
      borderPx1ApiHost +
      '/info/valid-domain-3rdp/' +
      client +
      '/' +
      domainType +
      '/' +
      whitelabelName,
    success: function (response) {
      let result = JSON.parse(response.responseText);
      log(result);
      if (result.success) callback(result.domain);
      else callback(null);
    },
    failure: function (response) {
      log(
        'fetchGlobalValidDomainByWhitelabelName failure with status code ' +
          response.status
      );
      callback(null);
    },
  });
}

function fetchDomainsBySiteName(record, callback) {
  let siteTypeValue = getSiteTypeValue(),
    whiteLabelName = record.get('name'),
    domainType = getDomainType(),
    siteName = siteTypeValue + whiteLabelName.toLowerCase() + '.bpx';
  Ext.Ajax.request({
    method: 'GET',
    withCredentials: true,
    url: borderPx1ApiHost + '/info/domain/' + domainType + '/' + siteName,
    success: function (response) {
      let result = JSON.parse(response.responseText);
      if (result.success) {
        let domains = JSON.parse(
          CryptoJS.AES.decrypt(result.domains, 'The domain data').toString(
            CryptoJS.enc.Utf8
          )
        ).map((e) => e.Domain);
        log(domains);
        callback(domains);
      } else callback([]);
    },
    failure: function (response) {
      log('server-side failure with status code ' + response.status);
      callback([]);
    },
  });
}

function isValidDomain(domain, callback) {
  let siteType = getSiteTypeName();
  domain = encodeURIComponent(getProtocol() + '://' + domain);
  let url =
    borderPx1ApiHost +
    '/info/' +
    (siteType === 'mobile' ? 'mobile' : 'folder') +
    '?' +
    new URLSearchParams({ url: domain });
  Ext.Ajax.request({
    url: url,
    success: (response) => {
      let result = JSON.parse(response.responseText);
      callback({ isValid: result.success, path: result.path });
    },
    failure: function (response) {
      log('isValidDomain: %s', response);
      callback(false);
    },
  });
}

function dzFileNameListGen(fileList, folderPath) {
  //D:\Web\Member\365AGEN\
  folderPath = folderPath.substring(14, folderPath.length).replace(/\\/g, '/');
  var strFileList = '';
  for (var i = 0; i < fileList.length; i++) {
    strFileList += folderPath + fileList[i].fileName + '\r\n';
  }
  strFileList += folderPath + 'Web.config\r\n';
  return strFileList;
}

function getSelectedPage() {
  let columnName = Ext.getCmp('cbbColumn').getValue();
  switch (columnName) {
    case 'default':
    case 'defaultDomain':
      return '';
    default:
      return columnName;
  }
}

function getProtocol() {
  return Ext.getCmp('cbbProtocol').getValue();
}
function getStopAtFirst() {
  return Ext.getCmp('ckbStopCheckAt1stValidDomain').getValue();
}

function deployOneWhitelabel(
  { record, rowIndex, domain, folderPath },
  callback
) {
  fetchBackendId(record, (backendId) => {
    if (!backendId) {
      if (callback) callback();
      return;
    }
    // default new agent & member site
    // D:\Web\Member\KOKOBOLA\
    let bkFile = folderPath.substr(0, folderPath.length - 1) + '.zip';
    // handle member site
    // if (folderPath.indexOf('WebUI') > -1)
    //   bkFile = folderPath.substr(0, folderPath.length - 7) + '.zip';
    let nameBatFile =
      record.get('name') +
      '_' +
      getSiteTypeName() +
      '_' +
      Ext.getCmp('rbBatMode').getValue().rb +
      '.bat';
    let url = domain || genUrl(record);
    var params = {
      whitelabelUrl: url,
      backendId: backendId,
      dzFileName: Ext.getCmp('txtUploadedFileName').getValue(),
      dzFileNameList: dzFileNameListGen(listFileFromLocal, folderPath),
      bkFile: bkFile,
      pathFolder: folderPath,
      nameBatFile: nameBatFile,
      batMode: Ext.getCmp('rbBatMode').getValue().rb,
      isBKFull: Ext.getCmp('cbBackupFull').getValue(),
      isStart: Ext.getCmp('cbIsStart').getValue(),
    };
    Ext.Ajax.request({
      method: 'POST',
      url: borderPx1ApiHost + '/deployment/run',
      params: params,
      withCredentials: true,
      success: function (response) {
        var result = JSON.parse(response.responseText);
        if (result.success) {
          record.set('batUpload', 'ok');
          // automatic checking after runbat
          if (Ext.getCmp('cbAutoCheck').getValue()) {
            var seconds = Ext.getCmp('txtCheckingTime').getValue() * 1000;
            if (isNaN(seconds)) return;
            // start check auto
            record.set('checked', 'spinner');
            setTimeout(
              () =>
                checkFilesOneRecord({
                  record,
                  rowIndex,
                  url,
                }),
              seconds
            );
          }
        } else {
          log(result.msg);
          record.set('batUpload', 'error');
        }
        if (callback) callback();
      },
      failure: function (response) {
        log('failure with status code ' + response.status);
        record.set('batUpload', 'error');
        if (callback) callback();
      },
    });
  });
}
