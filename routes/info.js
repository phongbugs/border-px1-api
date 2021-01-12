const express = require('express'),
  router = express.Router(),
  infoHandler = require('../handlers/infoHandler');
router.post('/backendId/:domainType/:serverIp', infoHandler.fetchBackendId);
router.get('/domain/:domainType/:siteName', infoHandler.fetchDomains);
router.get('/folder', infoHandler.fetchFolderPath);
router.get('/mobile/', infoHandler.fetchMobileJson);
router.get('/server/', infoHandler.getServerInfo);
router.get('/', (_, res) => res.send('info root page'));
module.exports = router;
