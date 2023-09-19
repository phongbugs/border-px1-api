Ext.define('HeaderGame', {
  extend: 'Ext.data.Model',
  fields: [
    { name: 'HGameId', type: 'int' },
    { name: 'GameName', type: 'string' },
    { name: 'GameIcon', type: 'string' },
    { name: 'GameIconCDN', type: 'string' },
    { name: 'ImageType', type: 'string' },
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
var pathSyncGame = '/sync/headergamessubmenuallwls';
let storeHeaderGame = Ext.create('Ext.data.Store', {
  model: 'HeaderGame',
  proxy: {
    type: 'ajax',
    url: cdnImageHost + pathSyncGame,
    timeout: 60000,
    headers: {
      Authorization: 'Basic ' + localStorage.getItem('border-px1-api-cookie'),
    },
    reader: {
      type: 'json',
      root: 'submenuIcons',
      //totalProperty: 'totalCount',
      transform: {
        fn: function (data) {
          if (data.success) {
            console.log();
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
  let headerGameGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'headerGameGrid',
    store: storeHeaderGame,
    header: false,
    //title: getQueryParam('WL') + `'s Header Game Images`,
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
                let proxy = storeHeaderGame.getProxy();
                cdnImageHost = Ext.getCmp('cbbUrlCDN').getRawValue();
                proxy.setUrl(cdnImageHost + pathSyncGame);
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
                ['https://imguat.playliga.com', 'https://imguat.playliga.com'],
                ['https://imgshare.iuf-cfl.cloud/', 'https://imgshare.iuf-cfl.cloud/'],
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
                let proxy = storeHeaderGame.getProxy();
                cdnImageHost = Ext.getCmp('cbbUrlCDN').getRawValue();
                proxy.setUrl(cdnImageHost + pathSyncGame);
                storeHeaderGame.load({
                  callback: function (records, operation, success) {
                    btn.setDisabled(false);
                  },
                });
              },
            },
          },
          {
            xtype: 'button',
            id: 'btnSyncAllSubMenu',
            text: 'Sync All Sub Menu Header Images',
            dock: 'right',
            iconCls: 'syncCls',
            listeners: {
              click: (btn) => {
                if (storeHeaderGame.getCount() > 0) {
                  btn.setIconCls('spinner');
                  btn.setDisabled(true);
                  syncAllSubMenuHeaderImages(0, storeHeaderGame, () => {
                    btn.setIconCls('syncCls');
                    btn.setDisabled(false);
                    alert('Sync All Submenu Header Images Done!');
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
        text: 'HGameId',
        width: 100,
        dataIndex: 'HGameId',
        tooltip: 'Header Game Id',
      },
      {
        text: 'Game Name',
        width: 100,
        dataIndex: 'GameName',
      },
      {
        text: 'Image Base64',
        width: 130,
        dataIndex: 'GameIcon',
        tdCls: 'headerIcons',
        renderer: (v, _, r) => {
          let imageType = r.get('ImageType');
          if (imageType === 'svg') {
            imageType = 'svg+xml';
            return `<img style="width:70%; height:70%" src="data:image/${imageType};base64, ${v}" />`;
          }
          if (v !== '')
            return `<img style="width:70%; height:70%" src="data:image/${r.get(
              'ImageType'
            )};base64, ${v}" />`;
          return 'NULL';
        },
      },
      {
        text: 'Image CDN',
        tooltip: '',
        dataIndex: 'GameIcon',
        tdCls: 'headerIcons',
        tooltip: 'SubMenu Icon (File)',
        width: 120,
        renderer: (v, _, r) => {
          if (v !== '') {
            return `<img style="width:70%; height:70%" src="${
              cdnImageHost +
              '/headergames' +
              '/SubMenuIcon_' +
              r.get('HGameId') +
              '_' +
              r.get('GameName') +
              '.' +
              r.get('ImageType')
            }?v=${Date.now()}" />`;
          }
          return 'NULL';
        },
      },
      {
        text: 'ImageType',
        width: 100,
        dataIndex: 'ImageType',
        hidden: true,
      },
      {
        xtype: 'actioncolumn',
        width: 100,
        tooltip: 'Sync Sub Menu Images',
        text: 'Sync',
        dataIndex: 'GameIcon',
        items: [
          {
            iconCls: 'syncCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              if (record.get('GameIcon') === '') return '';
              var isSpinning = record.get('syncSpinnerSMN');
              return isSpinning ? 'spinner' : 'syncCls';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              if (record.get('GameIcon') === '') {
                alert('Base64 String is blank');
                return;
              }
              record.set('syncSpinnerSMN', true);
              syncImage(
                {
                  HGameId: record.get('HGameId').toString(),
                  GameName: record.get('GameName'),
                  CTId: record.get('CTId').toString(),
                  imageType: record.get('ImageType'),
                  strBase64: record.get('GameIcon'),
                  isHeaderSubMenuImage: true,
                },
                (response) => {
                  let rs = JSON.parse(response.responseText);
                  if (!rs.success) alert(rs.message);
                  record.set('syncSpinnerSMN', false);
                  let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
                  record.set('GameIconCDN', img);
                  grid.getStore().commitChanges();
                }
              );
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
function syncImage(
  {
    HGameId,
    GameName,
    GameType,
    CTId,
    imageType,
    strBase64,
    isHeaderSubMenuImage,
  },
  done
) {
  if (strBase64 !== '')
    Ext.Ajax.request({
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token-sync-image-cdn'),
      },
      method: 'POST',
      url: cdnImageHost + '/headergames/update',
      jsonData: {
        HGameId: HGameId,
        GameName: GameName,
        GameType: GameType,
        CTId: CTId,
        ImageType: imageType,
        IsHeaderSubMenuImage: isHeaderSubMenuImage,
        strBase64: strBase64,
      },
      success: function (response) {
        if (done) done(response);
      },
      failure: function (response) {
        Ext.Msg.alert('Error', 'Sync CDN Images function');
      },
    });
  else {
    if (done) done();
  }
}

function syncAllSubMenuHeaderImages(currentIndex, store, done) {
  if (currentIndex < store.getCount()) {
    let record = store.getAt(currentIndex);
    record.set('syncSpinnerSMN', true);
    var grid = Ext.getCmp('headerGameGrid');
    var view = grid.getView();
    view.scrollBy(0, view.getEl().getHeight());
    syncImage(
      {
        HGameId: record.get('HGameId').toString(),
        GameName: record.get('GameName'),
        imageType: record.get('ImageType'),
        isHeaderSubMenuImage: true,
        strBase64: record.get('GameIcon'),
      },
      (response) => {
        if (response) {
          let rs = JSON.parse(response.responseText);
          let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
          record.set('GameIconCDN', img);
          store.commitChanges();
        }
        record.set('syncSpinnerSMN', false);
        currentIndex = currentIndex + 1;
        syncAllSubMenuHeaderImages(currentIndex, store, done);
      }
    );
  } else if (done) done();
}
