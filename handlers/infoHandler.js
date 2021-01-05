const log = console.log,
  CryptoJS = require('crypto-js'),
  crawler = require('../crawler'),
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
          siteId = global.sites.find((site) => site.name === siteName).id,
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
      log(text);
      res.send(JSON.parse(text));
    } catch (error) {
      res.send({ success: false, message: error.message });
    }
  };
module.exports = { fetchBackendId, fetchDomains, fetchFolderPath };
