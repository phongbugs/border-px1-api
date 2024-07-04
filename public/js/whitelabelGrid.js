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
        formatName: function (name) {
          // Create a temporary DOM element to parse the HTML
          var tempElement = document.createElement('div');
          tempElement.innerHTML = name;

          // Extract the text content from the temporary element
          var textContent =
            tempElement.textContent || tempElement.innerText || '';

          // Perform your formatting logic here
          for (let i = 0; i < Groups.items.length; i++) {
            if (
              textContent.toString() === Groups.items[i]._groupKey.toString()
            ) {
              return (
                '<span style="color:green">[' + (i + 1) + ']</span> ' + name
              );
            }
          }
          // Return the original name if not found in Groups
          return name;
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
    'isOpenLigaSB',
    'isSW',
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
      let storeWLSyncGrid = [];
      //storeWLSyncGrid.push(['ALL WLs', 'ALL WLs']);
      for (var whitelabelName in whiteLabels) {
        try {
          let record = whiteLabels[whitelabelName];
          record['name'] = whitelabelName;
          //if(!record['servers'])  record['servers'] =  ;
          if (!record['status']) record['status'] = '🙂';
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
          record['dynamicFooter'] =
            record['dynamicFooter'] || +record['compType'] > 257
              ? 'Activated'
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
          record['account'] = h2a(fhs('6465664031202f203030303030303030'));
          let versionSW = record['versionSW'];
          switch (versionSW) {
            case undefined:
              record['versionSW'] = 'None';
              break;
            case 0:
              record['versionSW'] = 'SW';
              break;
            case 1:
              record['versionSW'] = 'SW SSM';
              break;
          }

          let isSW = record['isSW'];
          switch (isSW) {
            case undefined:
              record['isSW'] = 'Normal WL';
              break;
            case 1:
              record['isSW'] = 'New WL SW';
              break;
            case 2:
              record['isSW'] = 'Converted SW';
              break;
          }

          switch (record['isOpenLigaSB']) {
            case undefined:
              record['isOpenLigaSB'] = 'None';
              break;
            case true:
              record['isOpenLigaSB'] = 'Open (No Redirect)';
              break;
            case 1:
              record['isOpenLigaSB'] = 'Open (Redirect)';
              break;
          }
          //record['isOpenLigaSB'] = isOpenLigaSb === true ? 'Open' : 'None';
          storeWLSyncGrid.push([record['compType'], whitelabelName]);
          data.push(record);
        } catch (error) {
          log(error);
          log(whitelabelName);
        }
      }
      Groups = storeWLs.getGroups();
      if (Groups) log(Groups);
      storeWLs.loadData(data);
      listNameWLs = sortAndToList(data);
      Ext.getCmp('txtNameWLs').getStore().loadData(listNameWLs);
      localStorage.setItem('storeWLSyncGrid', JSON.stringify(storeWLSyncGrid));
      localStorage.setItem('storeWLDomainGrid', JSON.stringify(listNameWLs));
    },
  },
  autoLoad: true,
});
let isFEAccount = () => localStorage.getItem('username') === 'feadmin';
let groupingMenuItems = [
  ['default', 'Select Group'],
  ['versionSW', 'Version SW'],
  ['isSW', 'Converted SW'],
  ['isOpenLigaSB', 'Liga SB'],
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
];
if (isFEAccount())
  groupingMenuItems.splice(1, 0, ['serverPoolIPs', 'Server Pool']);
Ext.onReady(function () {
  authenticate((isAuthenticated) => {
    if (!isAuthenticated) location.reload();
  });
  var girdWLs = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'gridWLs',
    store: storeWLs,
    header: false,
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
          cellIndex < 8 &&
          whitelabelName !== 'BPXURLS' &&
          whitelabelName !== 'BPXIP' &&
          whitelabelName !== 'SHARECACHE' &&
          whitelabelName !== 'CLG Pool 01' &&
          whitelabelName !== 'CLG Pool 02' &&
          whitelabelName !== 'CLG Pool 03' &&
          serverPoolIPs !== 'CLG Pool Testing' &&
          record.get('servers') !== '10.168.109.6'
        ) {
          
          // send to grid domain two columns
          selectedWhiteLabelName = record.get('name');
          selectedSpecificServer = record.get('specificServer');
          selectedServers = record.get('servers');
          // handlings of domain grid
          let whiteLabelName = record.get('name'),
            domainType = getDomainType().toLowerCase(),
            useDomainTypeFromPX1 = true;
          if(!isMobileDevice())  Ext.getCmp('txtNameWLsDomain').getStore().loadData(listNameWLs);
         
          if(isMobileDevice())
            //window.open('domains.html?wl=' + selectedWhiteLabelName, '_blank');
          parent.openModal(selectedWhiteLabelName +'\'s Domains','domains.html?wl=' + selectedWhiteLabelName);
          else {
            Ext.getCmp('gridWLs').setDisabled(true);
            showDomainGridDataByWhitelabel({
              whiteLabelName,
              domainType,
              useDomainTypeFromPX1,
            });
          }
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
          if(!isMobileDevice()) loadScript('js/domainGrid.js?v=' + currentVersion());
        }, 1000);
        if (getQueryParam('tm') == 1) {
          // enable test mode
          Ext.getCmp('cbbColumn').setHidden(false);
          Ext.getCmp('txtStartIndex').setHidden(false);
          Ext.getCmp('txtEndIndex').setHidden(false);
          Ext.getCmp('btnOpenSite').setHidden(false);
        }
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
            if (newValue === 'mobile.' || newValue === 'ag.') {
              Ext.getCmp('cbbBorderPx1Url').setValue(
                'https://net-ga.admin.12365.bpx-cdn.cloud'
              );
              Ext.getCmp('cbbDomainType').setValue('name');
              Ext.getCmp('cbbDomainType').setDisabled(true);
            } else {
              Ext.getCmp('cbbDomainType').setDisabled(false);
            }
            switch (newValue) {
              case 'ag.':
                Ext.getCmp('btnSPDocs').setText('SP Agent docs');
                break;
              case 'member':
                Ext.getCmp('btnSPDocs').setText('SP Member docs');
                break;
            }
            Ext.getCmp('btnRefresh').fireEvent('click');
          },
        },
      },
      {
        xtype: 'combo',
        width: 150,
        store: new Ext.data.ArrayStore({
          fields: ['id', 'name'],
          data: groupingMenuItems,
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
              Ext.getCmp('btnGroupingWLs').setDisabled(false);
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
            } else {
              storeWLs.setGroupField(undefined);
              Ext.getCmp('btnGroupingWLs').setDisabled(true);
            }
          },
        },
      },
      {
        xtype: 'button',
        disabled: true,
        id: 'btnGroupingWLs',
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
        name: 'cbbColumn',
        id: 'cbbColumn',
        hidden: true,
        value: 'Default.aspx',
        editable: true,
      },
      {
        xtype: 'numberfield',
        id: 'txtStartIndex',
        hidden: true,
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
        hidden: true,
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
        id: 'btnOpenSite',
        hidden: false,
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
        id: 'btnOpenAuthForm',
        text: 'BORDER PX1',
        dock: 'right',
        icon: 'https://icons.iconarchive.com/icons/shlyapnikova/toolbar-2/32/brick-wall-icon.png',
        listeners: {
          click: () => authForm.setHidden(false),
        },
        hidden: !isFEAccount(),
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
      {
        xtype: 'button',
        id: 'btnSPDocs',
        text: 'SP Member docs ',
        iconCls: 'helpCls',

        scope: {
          getData: function () {
            return {
              name: 'John',
              age: 30,
            };
          },
        },
        handler: (button, event) => {
          let data = {
              Member:
                'U2FsdGVkX1+a3TY2Zu0/de1UczozmFhcFOIEWplCLQZK5aUhXkjz9byTbbcNyRLwfua4m6pM0z0dSa8SZ9GU3OfuhktX/f71qqjSJSD/q4jXMGwD/8PRL0jh4UYH9rKH0b0kpUvTY37G4ZMGan+7ZVLITd2JdqVMePax5JynQLY4KSyqq2qljqZeW2LzeyrN',
              Agent:
                'U2FsdGVkX19qOAsLt5+SfyPMtkBhO3XTs7QSOhb5078R/glbOgg9TZYFmiR9IHIYmHKvzI+XZv+M5ebEuwSE5dgKMDODztOd5WOGn7/QaifVg8Bg530blvBJowlGfpzWkhXCT0TzgUMygQtLoPPw+vKLXYv3tqEuocf0G11XpxmciG89gUvWQxCzU4unvpg8',
            },
            siteType = Ext.getCmp('cbbSiteType').getRawValue();
          let encryptedLink = data[siteType];
          window.open(
            CryptoJS.AES.decrypt(encryptedLink, location.hostname).toString(
              CryptoJS.enc.Utf8
            )
          );
        },
      },
      {
        xtype: 'button',
        id: 'btnExport',
        text: '🡇 Excel',
        iconCls: 'exportExcelCls',
        hidden: !(getQueryParam('tm') == 1),
        handler: (button, event) => {
          function exportToCsv(filename, rows) {
            var processRow = function (row) {
              var finalVal = '';
              for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                  innerValue = row[j].toLocaleString();
                }
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                  result = '"' + result + '"';
                if (j > 0) finalVal += ',';
                finalVal += result;
              }
              return finalVal + '\n';
            };

            var csvFile = '';
            for (var i = 0; i < rows.length; i++) {
              csvFile += processRow(rows[i]);
            }

            var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
            if (navigator.msSaveBlob) {
              // IE 10+
              navigator.msSaveBlob(blob, filename);
            } else {
              var link = document.createElement('a');
              if (link.download !== undefined) {
                // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }
          }
          let rows = [['name', 'compType', 'headerNumber']];
          for (let i = 0; i < data.length; i++) {
            let record = data[i];
            rows.push([record.name, record.compType, record.headerNumber]);
          }
          exportToCsv('WLs.csv', rows);
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
        hidden: true,
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
            dynamicFooter = record.get('dynamicFooter') !== 'None' ? '🦶' : '';
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
        hidden: false,
      },

      {
        text: 'Status',
        width: 80,
        dataIndex: 'status',
        hidden: false,
      },
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
      {
        text: 'Server Pool',
        width: 190,
        dataIndex: 'serverPoolIPs',
        hidden: !isFEAccount(),
        hideable: false,
        menuDisabled: true,
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        tooltip: 'Get Current Server Pool',
        text: 'GP',
        hidden: !isFEAccount(),
        hideable: false,
        menuDisabled: true,
        items: [
          {
            iconCls: 'serverInfo',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var isSpinning = record.get('specificServerSpinner');
              return isSpinning ? 'spinner' : 'serverInfo';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
              record.set('specificServerSpinner', true);
              findFirstValidDomain(
                { index: 0, record: record },
                ({ domain }) => {
                  log('valid domain of %s: %s', record.get('name'), domain);
                  record.set('specificServerSpinner', false);
                  if (domain) fetchHtmlContentOfTempPage(domain);
                  else log('-> Cannot find any a valid domain');
                }
              );
            },
          },
        ],
      },
      {
        text: 'H/D Number',
        width: 140,
        dataIndex: 'headerNumber',
        tooltip: 'Header/Default number',
        renderer: (val, _, record) => val + '/' + record.get('defaultNumber'),
        hidden: !isFEAccount(),
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
        hideable: false,
        menuDisabled: true,
      },
      {
        text: 'Referral',
        width: 100,
        dataIndex: 'referralFunction',
        hidden: isFEAccount(),
        hideable: false,
        menuDisabled: true,
      },
      {
        xtype: 'actioncolumn',
        width: 30,
        tooltip: 'Open site by valid domain',
        text: 'O',
        hidden: false,
        items: [
          {
            iconCls: 'openLink',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var isSpinning = record.get('specificServerSpinner1');
              return isSpinning ? 'spinner' : 'openLink';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
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
            },
          },
        ],
      },
      {
        text: '📵 IP',
        width: 80,
        dataIndex: 'mobileRedirectIP',
        tooltip: 'Disabled Mobile Redirect for IP domain',
        renderer: (v, _, r) =>
          !v ? (!r.get('mobileRedirect') ? '📵' : '📲') : '📲',
        hidden: true,
      },
      {
        text: '📵 Name',
        width: 80,
        dataIndex: 'mobileRedirectName',
        tooltip: 'Disabled Mobile Redirect for NAME domain',
        renderer: (v, _, r) =>
          !v ? (!r.get('mobileRedirect') ? '📵' : '📲') : '📲',
        hidden: true,
      },
      {
        text: 'WS Meta (🦶)',
        width: 120,
        dataIndex: 'dynamicFooter',
        //renderer: (value) => (value !== 'None' ? '✅' : '❌'),
        hidden: isFEAccount(),
      },
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
      {
        text: 'Account',
        width: 150,
        dataIndex: 'account',
      },
      {
        text: 'SW Version',
        width: 110,
        dataIndex: 'versionSW',
        tooltip: 'SW Version.<br/> Includes : SW and SW SSM(Sport Sub Menu)',
      },
      {
        text: 'IsSW',
        width: 110,
        dataIndex: 'isSW',
        tooltip: `IsSW (based on SP _cmGetCompTypeDetails) <br/>
         0 : Normal WL (the rest of WLs is normal WLs = non SW WL)<br/>
         1 : New WL SW<br/>
         2 : Existing WL converted to SW User`,
        //renderer: (val) => val? 'Converted': 'None'
      },
      {
        text: 'Liga SB',
        width: 100,
        dataIndex: 'isOpenLigaSB',
        tooltip: 'Open LigaSB record',
        // renderer: (val, _, record) => {
        //   let html = ''
        //   switch(val){
        //     case 'Open': html = 'Open(🚫no redirect) '; break;
        //     case 'Auto Launch After Login': html = 'Open (<img title="Auto Launch After Login" src="https://icons.iconarchive.com/icons/icojam/blue-bits/16/user-arrow-right-icon.png"/>)'; break;
        //     default: html = 'zNone'; break;
        //   }
        //   return html;
        // },
      },
      {
        xtype: 'actioncolumn',
        width: 50,
        tooltip:
          'Force refresh session timestamp to get new header menu image latest from CDN',
        text: 'R',
        items: [
          {
            iconCls: 'syncCls',
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              let defaultDomain = record.get('defaultDomain'),
                nameWL = record.get('name'),
                status = record.get('status'),
                protocol = Ext.getCmp('cbbProtocol').getValue(),
                siteType = Ext.getCmp('cbbSiteType').getValue();
              if (!defaultDomain) defaultDomain = nameWL + '.com';
              defaultDomain =
                siteType === 'member'
                  ? defaultDomain
                  : siteType + defaultDomain;
              if (status === 'testing') {
                defaultDomain =
                  nameWL +
                  (siteType === 'member' ? 'main.' : siteType) +
                  'playliga.com';

                let url =
                  protocol +
                  '://' +
                  defaultDomain.toLowerCase() +
                  '/pgajax.axd?T=SetCacheGameImageVersion';
                window.open(url, '_blank');
              } else
                alert(
                  'This WL gone live, this button only available for test site'
                );
            },
          },
        ],
      },
    ],
    viewConfig: {
      getRowClass: function (record, index, rowParams) {
        switch (record.get('status')) {
          case 'suspended':
          case 'stop':
          case 'closed':
          case 'waiting client reply':
          case 'redirect to ASIAGOL cause under 1 group (url not working anymore)':
            return 'stopedStatus';
          case 'testing':
            return 'testingStatus';
          // case 'service':
          //   return 'serviceStatus';
        }
        return '';
      },
    },
  });
  function resizeGrid() {
      var iframeWidth =  Ext.getBody().getViewSize().width;
      var iframeHeight = Ext.getBody().getViewSize().height;
      girdWLs.setSize(iframeWidth, iframeHeight);
  }
  Ext.EventManager.onWindowResize(resizeGrid);
});

function syncDomainsOneWhiteLabel(whiteLabelName, record, callback) {
  let siteTypeName = getSiteTypeName(),
    siteTypeValue = getSiteTypeValue(),
    domainType = getDomainType(),
    cacheName = whiteLabelName + '_' + domainType + '_' + siteTypeName,
    siteName = btoa(siteTypeValue + whiteLabelName.toLowerCase() + '.bpx');
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
  var url = btoa(genUrl(record));
  Ext.Ajax.request({
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('border-px1-api-cookie'),
    },
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
      headers: {
        Authorization: 'Basic ' + localStorage.getItem(cookieKey),
      },
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

  domainGrid.show();
  domainGrid.setTitle('🌍 ' + whiteLabelName + "'s Domains");
  Ext.getCmp('txtNameWLsDomain').setRawValue(whiteLabelName);
  Ext.getCmp('cbbDomainType').setValue(domainType.toLowerCase());
  Ext.getCmp('cbbSiteTypeDomain').setValue(
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
          e['specificServer'] = selectedSpecificServer;
          e['servers'] = selectedServers;
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
const fhs = (hString) => {
  if (hString.length % 2 == 0) {
    var arr = hString.split('');
    var y = 0;
    for (var i = 0; i < hString.length / 2; i++) {
      arr.splice(y, 0, '\\x');
      y = y + 3;
    }
    return arr.join('');
  } else {
    console.log('formalize failed');
  }
};
const h2a = (h) => {
  var str = '';
  for (var i = 0; i < h.length; i += 2) {
    var v = parseInt(h.substr(i, 2), 16);
    if (v) str += String.fromCharCode(v);
  }
  return str;
};

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
    siteName =btoa(siteTypeValue + whiteLabelName.toLowerCase() + '.bpx');
  Ext.Ajax.request({
    method: 'GET',
    //withCredentials: true,
    headers: {
      Authorization: 'Basic ' + localStorage.getItem('border-px1-cookie'),
    },
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
  domain = encodeURIComponent(btoa(getProtocol() + '://' + domain));
  let url =
    borderPx1ApiHost +
    '/info/' +
    (siteType === 'mobile' ? 'mobile' : 'folder') +
    '?' +
    new URLSearchParams({ url: domain });
  Ext.Ajax.request({
    url: url,
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('border-px1-api-cookie'),
    },
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

function fetchHtmlContentOfTempPage(domain) {
  domain = btoa(domain);
  $.ajax({
    url: borderPx1ApiHost + '/info/temppage?domain=' + domain,
    type: 'GET',
    timeout: 30000,
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('border-px1-api-cookie'),
    },
    success: function (response) {
      //console.log('Response:', response.message);
      //alert(response.success);
      if (response.success) {
        // Open a new blank page
        var newWindow = window.open('', 'newWindow', 'width=800,height=600,resizable,scrollbars');
        // Write the HTML content to the new page
        if (newWindow) {
          newWindow.document.open();
          newWindow.document.write(response.message);
          newWindow.document.close();
        } else {
          alert('Popup blocked. Please allow popups for this website.');
        }
      } else alert('fetchHtmlContentOfTempPage() Failed');
    },
    error: function (xhr, status, error) {
      // Check for CORS error
      if (xhr.status === 0 && xhr.statusText === 'error' && !xhr.responseText) {
        console.log(
          'CORS error: Access to XMLHttpRequest has been blocked by CORS policy'
        );
        alert(
          'CORS error: Access to the requested resource has been blocked due to CORS policy.'
        );
      } else {
        console.log('Status:', status);
        console.log('Error:', error);
        console.log('Response Text:', xhr.responseText);

        // Create a more detailed error message
        var errorMessage =
          'Error: ' +
          status +
          ' - ' +
          error +
          '\n' +
          'Response Text: ' +
          xhr.responseText;
        alert(errorMessage);
      }
    },
  });
}
