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
    { name: 'GameImageCDN', type: 'string' },
    { name: 'HasSubGame', type: 'bool' },
    { name: 'ImageType', type: 'string' },
    { name: 'ImageTypeSubMenu', type: 'string' },
    { name: 'HeaderLastUpdatedTime', type: 'date', dateFormat: 'c' },
    { name: 'SubMenuLastUpdatedTime', type: 'date', dateFormat: 'c' },
  ],
});
var tokenSync = '';
var cdnImageHost =
  localStorage.getItem('cdnImageHost') ||
  (location.host.indexOf('localhost') > -1
    ? 'http://localhost/cdn'
    : 'https://imgtest.playliga.com');
var pathSyncGame = '/sync/headergames'
let storeHeaderGame = Ext.create('Ext.data.Store', {
  model: 'HeaderGame',
  proxy: {
    type: 'ajax',
    url: cdnImageHost + '/sync/headergames/',
    params: {
      CTId: getQueryParam('CTId'),
    },
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
              let subMenuIcon = data.submenuIcons[record['HGameId']];
              let isHeaderSubMenuImage =
                record['GameTypeMenuIcon'] == '' && record['HasSubGame'];
              if (isHeaderSubMenuImage) {
                record['GameTypeSubMenuIcon'] = subMenuIcon;
                record['ImageTypeSubMenu'] = 'png';
              }
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
    title: getQueryParam('WL') + `'s Header Game Images`,
    width:
      Ext.getBody().getViewSize().width < 1388
        ? 1388
        : Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
    viewConfig: {
      loadMask: true,
    },
    listeners: {
      viewready:() =>{
        Ext.getCmp('txtNameWLsDomainHG').setValue(getQueryParam('CTId'))
      }
    },
    dockedItems: [
      {
        xtype: 'toolbar',
        dock: 'top',
        items: [
          {
            xtype: 'button',
            id: 'btnCheckDomain',
            iconCls: 'refreshCls',
            text: 'Refresh',
            dock: 'right',
            hidden: false,
            listeners: {
              click: () => {
                let proxy = storeHeaderGame.getProxy();
                proxy.setUrl(Ext.getCmp('cbbUrlCDN').getValue() + pathSyncGame);
                proxy.setExtraParams({
                  CTId: Ext.getCmp('txtNameWLsDomainHG').getValue(),
                });
                storeHeaderGame.load();
              },
            },
          },
          {
            xtype: 'combo',
            width: 230,
            store: new Ext.data.ArrayStore({
              fields: ['id', 'name'],
              data: [
                ['http://localhost/cdn', 'http://localhost/cdn'],
                [
                  'https://imgtest.playliga.com',
                  'https://imgtest.playliga.com',
                ],
                ['https://imgtest.playliga.com.', 'Live CDN'],
              ],
            }),
            displayField: 'name',
            valueField: 'id',
            name: 'cbbUrlCDN',
            id: 'cbbUrlCDN',
            value: 'http://localhost/cdn',
            editable: false,
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
            name: 'cbbSiteTypeDomainHG',
            id: 'cbbSiteTypeDomainHG',
            value: 'member',
            disabled: true,
            hidden: true,
            editable: false,
          },
          {
            xtype: 'combo',
            width: 150,
            store: new Ext.data.ArrayStore({
              fields: ['id', 'name'],
              data: JSON.parse(localStorage.getItem('storeWLSyncGrid')),
            }),
            displayField: 'name',
            valueField: 'id',
            queryMode: 'local',
            value: '',
            id: 'txtNameWLsDomainHG',
            itemId: 'txtNameWLsDomainHG',
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
              // change: function (cb, e) {
              //   Ext.getCmp('btnFindHG').fireEvent('click');
              // },
            },
          },
          {
            xtype: 'button',
            text: '',
            id: 'btnFindHG',
            icon: 'https://icons.iconarchive.com/icons/zerode/plump/16/Search-icon.png',
            listeners: {
              click: () => {
                let proxy = storeHeaderGame.getProxy();
                proxy.setUrl(
                  Ext.getCmp('cbbUrlCDN').getValue() + pathSyncGame
                );
                proxy.setExtraParams({
                  CTId: Ext.getCmp('txtNameWLsDomainHG').getValue(),
                });
                storeHeaderGame.load();
                headerGameGrid.setTitle(Ext.getCmp('txtNameWLsDomainHG').getRawValue() + '\'s Header Game Images')
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
        text: 'MenuIcon',
        width: 120,
        dataIndex: 'GameTypeMenuIcon',
      },
      {
        text: 'SubMenuIcon',
        width: 120,
        dataIndex: 'GameTypeSubMenuIcon',
      },
      {
        text: 'Base64 Str',
        tooltip: 'Image from base64 string',
        dataIndex: 'GameTypeMenuIcon',
        tdCls: 'headerIcons',
        renderer: (v, _, r) => {
          let imageType = r.get('ImageType');
          if (imageType === 'svg') {
            imageType = 'svg+xml';
            return `<img style="width:70%; height:70%" src="data:image/${imageType};base64, ${v}" />`;
          }
          if (v !== '')
            return `<img src="data:image/${imageType};base64, ${v}" />`;
          return `<img style="width:70%; height:70%" src="data:image/${r.get(
            'ImageTypeSubMenu'
          )};base64, ${r.get('GameTypeSubMenuIcon')}" />`;
        },
      },
      {
        text: 'CDN File',
        tooltip: 'Image from CDN file',
        dataIndex: 'GameImageCDN',
        tdCls: 'headerIcons',
        renderer: (v, _, r) => {
          let isHeaderSubMenuImage =
            r.get('GameTypeMenuIcon') == '' && r.get('HasSubGame');
          if (!isHeaderSubMenuImage) {
            return `<img src="${
              cdnImageHost +
              '/headergames/' +
              r.get('CTId') +
              '/MenuIcon_' +
              r.get('HGameId') +
              '_' +
              r.get('GameName') +
              '.' +
              r.get('ImageType')
            }?v=${Date.now()}" />`;
          } else {
            let isSharedHeaderSubMenuImage = getISharedHeaderSubMenuImage(
              r.get('CTId')
            );
            return `<img style="width:70%; height:70%" src="${
              cdnImageHost +
              '/headergames' +
              (isSharedHeaderSubMenuImage ? '' : '/' + r.get('CTId')) +
              '/SubMenuIcon_' +
              r.get('HGameId') +
              '_' +
              r.get('GameName') +
              '.' +
              r.get('ImageType')
            }?v=${Date.now()}" />`;
          }
        },
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
              //rowIndex = grid.getStore().indexOf(record);
              //record = grid.getStore().getAt(rowIndex);
              record.set('syncSpinner', true);
              let isHeaderSubMenuImage =
                record.get('GameTypeMenuIcon') == '' &&
                record.get('HasSubGame');
              Ext.Ajax.request({
                headers: {
                  Authorization:
                    'Bearer ' + localStorage.getItem('token-sync-image-cdn'),
                },
                method: 'POST',
                url: cdnImageHost + '/headergames/update',
                jsonData: {
                  HGameId: record.get('HGameId').toString(),
                  GameName: record.get('GameName'),
                  CTId: record.get('CTId').toString(),
                  ImageType: record.get('ImageType'),
                  IsHeaderSubMenuImage: isHeaderSubMenuImage,
                  strBase64: isHeaderSubMenuImage
                    ? record.get('GameTypeSubMenuIcon')
                    : record.get('GameTypeMenuIcon'),
                },
                success: function (response) {
                  let rs = JSON.parse(response.responseText);
                  record.set('syncSpinner', false);
                  let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
                  record.set('GameImageCDN', img);
                  grid.getStore().commitChanges();
                },
                failure: function (response) {
                  Ext.Msg.alert('Error', 'Sync CDN Images function');
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
