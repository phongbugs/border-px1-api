Ext.define('AllGame', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'GameListID', type: 'int' },
    { name: 'imgBase64Str', type: 'string' },
    { name: 'imgCDN', type: 'string' },
    { name: 'ImageType', type: 'string' },
  ],
});
var tokenSync = '';
var cdnImageHost =
  localStorage.getItem('cdnImageHost') || 'https://imgtest.playliga.com' ;
var pathSyncGame = '/sync/allgamesallwls';
let storeAllGame = Ext.create('Ext.data.Store', {
  model: 'AllGame',
  proxy: {
    type: 'ajax',
    url: cdnImageHost + pathSyncGame,
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
            data.games = data.games.map((record) => {
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
  let allGameGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'allGameGrid',
    store: storeAllGame,
    header: false,
    title: 'ALL GAMES',
    width:
      Ext.getBody().getViewSize().width < 1388
        ? 1388
        : Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
    viewConfig: {
      loadMask: true,
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
                let proxy = storeAllGame.getProxy();
                cdnImageHost = Ext.getCmp('cbbUrlCDN').getRawValue();
                proxy.setUrl(cdnImageHost + pathSyncGame);
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
                //['http://localhost/cdn', 'http://localhost/cdn'],
                [
                  'https://imgtest.playliga.com',
                  'https://imgtest.playliga.com',
                ],
                ['https://imguat.playliga.com', 'https://imguat.playliga.com'],
                ['https://imgshare.iuf-cfl.cloud', 'https://imgshare.iuf-cfl.cloud'],
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
            xtype: 'button',
            text: '',
            id: 'btnFindHG',
            icon: 'https://icons.iconarchive.com/icons/zerode/plump/16/Search-icon.png',
            listeners: {
              click: (btn) => {
                btn.setDisabled(true);
                let proxy = storeAllGame.getProxy();
                cdnImageHost = Ext.getCmp('cbbUrlCDN').getRawValue();
                proxy.setUrl(cdnImageHost + pathSyncGame);
                storeAllGame.load({
                  callback: function (records, operation, success) {
                    btn.setDisabled(false);
                  },
                });
                allGameGrid.setTitle(
                  Ext.getCmp('txtNameWLsDomainHG').getRawValue() +
                    "'s All Game Images"
                );
              },
            },
          },
          {
            xtype: 'button',
            id: 'btnSyncAll',
            text: 'Sync All Games Images',
            dock: 'right',
            iconCls: 'syncCls',
            listeners: {
              click: (btn) => {
                if (storeAllGame.getCount() > 0) {
                  btn.setIconCls('spinner');
                  btn.setDisabled(true);
                  syncAllImages(0, storeAllGame, () => {
                    btn.setIconCls('syncCls');
                    btn.setDisabled(false);
                    alert('Sync All Images Done!');
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
        text: 'GameListID',
        tooltip: 'GameListID',
        width: 120,
        dataIndex: 'GameListID',
      },
      {
        text: 'Image Base64',
        tooltip: 'Image from base64 string',
        dataIndex: 'imgBase64Str',
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
        text: 'Image File CDN',
        tooltip: 'Image File from CDN',
        dataIndex: 'imgBase64Str',
        width: 150,
        tdCls: 'headerIcons',
        renderer: (v, _, r) => {
          return v !== '' ? `<img style="width:100%; height:100%" src="${
            cdnImageHost +
            '/allgames/' +
            r.get('GameListID') +
            '.' +
            r.get('ImageType')
          }?v=${Date.now()}" />`: 'NULL'
        },
      },
      {
        xtype: 'actioncolumn',
        width: 55,
        tooltip: 'Sync Image from DB(Base64) to CDN(File)',
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
                  gameListId: record.get('GameListID'),
                  imageType: record.get('ImageType'),
                  strBase64: record.get('imgBase64Str'),
                },
                (response) => {
                  let rs = JSON.parse(response.responseText);
                  record.set('syncSpinner', false);
                  let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
                  record.set('imgCDN', img);
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
function syncImage({ gameListId, imageType, strBase64 }, done) {
  Ext.Ajax.request({
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token-sync-image-cdn'),
    },
    method: 'PUT',
    url: cdnImageHost + '/allgames/update',
    jsonData: {
      GameListID: gameListId,
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
function syncAllImages(currentIndex, store, done) {
  var grid = Ext.getCmp('allGameGrid');
  if (currentIndex < store.getCount()) {
    let record = store.getAt(currentIndex);
    record.set('syncSpinner', true);
    grid.setDisabled(true);
    var view = grid.getView();
    view.scrollBy(0, view.getEl().getHeight());
    syncImage(
      {
        gameListId: record.get('GameListID'),
        imageType: record.get('ImageType'),
        strBase64: record.get('imgBase64Str'),
      },
      (response) => {
        let rs = JSON.parse(response.responseText);
        record.set('syncSpinner', false);
        let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
        record.set('imgCDN', img);
        store.commitChanges();
        currentIndex = currentIndex + 1;
        syncAllImages(currentIndex, store, done);
      }
    );
  } else {
    grid.setDisabled(false);
    if (done) done();
  }
}
