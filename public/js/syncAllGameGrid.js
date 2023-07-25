//if (!isAuthenticated()) return;
Ext.define('AllGame', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'GameListID', type: 'int' },
    { name: 'CTId', type: 'int' },
    { name: 'type', type: 'string' },
    { name: 'platform', type: 'string' },
    { name: 'gameType', type: 'int' },
    { name: 'gameDesc', type: 'string' },
    { name: 'gameCode', type: 'string' },
    { name: 'gameName', type: 'string' },
    { name: 'SearchTags', type: 'string' },
    { name: 'GameCurCode', type: 'string' },
    { name: 'IsNewGame', type: 'bool' },
    { name: 'IdGameUrl', type: 'string' },
    { name: 'GameImgeBase64', type: 'string' },
    { name: 'GameImgeCDN', type: 'string' },
    { name: 'ImageType', type: 'string' },
    { name: 'BrandDisplayName', type: 'string' },
    { name: 'BrandOrderId', type: 'string' },
  ],
});
var tokenSync = '';
var cdnImageHost =
  localStorage.getItem('cdnImageHost') ||
  (location.host.indexOf('localhost') > -1
    ? 'http://localhost/cdn'
    : 'https://imgtest.playliga.com');
var pathSyncGame = '/sync/allgames';
var CTId = getQueryParam('CTId');
let storeAllGame = Ext.create('Ext.data.Store', {
  model: 'AllGame',
  proxy: {
    type: 'ajax',
    url: cdnImageHost + pathSyncGame,
    extraParams: {
      CTId: CTId,
    },
    timeout: 60000,
    headers: {
      Authorization: 'Basic ' + localStorage.getItem('border-px1-api-cookie'),
    },
    reader: {
      type: 'json',
      root: 'games',
      //totalProperty: 'totalCount',
      transform: {
        fn: function (data) {
          if (data && data.success) {
            let images = data.images;
            data.games = data.games.map((record) => {
              record['ImageType'] = 'png'
              record['GameImgeBase64'] = images[record['GameListID']];
              return record;
            });
          }
          return data;
        },
      },
    },
  },
  autoLoad: true,
});
let renderDateTime = (v, _, r) => Ext.Date.format(v, 'm/d/Y H:i:s');
Ext.onReady(function () {
  let allGameGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'allGameGrid',
    store: storeAllGame,
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
      viewready: () => {
        Ext.getCmp('txtNameWLsDomainHG').setValue(CTId);
      },
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
                let proxy = storeAllGame.getProxy();
                cdnImageHost =  Ext.getCmp('cbbUrlCDN').getRawValue()
                proxy.setUrl(
                  cdnImageHost + pathSyncGame
                );
                proxy.setExtraParams({CTId: CTId});
                storeAllGame.load();
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
            editable: true,
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
          },
          {
            xtype: 'button',
            text: '',
            id: 'btnFindHG',
            icon: 'https://icons.iconarchive.com/icons/zerode/plump/16/Search-icon.png',
            listeners: {
              click: () => {
                let proxy = storeAllGame.getProxy();
                cdnImageHost =  Ext.getCmp('cbbUrlCDN').getRawValue()
                proxy.setUrl(
                  cdnImageHost + pathSyncGame
                );
                proxy.setExtraParams({
                  CTId: Ext.getCmp('txtNameWLsDomainHG').getValue(),
                });
                storeAllGame.load();
                allGameGrid.setTitle(
                  Ext.getCmp('txtNameWLsDomainHG').getRawValue() +
                    "'s All Game Images"
                );
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
        tooltip: "GameListID",
        width: 60,
        dataIndex: 'GameListID',
      },
      {
        text: 'CTId',
        width: 50,
        dataIndex: 'CTId',
      },
      {
        text: 'type',
        width: 90,
        dataIndex: 'type',
      },
      {
        text: 'PF',
        width: 70,
        dataIndex: 'platform',
      },
      {
        text: 'GameType',
        width: 100,
        dataIndex: 'type',
        hidden: true,
      },
      {
        text: 'Game Desc',
        width: 100,
        dataIndex: 'gameDesc',
        hidden: true,
      },
      {
        text: 'Code',
        tooltip: 'gameCode',
        width: 120,
        dataIndex: 'gameCode',
      },
      {
        text: 'Name',
        width: 150,
        dataIndex: 'gameName',
      },
      {
        text: 'SearchTags',
        width: 120,
        dataIndex: 'SearchTags',
        hidden:true,
      },
      {
        text: 'GCC',
        tooltip: 'GameCurCode',
        width: 50,
        dataIndex: 'GameCurCode',
      },
      {
        text: 'IsNew',
        width: 70,
        tooltip: 'Is New Game',
        dataIndex: 'IsNewGame',
        hidden: true,
      },
      {
        text: 'IdGameUrl',
        width: 150,
        dataIndex: 'IdGameUrl',
        hidden: true,
      },
      {
        text: 'BrandDisplayName',
        width: 150,
        dataIndex: 'BrandDisplayName',
        hidden: true,
      },
      {
        text: 'OrderId',
        width: 70,
        dataIndex: 'BrandOrderId',
        hidden: true,
      },
      {
        text: 'Base64 Str',
        tooltip: 'Image from base64 string',
        dataIndex: 'GameImgeBase64',
        width: 150,
        tdCls: 'headerIcons',
        renderer: (v, _, r) => {
          let imageType = r.get('ImageType');
          if (imageType === 'svg') {
            imageType = 'svg+xml';
            return `<img src="data:image/${imageType};base64, ${v}" />`;
          }
          if (v !== '')
            return `<img style="width:100%; height:100%" src="data:image/${imageType};base64, ${v}" />`;
          return `<img src="data:image/${r.get(
            'ImageType'
          )};base64, ${v}" />`;
        },
      },
      {
        text: 'CDN File',
        tooltip: 'Image from CDN file',
        dataIndex: 'GameImgeCDN',
        width: 150,
        tdCls: 'headerIcons',
        renderer: (v, _, r) => {
          return `<img style="width:100%; height:100%" src="${
            cdnImageHost +
            '/allgames/' +
            r.get('GameListID') +
            '.' +
            r.get('ImageType')
          }?v=${Date.now()}" />`;
        },
      },
      {
        xtype: 'actioncolumn',
        width: 55,
        tooltip: 'Sync CDN Images',
        text: 'Sync',
        items: [
          {
            iconCls: 'syncCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              var isSpinning = record.get('syncSpinner');
              return isSpinning ? 'spinner' : 'syncCls';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              record.set('syncSpinner', true);
              syncImage(
                {
                  record,
                  imageType: record.get('ImageType'),
                  strBase64: record.get('GameImgeBase64'),
                },
                (response) => {
                  let rs = JSON.parse(response.responseText);
                  record.set('syncSpinner', false);
                  let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
                  record.set('GameImgeCDN', img);
                  grid.getStore().commitChanges();
                }
              );
            },
          },
        ],
      },
    ],
  });
});
function syncImage(
  { record, imageType, strBase64 },
  done
) {
  Ext.Ajax.request({
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token-sync-image-cdn'),
    },
    method: 'PUT',
    url: cdnImageHost + '/allgames/update',
    jsonData: {
      GameListID: record.get('GameListID').toString(),
      ImageType: imageType,
      strBase64: strBase64,
    },
    success: function (response) {
      if (done) done(response);
    },
    failure: function (response) {
      Ext.Msg.alert('Error', 'Sync CDN Images function');
    },
  });
}
