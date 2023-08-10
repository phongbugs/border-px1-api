const log = console.log,
  CryptoJS = require('crypto-js'),
  crawler = require('../crawler'),
  allServers = require('./servers'),
  fetch = require('node-fetch'),
  findServerIdByIp = (ip, domainType) =>
    allServers(domainType).find((server) => server.Name === ip).ID,
  fetchBackendId = async (req, res) => {
    try {
      let serverIp = req.params.serverIp,
        domainType = req.params.domainType,
        // cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1',
        // cookie = req.cookies[cookieName];
        cookie = req.headers.authorization.split(' ')[1];
      //log('serverId: %s', serverId);
      //log('domainType: %s', domainType);
      if (cookie) {
        let result = await crawler.fetchBackendId(
          findServerIdByIp(serverIp, domainType),
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
  getValidDomain = async (req, res) => {
    try {
      let domainType = req.params.domainType.toUpperCase(),
        whitelabelName = req.params.whitelabelName.toUpperCase(),
        client = req.params.client.toUpperCase();
      let validDomain =
        global.VALID_DOMAINS[client][domainType][whitelabelName];
      if (validDomain) res.send({ success: true, domain: validDomain });
      else res.send({ success: false, message: 'domain does not exist' });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  getValidDomainFrom3rdp = async (req, res) => {
    try {
      console.log(req.params);
      let domainType = req.params.domainType.toUpperCase(),
        whitelabelName = req.params.whitelabelName.toUpperCase(),
        client = req.params.client.toUpperCase();
      const response = await fetch(
        'https://border-px1-api.xyz' +
          '/info/valid-domain/' +
          client +
          '/' +
          domainType +
          '/' +
          whitelabelName
      );
      let result = JSON.parse(await response.text());
      res.send(result);
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  updateValidDomains = async (req, res) => {
    try {
      let domainType = req.params.domainType.toUpperCase(),
        client = req.params.client.toUpperCase(),
        domains = JSON.parse(req.body.domains);
      //global.VALID_DOMAINS[client][domainType] = domains;
      for (whitelabelName in domains)
        global.VALID_DOMAINS[client][domainType][whitelabelName] =
          domains[whitelabelName];
      res.send({ success: true, message: 'Domains updated' });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  fetchDomains = async (req, res) => {
    try {
      let domainType = req.params.domainType,
        sites = domainType === 'ip' ? global.sitesIp : global.sites;
      if (sites) {
        let siteName = req.params.siteName,
          siteId = sites.find((site) => site.name === siteName).id,
          // cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1',
          // cookie = req.cookies[cookieName];
          cookie = req.headers.authorization.split(' ')[1];
        // log(siteName);
        // log(siteId);
        log(cookie);
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
      log(error);
      let message = '';
      if (
        error.message.indexOf("Cannot read property 'id' of undefined") > -1 ||
        error.message.indexOf('Cannot read properties of undefined') > -1
      )
        message = 'White label not found';
      res.send({
        success: false,
        message: message !== '' ? message : error.message,
      });
    }
  },
  fetchFolderPath = async (req, res) => {
    try {
      let url =
        decodeURIComponent(req.query['url']) +
        '/Public/GetDateModifiedOfFiles.aspx?' +
        new URLSearchParams({
          cmd: 'GetModifiedDate',
          files: '',
        });
        log(url)
      const response = await fetch(url);
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
  fetchServers = async (req, res) => {
    try {
      let domainType = req.params.domainType,
        sites = domainType === 'ip' ? global.sitesIp : global.sites;
      if (sites) {
        let siteName = req.params.siteName,
          domainType = req.params.domainType,
          sites = domainType === 'ip' ? global.sitesIp : global.sites,
          siteId = sites.find((site) => site.name === siteName).id,
          //cookieName = domainType === 'ip' ? 'border-px1-ip' : 'border-px1',
          //cookie = req.cookies[cookieName];
          cookie = req.headers.authorization.split(' ')[1];
        if (cookie) {
          let result = await crawler.fetchServerBySiteId(
            siteId,
            [decodeURIComponent(cookie)],
            domainType
          );
          if (result.success)
            res.send({
              success: true,
              servers: result.servers,
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
  getServerInfo = async (req, res) => {
    try {
      let info = {
        hostName: global.hostBorderPx1Name || 'undefined',
        cookieName: global.cookie || 'undefined',
        hostIp: global.hostBorderPx1Ip || 'undefined',
        cookieIp: global.cookieIp || 'undefined',
        sites: global.sites || [],
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
  getValidDomain,
  updateValidDomains,
  fetchFolderPath,
  fetchMobileJson,
  getServerInfo,
  fetchServers,
  getValidDomainFrom3rdp,
};
