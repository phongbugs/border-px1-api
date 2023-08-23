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
  localStorage.getItem('cdnImageHost') ||
  (location.host.indexOf('localhost') > -1
    ? 'http://localhost/cdn'
    : 'https://imgtest.playliga.com');
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
    url: cdnImageHost + '/sync/headergames',
    extraParams: {
      CTId: CTId,
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
              //let isHeaderSubMenuImage =
              //  (record['GameTypeMenuIcon'] === '' && record['HasSubGame']) || ;
              //if (isHeaderSubMenuImage) {
              record['GameTypeSubMenuIcon'] = subMenuIcon;
              record['ImageTypeSubMenu'] = 'png';
              //}
              return record;
            });
          }
          log(data);
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
    header: false,
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
                cdnImageHost =  Ext.getCmp('cbbUrlCDN').getRawValue()
                proxy.setUrl(
                  cdnImageHost + pathSyncGame
                );
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
                cdnImageHost =  Ext.getCmp('cbbUrlCDN').getRawValue()
                proxy.setUrl(
                  cdnImageHost + pathSyncGame
                );
                proxy.setExtraParams({
                  CTId: Ext.getCmp('txtNameWLsDomainHG').getValue(),
                });
                storeHeaderGame.load();
                headerGameGrid.setTitle(
                  Ext.getCmp('txtNameWLsDomainHG').getRawValue() +
                    "'s Header Game Images"
                );
                Ext.getCmp('chkIsSharedSubmenuIcon').setValue(
                  getISharedHeaderSubMenuImage(
                    Ext.getCmp('txtNameWLsDomainHG').getValue()
                  )
                );
              },
            },
          },
          {
            xtype: 'checkboxfield',
            id: 'chkIsSharedSubmenuIcon',
            boxLabel: 'Is Shared Submenu Icon',
            checked: getISharedHeaderSubMenuImage(CTId),
            //disabled:true
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
        text: 'MenuBase64Str',
        width: 120,
        dataIndex: 'GameTypeMenuIcon',
        tdCls: 'headerIcons',
        renderer: (v, _, r) => renderBase64StrToImg(r.get('ImageType'), v),
      },
      {
        text: 'SMenuBase64Str',
        width: 130,
        dataIndex: 'GameTypeSubMenuIcon',
        tdCls: 'headerIcons',
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
        width: 55,
        tooltip: 'Sync Menu Images',
        text: 'SMenu',
        dataIndex: 'GameTypeMenuIconCDN',
        items: [
          {
            iconCls: 'syncCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              if(record.get('GameTypeMenuIcon') === '')
              return ''
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
                  record,
                  imageType: record.get('ImageType'),
                  strBase64: record.get('GameTypeMenuIcon'),
                  isHeaderSubMenuImage: false,
                },
                (response) => {
                  let rs = JSON.parse(response.responseText);
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
        width: 55,
        tooltip: 'Sync Sub Menu Images',
        text: 'SMenu',
        dataIndex: 'GameTypeSubMenuIconCDN',
        items: [
          {
            iconCls: 'syncCls',
            getClass: function (value, meta, record, rowIndex, colIndex) {
              if(record.get('GameTypeSubMenuIcon') === '') 
                return ''
              var isSpinning = record.get('syncSpinnerCDN');
              return isSpinning ? 'spinner' : 'syncCls';
            },
            handler: function (grid, rowIndex, colIndex, item, e, record) {
              if (record.get('GameTypeSubMenuIcon') === '') {
                alert('Base64 String is blank');
                return;
              }
              record.set('syncSpinnerCDN', true);
              syncImage(
                {
                  record,
                  imageType: record.get('ImageTypeSubMenu'),
                  strBase64: record.get('GameTypeSubMenuIcon'),
                  isHeaderSubMenuImage: true,
                },
                (response) => {
                  let rs = JSON.parse(response.responseText);
                  record.set('syncSpinnerCDN', false);
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
  { record, imageType, strBase64, isHeaderSubMenuImage },
  done
) {
  Ext.Ajax.request({
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token-sync-image-cdn'),
    },
    method: 'POST',
    url: cdnImageHost + '/headergames/update',
    jsonData: {
      HGameId: record.get('HGameId').toString(),
      GameName: record.get('GameName'),
      GameType: record.get('GameType'),
      CTId: record.get('CTId').toString(),
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
}
