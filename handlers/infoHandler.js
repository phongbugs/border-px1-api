const { request } = require('express');

const log = console.log,
  crawler = require('../crawler'),
  sites = require('./sites.map'),
  allServers = require('./servers.map')['allServers'],
  findServerIdByIp = (ip) => allServers.find((server) => server.Name === ip).ID,
  fetchBackendId = async (req, res) => {
    try {
      let serverIp = req.params.serverIp,
        cookie = req.query['border-px1-cookie'];
      //log('serverId: %s', serverId);
      if (cookie) {
        let result = await crawler.fetchBackendId(findServerIdByIp(serverIp), [cookie]);
        if (result.success)
          res.send({
            success: true,
            backendId: result.backendId,
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
  fetchDomains = async (req, res) => {
    try {
      let siteName = req.params.siteName,
        siteId = sites.find((site) => site.name === siteName).id,
        cookie = req.query['border-px1-cookie'];
      // log(siteName);
      // log(siteId);
      // log(cookie);
      if (cookie) {
        let result = await crawler.fetchDomainsBySiteId(siteId, [cookie]);
        if (result.success)
          res.send({
            success: true,
            domains: result.domains,
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
  };
module.exports = { fetchBackendId, fetchDomains };
