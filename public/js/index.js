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
  },
  isFEAccount = () => localStorage.getItem('username') === 'feadmin';
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
      //if(isFEAccount())
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
      title: 'Menu of ' + localStorage.getItem('username'),
      icon: 'https://icons.iconarchive.com/icons/icons8/windows-8/16/Very-Basic-Menu-icon.png',
      region: 'west',
      width: 222,
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
            //hidden: !isFEAccount()
          },
          {
            text: 'All Games WL Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-A-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncAllGame.html',
              });
            },
            //hidden: !isFEAccount()
          },
          {
            text: 'All Games All WLs Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-A-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncAllGameAllWLs.html',
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
            //hidden: !isFEAccount()
          },
          {
            text: 'Header Menu All WLs Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-H-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncHeaderGameAllWLs.html',
              });
            },
          },
          {
            text: 'Header SubMenu All WLs Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-H-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncHeaderGameSubMenuAllWLs.html',
              });
            },
          },
          {
            text: 'Lobby Games All WLs Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-L-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncLobbyGameAllWLs.html',
              });
            },
          },
          {
            text: 'Lobby Games WL Sync',
            icon: 'https://icons.iconarchive.com/icons/ariil/alphabet/16/Letter-L-icon.png',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: '/syncLobbyGame.html',
              });
            },
            //hidden: !isFEAccount()
          },
          {
            text: 'SP Member docs',
            iconCls: 'helpCls',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: CryptoJS.AES.decrypt(
                  'U2FsdGVkX1+a3TY2Zu0/de1UczozmFhcFOIEWplCLQZK5aUhXkjz9byTbbcNyRLwfua4m6pM0z0dSa8SZ9GU3OfuhktX/f71qqjSJSD/q4jXMGwD/8PRL0jh4UYH9rKH0b0kpUvTY37G4ZMGan+7ZVLITd2JdqVMePax5JynQLY4KSyqq2qljqZeW2LzeyrN',
                  location.hostname
                ).toString(CryptoJS.enc.Utf8),
              });
            },
            hidden: isFEAccount()
          },
          {
            text: 'SP Agent docs',
            iconCls: 'helpCls',
            handler: (cmp) => {
              createTab({
                itemIdTabPanel: '#mainContent',
                title: cmp.text,
                icon: cmp.icon,
                htmlFile: CryptoJS.AES.decrypt(
                  'U2FsdGVkX19qOAsLt5+SfyPMtkBhO3XTs7QSOhb5078R/glbOgg9TZYFmiR9IHIYmHKvzI+XZv+M5ebEuwSE5dgKMDODztOd5WOGn7/QaifVg8Bg530blvBJowlGfpzWkhXCT0TzgUMygQtLoPPw+vKLXYv3tqEuocf0G11XpxmciG89gUvWQxCzU4unvpg8',
                  location.hostname
                ).toString(CryptoJS.enc.Utf8),
              });
            },
            hidden: isFEAccount()
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
