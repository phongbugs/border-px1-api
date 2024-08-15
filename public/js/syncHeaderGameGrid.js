﻿Ext.define('HeaderGame', {
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
    { name: 'GameTypeMenuIconCDN', type: 'string' },
    { name: 'GameTypeSubMenuIconCDN', type: 'string' },
    { name: 'HasSubGame', type: 'bool' },
    { name: 'ImageType', type: 'string' },
    { name: 'ImageTypeSubMenu', type: 'string' },
    { name: 'HeaderLastUpdatedTime', type: 'date', dateFormat: 'c' },
    { name: 'SubMenuLastUpdatedTime', type: 'date', dateFormat: 'c' },
  ],
});
var tokenSync = '';
var cdnImageHost =
  localStorage.getItem('cdnImageHost') || 'https://imgtest.playliga.com';
var pathSyncGame = '/sync/headergames';
var CTId = getQueryParam('CTId');
var renderBase64StrToImg = (imageType, strBase64) => {
  if (strBase64 !== '') {
    if (imageType === 'svg') {
      imageType = 'svg+xml';
      return `<img style="width:70%; height:70%" src="data:image/${imageType};base64, ${strBase64}" />`;
    }
    return `<img src="data:image/${imageType};base64, ${strBase64}" />`;
  }
  return 'NULL';
};
let storeHeaderGame = Ext.create('Ext.data.Store', {
  model: 'HeaderGame',
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
      root: 'menus',
      totalProperty: 'totalCount',
      transform: {
        fn: function (data) {
          if (data.success) {
            data.menus = data.menus.map((record) => {
              let subMenuIcon = data.submenuIcons[record['HGameId']];
              record['GameTypeSubMenuIcon'] = subMenuIcon;
              record['ImageTypeSubMenu'] = 'png';
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
  let headerGameGrid = Ext.create('Ext.grid.Panel', {
    renderTo: 'app',
    id: 'headerGameGrid',
    store: storeHeaderGame,
    header: false,
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
            hidden: true,
            listeners: {
              click: () => {
                let proxy = storeHeaderGame.getProxy();
                cdnImageHost = Ext.getCmp('cbbUrlCDN').getRawValue();
                proxy.setUrl(cdnImageHost + pathSyncGame);
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
            listeners: {
              keyup: function (field, e) {
                field.setValue(field.getValue().toUpperCase());
              },
            },
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
                let proxy = storeHeaderGame.getProxy();
                cdnImageHost = Ext.getCmp('cbbUrlCDN').getRawValue();
                proxy.setUrl(cdnImageHost + pathSyncGame);
                CTId = Ext.getCmp('txtNameWLsDomainHG').getValue();
                if (CTId && !isNaN(CTId)) {
                  proxy.setExtraParams({
                    CTId: CTId,
                  });
                  storeHeaderGame.load({
                    callback: function (records, operation, success) {
                      btn.setDisabled(false);
                    },
                  });
                  headerGameGrid.setTitle(
                    Ext.getCmp('txtNameWLsDomainHG').getRawValue() +
                      "'s Header Game Images"
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
            id: 'btnSyncAllMenu', 
            text: 'Sync All Menu Header Images', 
            dock: 'right', 
            iconCls: 'syncCls', 
            listeners: { 
              click: (btn) => { 
                if (storeHeaderGame.getCount() > 0) { 
                  btn.setIconCls('spinner'); 
                  btn.setDisabled(true); 
                  syncAllMenuHeaderImages(0, storeHeaderGame, () => { 
                    btn.setIconCls('syncCls'); 
                    btn.setDisabled(false); 
                    alert('Sync All Menu Header Images Done!'); 
                  }); 
                } else alert('Please search before sync !'); 
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
        tooltip: 'Game Menu Display Name',
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
        tooltip: 'Header Game Id',
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
        tooltip: 'OrderId',
      },
      {
        text: 'Hot',
        width: 50,
        dataIndex: 'IsHotGame',
        tooltip: 'Is Hot Game',
        renderer: (v, _, r) => v ? '<img src="images/hot-icon.gif" style="width: 36px;height: 36px">' : 'false'
      },
      {
        text: 'MenuBase64',
        width: 120,
        dataIndex: 'GameTypeMenuIcon',
        tooltip: 'Menu Icon (Base64)',
        tdCls: 'headerIcons',
        renderer: (v, _, r) => renderBase64StrToImg(r.get('ImageType'), v),
      },
      {
        text: 'SMenuBase64',
        width: 130,
        dataIndex: 'GameTypeSubMenuIcon',
        tdCls: 'headerIcons',
        tooltip: 'SubMenu Icon (Base64)',
        renderer: (v, _, r) => {
          let imageType = r.get('ImageTypeSubMenu');
          if (imageType === 'svg') {
            imageType = 'svg+xml';
            return `<img style="width:70%; height:70%" src="data:image/${imageType};base64, ${v}" />`;
          }
          if (v !== '')
            return `<img style="width:70%; height:70%" src="data:image/${r.get(
              'ImageTypeSubMenu'
            )};base64, ${v}" />`;
          return 'NULL';
        },
      },
      {
        text: 'MenuCDN',
        tooltip: '',
        dataIndex: 'GameTypeMenuIcon',
        tdCls: 'headerIcons',
        tooltip: 'Menu Icon (File)',
        width: 120,
        renderer: (v, _, r) => {
          if (v !== '')
            return `<img src="${
              cdnImageHost +
              '/headergames/' +
              r.get('CTId') +
              '/MenuIcon_' +
              r.get('GameType') +
              '.' +
              r.get('ImageType')
            }?v=${Date.now()}" />`;
          return 'NULL';
        },
      },
      {
        text: 'SMenuCDN',
        tooltip: '',
        dataIndex: 'GameTypeSubMenuIcon',
        tdCls: 'headerIcons',
        tooltip: 'SubMenu Icon (File)',
        width: 130,
        renderer: (v, _, r) => {
          if (v !== '') {
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
              r.get('ImageTypeSubMenu')
            }?v=${Date.now()}" />`;
          }
          return 'NULL';
        },
      },
      {
        text: 'HSG',
        width: 50,
        dataIndex: 'HasSubGame',
        hidden: true,
      },
      {
        text: 'IType',
        width: 70,
        dataIndex: 'ImageType',
        hidden: true,
      },
      {
        xtype: 'actioncolumn',
        width: 90,
        tooltip: 'Sync Menu Images',
        text: 'Sync Menu',
        dataIndex: 'GameTypeMenuIconCDN',
        items: [
          {
            iconCls: 'syncCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              if (record.get('GameTypeMenuIcon') === '') return '';
              var isSpinning = record.get('syncSpinner');
              return isSpinning ? 'spinner' : 'syncCls';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              if (record.get('GameTypeMenuIcon') === '') {
                alert('Base64 String is blank');
                return;
              }
              record.set('syncSpinner', true);
              syncImage(
                {
                  HGameId: record.get('HGameId').toString(),
                  GameName: record.get('GameName'),
                  GameType: record.get('GameType'),
                  CTId: record.get('CTId').toString(),
                  imageType: record.get('ImageType'),
                  strBase64: record.get('GameTypeMenuIcon'),
                  isHeaderSubMenuImage: false,
                },
                (response) => {
                  let rs = JSON.parse(response.responseText);
                  if(!rs.success) 
                    alert(rs.message)
                  record.set('syncSpinner', false);
                  let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
                  record.set('GameTypeMenuIconCDN', img);
                  grid.getStore().commitChanges();
                }
              );
            },
          },
        ],
      },
      {
        xtype: 'actioncolumn',
        width: 100,
        tooltip: 'Sync Sub Menu Images',
        text: 'Sync SMenu',
        dataIndex: 'GameTypeSubMenuIconCDN',
        items: [
          {
            iconCls: 'syncCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              if (record.get('GameTypeSubMenuIcon') === '') return '';
              var isSpinning = record.get('syncSpinnerSMN');
              return isSpinning ? 'spinner' : 'syncCls';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              if (record.get('GameTypeSubMenuIcon') === '') {
                alert('Base64 String is blank');
                return;
              }
              record.set('syncSpinnerSMN', true);
              syncImage(
                {
                  HGameId: record.get('HGameId').toString(),
                  GameName: record.get('GameName'),
                  GameType: record.get('GameType'),
                  CTId: record.get('CTId').toString(),
                  imageType: record.get('ImageType'),
                  strBase64: record.get('GameTypeSubMenuIcon'),
                  isHeaderSubMenuImage: true,
                },
                (response) => {
                  let rs = JSON.parse(response.responseText);
                  if(!rs.success) 
                    alert(rs.message)
                  record.set('syncSpinnerSMN', false);
                  let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
                  record.set('GameTypeSubMenuIconCDN', img);
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

function syncAllMenuHeaderImages(currentIndex, store, done) {
  var grid = Ext.getCmp('headerGameGrid');
  if (currentIndex < store.getCount()) {
    let record = store.getAt(currentIndex);
    record.set('syncSpinner', true);
    grid.setDisabled(true);
    var view = grid.getView();
    view.scrollBy(0, view.getEl().getHeight());
    syncImage(
      {
        HGameId: record.get('HGameId').toString(),
        GameName: record.get('GameName'),
        GameType: record.get('GameType'),
        CTId: record.get('CTId').toString(),
        imageType: record.get('ImageType'),
        isHeaderSubMenuImage: false,
        strBase64: record.get('GameTypeMenuIcon'),
      },
      (response) => {
        if (response) {
          let rs = JSON.parse(response.responseText);
          let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
          record.set('GameTypeMenuIconCDN', img);
          store.commitChanges();
        }
        record.set('syncSpinner', false);
        currentIndex = currentIndex + 1;
        syncAllMenuHeaderImages(currentIndex, store, done);
      }
    );
  } else{
    grid.setDisabled(false);
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
        GameType: record.get('GameType'),
        CTId: record.get('CTId').toString(),
        imageType: record.get('ImageType'),
        isHeaderSubMenuImage: true,
        strBase64: record.get('GameTypeSubMenuIcon'),
      },
      (response) => {
        if (response) {
          let rs = JSON.parse(response.responseText);
          let img = `<img src="${rs.imagePath}?v=${Date.now()}" />`;
          record.set('GameTypeSubMenuIconCDN', img);
          store.commitChanges();
        }
        record.set('syncSpinnerSMN', false);
        currentIndex = currentIndex + 1;
        syncAllSubMenuHeaderImages(currentIndex, store, done);
      }
    );
  } else if (done) done();
}
