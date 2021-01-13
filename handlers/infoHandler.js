const log = console.log,
  CryptoJS = require('crypto-js'),
  crawler = require('../crawler'),
  allServers = require('./servers.map')['allServers'],
  fetch = require('node-fetch'),
  findServerIdByIp = (ip) => allServers.find((server) => server.Name === ip).ID,
  fetchBackendId = async (req, res) => {
    try {
      let serverIp = req.params.serverIp,
        domainType = req.params.domainType,
        cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1',
        cookie = req.cookies[cookieName];
      //log('serverId: %s', serverId);
      //log('domainType: %s', domainType);
      if (cookie) {
        let result = await crawler.fetchBackendId(
          findServerIdByIp(serverIp),
          [decodeURIComponent(cookie)],
          domainType
        );
        if (result.success)
          res.send({
            success: true,
            backendId: result.backendId,
          });
        else res.send({ success: false, message: result.message });
      } else
        res.send({
          success: false,
          message: 'Access denied, please login BORDER PX1 site',
        });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  fetchDomains = async (req, res) => {
    try {
      if (global.sites) {
        let siteName = req.params.siteName,
          domainType = req.params.domainType,
          sites = domainType === 'ip' ? global.sitesIp : global.sites,
          siteId = sites.find((site) => site.name === siteName).id,
          cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1',
          cookie = req.cookies[cookieName];
        // log(siteName);
        // log(siteId);
        // log(cookie);
        if (cookie) {
          //log('%s:%s', cookieName, cookie);
          let result = await crawler.fetchDomainsBySiteId(
            siteId,
            [decodeURIComponent(cookie)],
            domainType
          );
          if (result.success)
            res.send({
              success: true,
              domains: CryptoJS.AES.encrypt(
                JSON.stringify(
                  result.domains.map((domain) => {
                    domain['folderPath'] = '';
                    return domain;
                  })
                ),
                'The domain data'
              ).toString(),
            });
          else res.send({ success: false, message: result.message });
        } else
          res.send({
            success: false,
            message: 'Cookie has expired',
          });
      } else
        res.send({
          success: false,
          message: 'Global sites data has not had data yet !',
        });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  fetchFolderPath = async (req, res) => {
    try {
      let url =
        decodeURIComponent(req.query['url']) +
        '/Public/GetDateModifiedOfFiles.aspx?';
      const response = await fetch(
        url +
          new URLSearchParams({
            cmd: 'GetModifiedDate',
            files: '',
          })
      );
      let text = (await response.text())
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '');
      //log(text);
      res.send(JSON.parse(text));
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  fetchMobileJson = async (req, res) => {
    try {
      let url = decodeURIComponent(req.query['url']);
      log('url:%s', url);
      const response = await fetch(url);
      //log(response.headers.raw()['bpx-id']);
      let bpxId = response.headers.raw()['bpx-id'];
      res.send({ success: bpxId ? true : false, message: bpxId });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  getServerInfo = async (req, res) => {
    try {
      let info = {
        hostName: global.hostBorderPx1Name || 'undefined',
        cookieName: global.cookie || 'undefined',
        hostIp: global.hostBorderPx1Ip || 'undefined',
        cookieIp: global.cookieIp || 'undefined',
      };

      if (global.hostBorderPx1Name)
        info.isExpiredCookieName = !(await crawler.isAuthenticatedCookies([
          global.cookie,
        ]));
      if (global.hostBorderPx1Ip)
        info.isExpiredCookieIp = !(await crawler.isAuthenticatedCookies([
          global.cookieIp,
        ]));

      res.send(info);
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  };
module.exports = {
  fetchBackendId,
  fetchDomains,
  fetchFolderPath,
  fetchMobileJson,
  getServerInfo,
};
