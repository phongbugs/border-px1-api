const getCmp = function (query) {
    return Ext.ComponentQuery.query(query)[0];
  },
  createTab = ({ itemIdTabPanel, title, icon, htmlFile }) => {
    var tabPanel = getCmp(itemIdTabPanel);
    var tab = tabPanel.add({
      xtype: 'component',
      title: title,
      icon: icon,
      closable: true,
      autoEl: {
        tag: 'iframe',
        src: htmlFile,
        style: 'border:none',
      },
    });
    tabPanel.setActiveTab(tab);
  };
Ext.define('KitchenSink.view.layout.Border', {
  extend: 'Ext.panel.Panel',
  xtype: 'layout-border',
  requires: ['Ext.layout.container.Border'],
  profiles: {
    classic: {
      itemHeight: 100,
    },
    neptune: {
      itemHeight: 100,
    },
    graphite: {
      itemHeight: 120,
    },
    'classic-material': {
      itemHeight: 120,
    },
  },
  layout: 'border',
  width: 500,
  height: 400,
  cls: Ext.baseCSSPrefix + 'shadow',

  bodyBorder: false,

  defaults: {
    collapsible: true,
    split: true,
    bodyPadding: 10,
  },
  listeners: {
    afterrender: () => {
      createTab({
        itemIdTabPanel: '#mainContent',
        title: 'CLG WLs Management',
        iconCls: 'users',
        icon: 'https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/16/Docs-icon.png',
        htmlFile: '/7.html',
      });
    },
  },
  items: [
    {
      xtype: 'panel',
      collapsible: false,
      //header: false,
      split: false,
      title: 'Menu',
      icon: 'https://icons.iconarchive.com/icons/icons8/windows-8/16/Very-Basic-Menu-icon.png',
      region: 'west',
      width: 200,
      height: 500,
      bodyPadding: 0,
      bodyBorder: 'none',
      border: 0,
      items: {
        xtype: 'menu',
        plain: true,
        floating: false,
        border: 'none',
        items: [
          {
            text: 'CLG WLs Management',
            iconCls: 'users',
            icon: 'https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/16/Docs-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/7.html',
              });
            },
          },
          {
            text: 'Domain Infomations',
            icon: 'https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/16/Docs-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/domains.html',
              });
            },
          },
          {
            text: 'All Games Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-A-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncAllGame.html',
              });
            },
          },
          {
            text: 'Header Games Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-H-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncHeaderGame.html',
              });
            },
          },
          {
            text: 'Lobby Games Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-L-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncLobbyGame.html',
              });
            },
          },
          {
            icon: 'https://icons.iconarchive.com/icons/saki/nuoveXT-2/16/Apps-session-logout-icon.png',
            text: 'Logout',
            handler: (btn, event) => {
              btn.setIconCls('spinner');
              localStorage.removeItem('border-px1-api-cookie');
              setTimeout(() => location.reload(), 1000);
            },
          },
        ],
      },
    },
    {
      xtype: 'tabpanel',
      collapsible: false,
      region: 'center',
      itemId: 'mainContent',
      bodyPadding: 0,
      bodyBorder: 'none',
      border: 0,
    },
  ],
  renderTo: 'app',
});
Ext.onReady(function () {
  Ext.create('KitchenSink.view.layout.Border', {
    width:
      Ext.getBody().getViewSize().width < 1388
        ? 1388
        : Ext.getBody().getViewSize().width,
    height: Ext.getBody().getViewSize().height,
  });
});
