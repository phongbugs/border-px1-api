const express = require('express'),
  router = express.Router(),
  infoHandler = require('../handlers/infoHandler');
router.post('/backendId/:domainType/:serverIp', infoHandler.fetchBackendId);
router.get('/domain/:domainType/:siteName', infoHandler.fetchDomains);
router.get('/folder', infoHandler.fetchFolderPath);
router.get('/', (_, res) => res.send('info root page'));
module.exports = router;
