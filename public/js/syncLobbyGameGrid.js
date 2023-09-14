Ext.define('LobbyGame', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'CTId', type: 'int' },
    { name: 'BrandCode', type: 'string' },
    { name: 'GameCode', type: 'string' },
    { name: 'GameCurCode', type: 'string' },
    { name: 'GameLobbyId', type: 'string' },
    { name: 'GameType', type: 'string' },
    { name: 'IdGameUrl', type: 'string' },
    { name: 'LobbyImage', type: 'string' },
    { name: 'GameImgeCDN', type: 'string' },
    { name: 'ImageType', type: 'string' },
    { name: 'platform', type: 'string' },
    { name: 'LastUpdatedTime', type: 'string' },
  ],
});
var tokenSync = '';
var cdnImageHost =
  localStorage.getItem('cdnImageHost') ||
  (location.host.indexOf('localhost') > -1
    ? 'http://localhost/cdn'
    : 'https://imgtest.playliga.com');
var pathSyncGame = '/sync/lobbygames';
var CTId = getQueryParam('CTId');
let storeLobbyGame = Ext.create('Ext.data.Store', {
  model: 'LobbyGame',
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
      transform: {
        fn: function (data) {
          if (data && data.success) {
            data.games = data.games.map((record) => {
              record['CTId'] = CTId;
              record['ImageType'] = 'png';
              return record;
            });
          } else if (!data.success && data.message === 'Token is expired') {
            localStorage.removeItem('border-px1-api-cookie');
            setTimeout(() => window.parent.location.reload(), 1000);
          } else {
            alert(data.message);
          }
          return data;
        },
      },
    },
  },
  autoLoad: false,
});
let renderDateTime = (v, _, r) => Ext.Date.format(v, 'm/d/Y H:i:s');
Ext.onReady(function () {
  let lobbyGameGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'lobbyGameGrid',
    store: storeLobbyGame,
    header: false,
    title: getQueryParam('WL') + `'s Lobby Game Images`,
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
            hidden: true,
            listeners: {
              click: () => {
                let proxy = storeLobbyGame.getProxy();
                cdnImageHost = Ext.getCmp('cbbUrlCDN').getRawValue();
                proxy.setUrl(cdnImageHost + pathSyncGame);
                proxy.setExtraParams({
                  CTId: Ext.getCmp('txtNameWLsDomainHG').getValue(),
                });
                storeLobbyGame.load();
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
                ['https://imguat.playliga.com', 'https://imguat.playliga.com'],
              ],
            }),
            displayField: 'name',
            valueField: 'id',
            name: 'cbbUrlCDN',
            id: 'cbbUrlCDN',
            value: cdnImageHost,
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
              click: (btn) => {
                btn.setDisabled(true);
                let proxy = storeLobbyGame.getProxy();
                cdnImageHost = Ext.getCmp('cbbUrlCDN').getRawValue();
                proxy.setUrl(cdnImageHost + pathSyncGame);
                CTId = Ext.getCmp('txtNameWLsDomainHG').getValue();
                if (CTId && !isNaN(CTId)) {
                  proxy.setExtraParams({
                    CTId: CTId,
                  });
                  storeLobbyGame.load({
                    callback: function (records, operation, success) {
                      btn.setDisabled(false);
                    },
                  });
                  lobbyGameGrid.setTitle(
                    Ext.getCmp('txtNameWLsDomainHG').getRawValue() +
                      "'s Lobby Game Images"
                  );
                } else {
                  Ext.Msg.alert('Caution', 'Selected WL not found');
                  btn.setDisabled(false);
                }
              },
            },
          },
          {
            xtype: 'button',
            id: 'btnSyncAll',
            text: 'Sync All Lobby Images',
            dock: 'right',
            iconCls: 'syncCls',
            listeners: {
              click: (btn) => {
                if (storeLobbyGame.getCount() > 0) {
                  btn.setIconCls('spinner');
                  btn.setDisabled(true);
                  syncAllImages(0, storeLobbyGame, () => {
                    btn.setIconCls('syncCls');
                    btn.setDisabled(false);
                    alert('Sync All Image Done!');
                  });
                } else alert('Please search before sync !');
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
        dataIndex: 'GameLobbyId',
        tooltip: 'Game Lobby Id',
      },
      {
        text: 'CTId',
        width: 50,
        dataIndex: 'CTId',
      },
      {
        text: 'Game Type',
        width: 110,
        dataIndex: 'GameType',
      },
      {
        text: 'Platform',
        width: 110,
        dataIndex: 'platform',
        tooltip: 'Platform',
      },
      {
        text: 'Game Desc',
        width: 100,
        dataIndex: 'gameDesc',
        hidden: true,
      },
      {
        text: 'Brand Code',
        tooltip: 'Brand Code',
        width: 120,
        dataIndex: 'BrandCode',
      },
      {
        text: 'Game Code',
        tooltip: 'GameCode',
        width: 110,
        dataIndex: 'GameCode',
      },
      {
        text: 'GCC',
        tooltip: 'Game Cur Code',
        width: 50,
        dataIndex: 'GameCurCode',
      },
      {
        text: 'IdGameUrl',
        width: 150,
        dataIndex: 'IdGameUrl',
      },
      {
        text: 'LobbyImage',
        tooltip: 'Image from base64 string',
        dataIndex: 'LobbyImage',
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
          return `NULL`;
        },
      },
      {
        text: 'CDN File',
        tooltip: 'Image from CDN file',
        dataIndex: 'GameImgeCDN',
        width: 150,
        tdCls: 'headerIcons',
        renderer: (v, _, r) => {
          if (r.get('LobbyImage') === '') return 'NULL';
          return `<img style="width:100%; height:100%" src="${
            cdnImageHost +
            '/lobbygames/' +
            r.get('GameLobbyId') +
            '_' +
            r.get('GameCode') +
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
              if (record.get('LobbyImage') === '') return 'NULL';
              var isSpinning = record.get('syncSpinner');
              return isSpinning ? 'spinner' : 'syncCls';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              record.set('syncSpinner', true);
              return syncImage(
                {
                  urlAPI: cdnImageHost + '/lobbygames/update',
                  jsonData: {
                    GameLobbyId: record.get('GameLobbyId').toString(),
                    GameCode: record.get('GameCode'),
                    ImageType: record.get('ImageType'),
                    strBase64: record.get('LobbyImage'),
                  },
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
function syncImage({ urlAPI, jsonData }, done) {
  Ext.Ajax.request({
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token-sync-image-cdn'),
    },
    method: 'PUT',
    url: urlAPI,
    jsonData: jsonData,
    success: function (response) {
      if (done) done(response);
    },
    failure: function (response) {
      Ext.Msg.alert('Error', 'Sync CDN Images function');
    },
  });
}
function syncAllImages(currentIndex, store, done) {
  var grid = Ext.getCmp('lobbyGameGrid');
  if (currentIndex < store.getCount()) {
    let record = store.getAt(currentIndex);
    record.set('syncSpinner', true);
    grid.setDisabled(true);
    var view = grid.getView();
    view.scrollBy(0, view.getEl().getHeight());
    let urlAPI = cdnImageHost + '/lobbygames/update';
    let jsonData = {
      GameLobbyId: record.get('GameLobbyId').toString(),
      GameCode: record.get('GameCode'),
      ImageType: record.get('ImageType'),
      strBase64: record.get('LobbyImage'),
    };
    syncImage({ urlAPI, jsonData }, (response) => {
      let rs = JSON.parse(response.responseText);
      record.set('syncSpinner', false);
      let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
      record.set('GameImgeCDN', img);
      store.commitChanges();
      currentIndex = currentIndex + 1;
      syncAllImages(currentIndex, store, done);
    });
  } else {
    grid.setDisabled(false);
    if (done) done();
  }
}
