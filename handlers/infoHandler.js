const log = console.log,
  CryptoJS = require('crypto-js'),
  crawler = require('../crawler'),
  sites = JSON.parse(CryptoJS.AES.decrypt(
    require('./sites.map').data,
    'The map data'
  ).toString(CryptoJS.enc.Utf8)),
  allServers = require('./servers.map')['allServers'],
  fetch = require('node-fetch'),
  findServerIdByIp = (ip) => allServers.find((server) => server.Name === ip).ID,
  fetchBackendId = async (req, res) => {
    try {
      let serverIp = req.params.serverIp,
        cookie = req.cookies['border-px1'];
      //log('serverId: %s', serverId);
      if (cookie) {
        let result = await crawler.fetchBackendId(findServerIdByIp(serverIp), [
          decodeURIComponent(cookie),
        ]);
        if (result.success)
          res.send({
            success: true,
            backendId: result.backendId,
          });
        else res.send({ success: false, message: result.message });
      } else
        res.send({
          success: false,
          message:
            'Access denied, please login border px1 site - cookie:' + cookie,
        });
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  },
  fetchDomains = async (req, res) => {
    try {
      let siteName = req.params.siteName,
        siteId = sites.find((site) => site.name === siteName).id,
        cookie = req.cookies['border-px1'];
      // log(siteName);
      // log(siteId);
      // log(cookie);
      if (cookie) {
        let result = await crawler.fetchDomainsBySiteId(siteId, [
          decodeURIComponent(cookie),
        ]);
        if (result.success)
          res.send({
            success: true,
            domains: result.domains.map((domain) => {
              domain['folderPath'] = '';
              return domain;
            }),
          });
        else res.send({ success: false, message: result.message });
      } else
        res.send({
          success: false,
          message: 'Access denied, please login border px1 site',
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
      log(url);
      res.send(await response.json());
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  };
module.exports = { fetchBackendId, fetchDomains, fetchFolderPath };
