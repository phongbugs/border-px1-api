//if (!isAuthenticated()) return;
Ext.define('HeaderGame', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'Id', type: 'int' },
    { name: 'CTId', type: 'int' },
    { name: 'GameMenuDisplayName', type: 'string' },
    { name: 'GameType', type: 'string' },
    { name: 'HGameId', type: 'int' },
    { name: 'GameName', type: 'string' },
    { name: 'OrderId', type: 'string' },
    { name: 'GameTypeMenuIcon', type: 'string' },
    { name: 'GameTypeSubMenuIcon', type: 'string' },
    { name: 'HasSubGame', type: 'bool' },
    { name: 'ImageType', type: 'string' },
    { name: 'ImageTypeSubMenu', type: 'string' },
    { name: 'HeaderLastUpdatedTime', type: 'date', dateFormat: 'c' },
    { name: 'SubMenuLastUpdatedTime', type: 'date', dateFormat: 'c' },
  ],
});
var cdnImageHost =
  localStorage.getItem('cdnImageHost') ||
  (location.host.indexOf('localhost') > -1
    ? 'http://localhost/cdn'
    : 'https://imgtest.playliga.com');
let storeHeaderGame = Ext.create('Ext.data.Store', {
  model: 'HeaderGame',
  proxy: {
    type: 'ajax',
    url: cdnImageHost + '/sync/headergames/?CTId=246',
    headers: {
      Authorization: 'Basic ' + localStorage.getItem('border-px1-api-cookie'),
    },
    reader: {
      type: 'json',
      root: 'menus',
      totalProperty: 'totalCount',
      transform: {
        fn: function (data) {
          if (data.success) {
            data.menus = data.menus.map((record) => {
              let subMenuIcon = data.submenuIcons[record["HGameId"]]
              record["GameTypeSubMenuIcon"] = subMenuIcon;
              record["ImageTypeSubMenu"] = "png"
              return record;
            });
          }
          return data;
        },
      },
    },
  },
  listeners: {
    load: function (_, records, successful, operation, eOpts) {
      data = records;
      Groups = storeHeaderGame.getGroups();
    },
  },
  autoLoad: true,
});
let renderDateTime = (v, _, r) => Ext.Date.format(v, 'm/d/Y H:i:s');
Ext.onReady(function () {
  let headerGameGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'headerGameGrid',
    store: storeHeaderGame,
    title: 'Header Game Images',
    width:
      Ext.getBody().getViewSize().width < 1388
        ? 1388
        : Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
    hidden: false,
    frame: true,
    plugins: ['cellediting'],
    viewConfig: {
      loadMask: true,
    },
    listeners: {
      show: (grid) => {},
      hide: () => Ext.getCmp('gridWLs').setDisabled(false),
    },
    dockedItems: [
      {
        xtype: 'toolbar',
        dock: 'top',
        items: [
          {
            xtype: 'button',
            id: 'btnCheckDomain',
            iconCls: 'syncCls',
            text: 'Symc All',
            dock: 'right',
            hidden: false,
            listeners: {
              click: () => {},
            },
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
            name: 'cbbSiteTypeDomain',
            id: 'cbbSiteTypeDomain',
            value: 'member',
            editable: false,
            listeners: {
              change: (_, newValue) => {
                Ext.getCmp('cbbSiteType').setValue(newValue);
                Ext.getCmp('btnFindDomain').fireEvent('click');
              },
            },
          },
          {
            xtype: 'combo',
            width: 150,
            store: new Ext.data.ArrayStore({
              fields: ['id', 'name'],
              data: [],
            }),
            displayField: 'name',
            valueField: 'id',
            queryMode: 'local',
            value: '',
            id: 'txtNameWLsDomain',
            itemId: 'txtNameWLsDomain',
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
                let whiteLabelName =
                    Ext.getCmp('txtNameWLsDomain').getRawValue(),
                  domainType = Ext.getCmp('cbbDomainType')
                    .getRawValue()
                    .toLowerCase();
                showheaderGameGridDataByWhitelabel({
                  whiteLabelName,
                  domainType,
                });
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
        width: 60,
        dataIndex: 'Id',
      },
      {
        text: 'CTId',
        width: 50,
        dataIndex: 'CTId',
      },
      {
        text: 'GameMenuDisplayName',
        width: 90,
        dataIndex: 'GameMenuDisplayName',
      },
      {
        text: 'GameType',
        width: 100,
        dataIndex: 'GameType',
      },

      {
        text: 'HId',
        width: 70,
        dataIndex: 'HGameId',
      },

      {
        text: 'GameName',
        width: 150,
        dataIndex: 'GameName',
      },
      {
        text: 'OId',
        width: 30,
        dataIndex: 'OrderId',
      },
      {
        text: 'GameTypeMenuIcon',
        width: 170,
        dataIndex: 'GameTypeMenuIcon',
      },
      {
        text: 'Image Base64 String',
        dataIndex: 'GameTypeMenuIcon',
        tdCls: 'headerIcons',
        renderer:  (v, _, r) => {
          let imageType = r.get('ImageType')
          if(imageType === 'svg') imageType = 'svg+xml'
          if(v !== '')
            return `<img src="data:image/${imageType};base64, ${v}" />`;
          return `<img style="width:50px; height:50px" src="data:image/${r.get('ImageTypeSubMenu')};base64, ${r.get('GameTypeSubMenuIcon')}" />`
        }
      },
      {
        text: 'Image From CDN',
        dataIndex: 'GameTypeMenuIcon',
        tdCls: 'headerIcons',
        renderer:  (v, _, r) => {
          let urlImageCDN = cdnImageHost + '/headergames/' + r.get('CTId')
          let imageType = r.get('ImageType')
          if(imageType === 'svg') imageType = 'svg+xml'
          if(v !== ''){
            urlImageCDN += '/MenuIcon_' + r.get('ID')
            return `<img src="${urlImageCDN}" />`;
          }
          urlImageCDN += '/SubMenuIcon_' + r.get('HGameId')
          return `<img style="width:50px; height:50px" src="${urlImageCDN}" />`
        }
      },
      {
        text: 'HSG',
        width: 50,
        dataIndex: 'HasSubGame',
      },
      {
        text: 'IType',
        width: 70,
        dataIndex: 'ImageType',
      },
      {
        xtype: 'actioncolumn',
        width: 55,
        tooltip: 'Sync CDN Images',
        text: 'Sync',
        //tdCls:'syncCls',
        items: [
          {
            iconCls: 'syncCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var isSpinning = record.get('syncSpinner');
              return isSpinning ? 'spinner' : 'syncCls';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              rowIndex = grid.getStore().indexOf(record);
              record = grid.getStore().getAt(rowIndex);
              record.set('syncSpinner', true);
              var cdnImageHost =
                localStorage.getItem('cdnImageHost') ||
                (location.host.indexOf('localhost') > -1
                  ? 'http://localhost/cdn'
                  : 'https://imgtest.playliga.com');
              Ext.Ajax.request({
                method: 'POST',
                url: cdnImageHost + '/headergames/headergames?CTId=' + selectedComptypeId,

                headers: {
                  Authorization:
                    'Basic ' + localStorage.getItem('border-px1-api-cookie'),
                },
                success: function (response) {
                  record.set('syncSpinner', false);
                  let result = JSON.parse(response.responseText);
                  if (result.success) {
                    
                  } else {
                     alert(result.message);
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
      {
        text: 'HeaderLastUpdatedTime',
        width: 150,
        dataIndex: 'HeaderLastUpdatedTime',
        renderer: renderDateTime,
        hidden: true,
      },
      {
        text: 'SubMenuLastUpdatedTime',
        width: 150,
        dataIndex: 'SubMenuLastUpdatedTime',
        renderer: renderDateTime,
        hidden: true,
      },
    ],
  });
});
